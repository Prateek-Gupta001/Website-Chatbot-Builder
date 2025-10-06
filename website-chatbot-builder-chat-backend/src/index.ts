//This is going to be the main chatbackend for our chat application. 
//This is going to take in the public api key of the user .. check if it is coming from the whitelisted domains list that the user had setup at the time of creation. 
//Then check the limits of that the user ..... i.e for the number of messages he or she can send. 
//There would need to be a cron job which would go via the users records and then check when their plan expires ... 
//Also! Check for when the user plan is expiring and if it has expired then don't allow messages to go via. 
//The plan field .. and the planExpires field can only renew after a payment or something. 
//This file will require the use of mongo db and qdrant

import express, { text } from "express"
import cors from "cors";
import { Request } from "express";
import { Response } from "express";
import prisma from "./db/prisma";
import { Prisma } from "@prisma/client";
import classifyUserQuery from "./utils/classifier";
import type { ModelMessage } from "ai";
import createQueryEmbedding from "./utils/createQueryEmbedding";
import retrieveRelevantChunks from "./utils/retrieveRelevantChunks";
import LLMCall from "./utils/llmCall";
import "./utils/intialiseExtractor"

const app = express()
app.use(cors())


app.use(express.json())

app.post("/chat", async function(req: Request, res: Response){
    const body = req.body
    const authorizationHeader = req.headers["authorization"]
    if(!authorizationHeader)
    {
        return res.status(401).json({
            msg: "No authorization header found!"
        })
    }
    const headerValue = Array.isArray(authorizationHeader) ? authorizationHeader[0] : authorizationHeader
    const PUBLIC_API_KEY = headerValue.split(' ')[1]; 
    let messages : ModelMessage[] = body.messages

    //Then create a new conversation Id and then send that messageId to the backend for creating a conversation to be stored in the db.
    console.log("messages are  ", messages)
    console.log("messages -1 is ", messages[messages.length -1])
    console.log("messages -1 role is ", messages[messages.length -1].role)
    if(messages[messages.length -1].role != "user")
    {
        return res.status(500).json({
            msg: "Last message cannot be from someone other than the user."
        })
    }
    const someUserInformation = body.someUserInformation //This will come from the frontend itself .. someway to identify the user .. so that we can store the chats in
    console.log("The public api key here is ", PUBLIC_API_KEY)
    //in some personal manner for the user!
    const record = await prisma.chatbots.findUnique({
        where:{
            PUBLIC_API_KEY: PUBLIC_API_KEY
        },
        select:{
            DOMAINS: true,
            user: true,
            chatbotId: true,
            systemPrompt: true
        }
    })
    if(!record?.DOMAINS)
    {
        return res.status(413).json({
            err: "No whitelisted domains found!"
        })
    }
    if(!record.user)
    {
        return res.status(500).json({
            err: "No user with the corresponding chatbot found!"
        })
    }
    //Check if the request came from the whitelisted domain or not. 
    const userId = record.user.id
    let conversationId = body.conversationId || null //If this is undefined .. i.e the frontend didn't send one back then you will have create one here .. and 
    //that is only going to happen if a new conversation was made .. the UI .. once the response is sent from the backend will store the conversation id inside a state variable 
    //that its then going to use for further axios.post requests. 
    //THIS IS GOING TO BE THE KEY FOR MANAGING THE CONVERSATION FLOW/STATE (STATE MEANING THE HISTORY HERE!).
    //If messages list is just the user message i.e its length is 1.
    if(messages.length === 1 && messages[0].role === "user" && !conversationId)
    {
        //THIS IS THE FIRST MESSAGE FOR A CONVERSATION! CREATE A MESSAGE ID AND STORE IT IN MONGO DB.
        console.log("Creating a new conversation!")
        let conversationRecord = await prisma.conversations.create({
            data:{
                chatbotId: record.chatbotId,
                messages: messages as unknown as Prisma.InputJsonValue
            }
        })
        conversationId = conversationRecord.conversationId
    }
    //This is going to be the key for keeping the messages/conversations up to date.
    //You know this needs to be like fully up to date.
    //So even if something goes wrong after this .. and the assistant's response is not there then you can still have the conversation stored there!
    await prisma.conversations.update({
        where:{
            conversationId: conversationId
        },
        data:{
            messages: messages as unknown as Prisma.InputJsonValue
        }
    })

    const domain = req.hostname;
    console.log("domain ", domain)
    const domainCheck = record.DOMAINS.includes(domain)
    // if(!domainCheck) 
    // {
    //     return res.status(403).json({
    //         msg: "Request came from a domain other than the whitelisted domain!"
    //     })
    // }
    //First check if their plan has expired .. if not then check do they have enough messages left.
    const planExpiryDate = record.user.planExpires
    const today = new Date()
    console.log("planExpiryDate ", planExpiryDate, " today ", today)
    if(planExpiryDate < today)
    {
        return res.status(403).json({
            msg: "Your plan has expired! Please renew it!"
        })
    }
    const messagesLeft = record.user.messagesLimit
    console.log("Messages Left ", messagesLeft)
    if(messagesLeft === 0)
    {
        return res.status(429).json({
            msg: "You have exceeded your messages limit. Please recharge!"
        })
    }
    //Every message will need to be classified by the LLM first .. a simple and plain LLM ... that classifies it as RAG required or not. 
    const classification = await classifyUserQuery(messages)
    console.log("Messages being sent for classifcation are ", messages)
    console.log("Last user request was ", messages[messages.length -1])
    if(!classification)
    {
        return res.status(500).json({
            msg: "No classification received!"
        })
    }
    if(!classification.startsWith("<RAG>"))
    {
        //This is the simple user response to the user query.
        return res.status(200).json({
            response: classification
        })
    }
    const queryToBeEmbedded = classification.match(/<RAG>\s*([\s\S]*?)\s*<\/RAG>/)
    if(!queryToBeEmbedded)
    {
        //VERY VERY RARE CASE.
        return res.status(500).json({
            msg: "The classifcation LLM fucked up and gave a wrong response."
        })
    }
    console.log("Query being embedded here is ", queryToBeEmbedded[1])
    const queryEmebdding = await createQueryEmbedding(queryToBeEmbedded[1])
    const relevantTextChunks = await retrieveRelevantChunks(queryEmebdding, PUBLIC_API_KEY)
    

    //We will be using the AI SDK by vercel right here for making calls to the LLM. 
    const userIntialQuery = messages[messages.length -1].content 
    //@
    const relevantContext =relevantTextChunks.map(chunk => chunk?.text ?? "").join("\n");

    messages[messages.length -1].content = `You have been given some text which might or might now contain relevant information about the user query.
    Do your best to answer the user query based on the text provided to you:
    ##Relevant Context:
    ${relevantContext}

    #User query:
    ${userIntialQuery}
    `
    console.log("The new messages array being fed into the LLM Call is ", messages)
    console.log("The system prompt being passed to the LLM is ", record.systemPrompt)

    //All the tests passed! Now proceed with the LLM Call. 
    //Append the relevant text chunks to the user messages. 
    const textStream = await LLMCall(messages, userId, record.systemPrompt, conversationId)

    //Stream the textual response to the frontend.
    if(conversationId)
    {
        res.setHeader('X-Conversation-Id', conversationId);
    }
    textStream.pipeUIMessageStreamToResponse(res)
})


app.listen(3001, ()=>{
    console.log("The app is running right now at port 3001!")
})



//Things to do basically ..
//MAKE THE FUCKING FRONTEND FOR THIS OH MY GOD. 
//ALSO ADD RAZORPAY AND LEMON SQUEEZY FOR THIS. 
//THEN ALL THAT WILL REMAIN IS SALES.
//LOTS OF FUCKING SALES.
//LIKE EVEN IF WE GET LIKE FUCKING 5 BRANDS .. THEN AT 10 DOLLARS WE WOULD BE GETTING 50 DOLLARS FOR THAT WEEK ... WHICH IS LIKE.
//AND GOD WILLING THEY GET THE MONTHLY PLAN ... THEN THAT WILL BE 125 DOLLARS.
//LET'S AIM FOR 20 WEBSITES. .... IF I GET 20 WEBSITES THEN I WILL BE LIKE HAVING SOME DECENT FUCKING INCOME. 


//Okay now what all is remaining in this application:
//1. The emebed.js script .. that is the main frontend script that people are going to be having in their application.
//   Mainly I think I am going to be focusing on next js and react projects only .. and I think that's gonna be okay.
//2. The frontend for the admin backend that is there .. its gotta be really neat and clean with good UI so that people think its legit. 
//3. You gotta get the chatbot on the admin frontend as well to chat and stuff and also there in the emebd.js script.

//Okay so maybe I can just build the frontend for the admin frontend first. 
//That way we would be able to do use the chat thing to ..
//So the things that are remaining are:
// 1. Admin Frontend.
// 2. Chat Frontend (to be distributed to the users.)
// 3. Payment system (for intialising the plans and the limits and so on)
