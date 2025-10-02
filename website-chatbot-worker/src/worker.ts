//This is the main worker file that is going to be taking jobs from the queue and processing them. 
//The worker does the following thing:-
//1. It takes the context from the queue and chunkifies it then creates embeddings for it and then pushes them to qdrant. 
//2. It then updates the mongo db object of the chatbot to make its inProgress field to "Successful"
//3. The main frontend .. i.e the customer's frontned .. keeps polling the main backend which keeps polling the db .. to know what's the status of the chatbot creation. 
//4. The backend .. upon the successful chatbot creation will give the API key to the user to use his/her chatbot. 
//Now on with the worker code. 

import removeBigWordsandURLs from "./utils/removeBigWords";
import cleanSpecialChars from "./utils/cleanSpecialChars";
import redis from "./db/redis";
import fs from "fs"
import * as dotenv from 'dotenv';
import CreateChunks from "./utils/createChunks";
import generateEmbeddings from "./utils/createEmbeddings";
import "./utils/IntialiseExtractor"
import uploadToQdrant from "./utils/uploadToQdrant";
import prisma from "./db/prisma";
import { Progress } from "@prisma/client";
dotenv.config();

// interface FullCrawlResult {
//   success: boolean;
//   status: string;
//   completed: number;
//   total: number;
//   creditsUsed: number;
//   expiresAt: Date;
//   jobId?: string; // Add other properties you see in the object
//   data: CrawlResponse[]; // The array of single pages is here!
// }

//NOTE: I am using any as the types here because firecrawl.dev doesn't provide the right types!!!

async function startWorker()
{
        while(true)
        {    //Put this in an while true loop! 
            let chatbotId 
            try{
                const content = await redis.brpop("jobs", 0)
                if(!content)
                {
                    return 
                }
                console.log("We got some content from redis bruh! ", content[0])
                const jsonContent = JSON.parse(content[1])
                let FullcrawlResponse : any = jsonContent.crawlResponse
                const publicApiKey : string = jsonContent.PUBLIC_API_KEY
                chatbotId = jsonContent.chatbotId
                console.log("crawlResponse recieved whose type is ", typeof(FullcrawlResponse))
                //Step 1: Clean the fucking data. 
                const crawlResponse = FullcrawlResponse.data
                const cleanMarkdownDataArray = crawlResponse.map((e:any)=>{
                    return e.markdown
                })
                const allMarkdownText = cleanMarkdownDataArray.join(" ");
                let cleanText = cleanSpecialChars(removeBigWordsandURLs(allMarkdownText))
                fs.writeFileSync("output.txt", cleanText, "utf-8");


                //Step 2: Create chunks!
                const textChunks = await CreateChunks(cleanText)

                //Step 3: Create embeddings.
                const embeddedTextChunksPromises = textChunks.map(async (chunk) => {
                    const embedding = await generateEmbeddings(chunk);
                    return embedding;
                });

                const embeddedTextChunks: number[][] = await Promise.all(embeddedTextChunksPromises);

                const embeddingsJsonString = JSON.stringify(embeddedTextChunks, null, 2); // The null, 2 makes the JSON pretty
                fs.writeFileSync("embeddings.txt", embeddingsJsonString, "utf-8");
                console.log("Embedding Creation Successful!")
                
                //Step 4: Upload embeddings ... to qdrant.
                //Should you just store all the things that are high compute .. on the disk?
                //mmmm.... for a short while maybe .. but ..not right now man .. let's just first get this thing started man!
                console.log("Beginning uploading to qdrant!")
                const res = await uploadToQdrant(textChunks, embeddedTextChunks, publicApiKey)
                if(res.status == false)
                {
                    return false
                }

                //Step 5: Update the database entry for chatbot.
                await prisma.chatbots.update({
                    where:{
                        chatbotId: chatbotId
                    },
                    data:{
                        status: Progress.Successful
                    }}
                )
            }catch(err)
            {
                await prisma.chatbots.update({
                    where:{
                        chatbotId: chatbotId
                    },
                    data:{
                        status: Progress.Unsucessful
                    }}
                )
                console.log("The worker got into an error while trying to process! ", err)
            }
    }
}

startWorker()


//Step 1 in cleaning the data is 
//Step 1: Remove Big words and links and stuff.
//Step 2: Remove new line characters and and hashtags and stuff and forward slashes and stuff like that. 
//Step 3: 







