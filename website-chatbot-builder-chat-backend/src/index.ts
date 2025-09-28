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
import classifyUserQuery from "./utils/classifier";
import type { ModelMessage } from "ai";
import createQueryEmbedding from "./utils/createQueryEmbedding";
import retrieveRelevantChunks from "./utils/retrieveRelevantChunks";
import LLMCall from "./utils/llmCall";

const app = express()
app.use(cors())



app.use(express.json())

app.post("/chat", async function(req: Request, res: Response){
    const body = req.body
    const authorizationHeader = req.headers["Authorization"]
    if(!authorizationHeader)
    {
        return res.status(401).json({
            msg: "No authorization header found!"
        })
    }
    const headerValue = Array.isArray(authorizationHeader) ? authorizationHeader[0] : authorizationHeader
    const PUBLIC_API_KEY = headerValue.split(' ')[1]; 
    let messages : ModelMessage[] = body.messages
    //If messages list is just the user message i.e its length is 1.
    //Then create a new conversation Id and then send that messageId to the backend for creating a conversation to be stored in the db.

    if(messages[-1].role != "user")
    {
        return res.status(500).json({
            msg: "Last message cannot be from someone other than the user."
        })
    }
    const someUserInformation = body.someUserInformation //This will come from the frontend itself .. someway to identify the user .. so that we can store the chats in
    //in some personal manner for the user!
    const record = await prisma.chatbots.findUnique({
        where:{
            PUBLIC_API_KEY: PUBLIC_API_KEY
        },
        select:{
            DOMAINS: true,
            user: true
        }
    })
    if(!record?.DOMAINS)
    {
        return res.status(413).json({
            err: "No whitelisted "
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
    const domain = req.hostname;
    const domainCheck = record.DOMAINS.includes(domain)
    if(!domainCheck)
    {
        return res.status(403).json({
            msg: "Request came from a domain other than the whitelisted domain!"
        })
    }
    //First check if their plan has expired .. if not then check do they have enough messages left.
    const planExpiryDate = record.user.planExpires
    const today = new Date()
    if(planExpiryDate > today)
    {
        return res.status(403).json({
            msg: "Your plan has expired! Please renew it!"
        })
    }
    const messagesLeft = record.user.messages
    if(messagesLeft == 0)
    {
        return res.status(429).json({
            msg: "You have exceeded your messages limit. Please recharge!"
        })
    }
    //Every message will need to be classified by the LLM first .. a simple and plain LLM ... that classifies it as RAG required or not. 
    const classification = await classifyUserQuery(messages)
    console.log("Messages being sent for classifcation are ", messages)
    console.log("Last user request was ", messages[-1])
    if(!classification.startsWith("<RAG>"))
    {
        //This is the simple user response to the user query.
        return classification
    }
    const queryToBeEmbedded = classification.match(/<RAG>\s*([\s\S]*?)\s*<\/RAG>/)
    if(!queryToBeEmbedded)
    {
        //VERY VERY RARE CASE.
        return res.status(500).json({
            msg: "The classifcation LLM fucked up and gave a wrong response."
        })
    }
    const queryEmebdding = await createQueryEmbedding(queryToBeEmbedded[1])
    const relevantTextChunks = await retrieveRelevantChunks(queryEmebdding, PUBLIC_API_KEY)
    


    //We will be using the AI SDK by vercel right here for making calls to the LLM. 
    const userIntialQuery = messages[-1].content 
    const relevantContext = relevantTextChunks.join(" ")
    messages[-1].content = `You have been given some text which might or might now contain relevant information about the user query.
    Do your best to answer the user query based on the text provided to you:
    ##Relevant Context:
    ${relevantContext}

    #User query:
    ${userIntialQuery}
    `
    


    //All the tests passed! Now proceed with the LLM Call. 
    //Append the relevant text chunks to the user messages. 
    const textStream = await LLMCall(messages, userId)

    const finalResponse = await textStream.text;
    messages.concat({
        role:"assistant",
        content: finalResponse
    })
    
    //append this to the messages variable right there and store in the mongo db chat.


    //We can have something like a tool call .. in which when the LLM has enough info .. or wants to get enough info .. he or she .. 

    //The code snippet that you will send to the user .. can be framework dependent as well ... meaning if you're using NextJs ..then you should use
    //the features of next js if you can for getting the session and all. 


})


app.listen(3000, ()=>{
    console.log("The app is running right now!")
})



//Things to do basically ..
//MAKE THE FUCKING FRONTEND FOR THIS OH MY GOD. 
//ALSO ADD RAZORPAY AND LEMON SQUEEZY FOR THIS. 
//THEN ALL THAT WILL REMAIN IS SALES.
//LOTS OF FUCKING SALES.
//LIKE EVEN IF WE GET LIKE FUCKING 5 BRANDS .. THEN AT 10 DOLLARS WE WOULD BE GETTING 50 DOLLARS FOR THAT WEEK ... WHICH IS LIKE.
//AND GOD WILLING THEY GET THE MONTHLY PLAN ... THEN THAT WILL BE 125 DOLLARS.
//LET'S AIM FOR 20 WEBSITES. .... IF I GET 20 WEBSITES THEN I WILL BE LIKE HAVING SOME DECENT FUCKING INCOME. 


