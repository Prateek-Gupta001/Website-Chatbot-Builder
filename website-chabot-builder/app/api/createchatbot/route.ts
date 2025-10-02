import { NextRequest, NextResponse } from "next/server";
import FirecrawlApp, { CrawlParams, CrawlStatusResponse } from '@mendable/firecrawl-js';
import { pipeline } from '@huggingface/transformers';
import checkURL from "@/lib/urlChecker";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from 'uuid';
import redis from '@/db/redis'; // Adjust the import path as needed
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/db/prisma";
import { Progress } from "@prisma/client";
import { InputJsonValue } from "@prisma/client/runtime/library";
import qdrantClient from "@/db/qdrant";
import crypto from "crypto"




const app = new FirecrawlApp({apiKey: process.env.FIRECRAWL_API_KEY});


export async function POST(req: NextRequest, res: Response)
{
    // const session = await getServerSession(authOptions);
    const session =  { 
    user: {
    name: 'Prateek Gupta',
    email: 'pg6044@gmail.com',
    image: 'https://lh3.googleusercontent.com/a/ACg8ocJfG0eSFdxuNfeGOnYDRFRFwqQJio89jPvt4eAh026AZOHgoLlOEg=s96-c',
    id: '68d136c7fc9d3067160ceb49'
  },
  expires: '2025-10-23T05:01:39.601Z'
}
    const userId = session.user.id
    if(!userId)
    {
        return NextResponse.json({
            msg: "undefined user!"
        })
    }
    const body = await req.json()
    console.log("The body of the post request is ", body)
    //TODO: Make sure the following things: the limit and the docs size are in check with the pricing Plan limits. 
    const website_url: string = body.website_url
    const limit: number = body.limit
    const domains: string[] = body.domains 
    //These are the documents added by the website owner itself... for additional context
    const docs = body.docs
    const publicApiKey = crypto.randomBytes(32).toString('hex');
    //check that if the website is legit or not.
    const status = await checkURL(website_url)
    if(!status)
    {
        return NextResponse.json({
            msg: "Not a valid website URL!"
        },
        {status: 409}
    )
    }
    console.log("Website checked! ", status, " ", website_url)
    //use firecrawl API to scrape the website.
    // Crawl a website
    let crawlResponse
    try{
    console.log("Beginning the crawling process...")
    //Crawl jobs are time consuming and expensive .. so maybe just cache the result i.e store the result in mongo and if the user provides the same
    //wesbite_url and limit then you can just give that result to him/her. 
    //But that will rarely happen in production and for testing right now ... you can just skip this step and get a result form the output.json file
    //right there. 
    // crawlResponse = await app.crawlUrl(website_url, {
    // limit: limit,
    // allowBackwardLinks: true,
    // scrapeOptions: {
    //     formats: ['markdown']
    // }
    // })
    const filePath = path.join(process.cwd(), "lib", "output.json");
    const fileContent = fs.readFileSync(filePath, "utf-8");
    crawlResponse = JSON.parse(fileContent); 

    console.log("Crawling Process Completed! ")
    }catch(err)
    {
        console.log("Error while scraping ", err)
        return NextResponse.json({
            msg: "Got an error while scraping the website!"
        },
    {
        status: 500
    })
    }
    // if (!crawlResponse.success) {
    //     console.log(`Failed to crawl: ${crawlResponse.error}`)
    //     return NextResponse.json({
    //     msg: "Failed to crawl"
    //     })
    // }

    let chatbotId;
    const defaultDomain = "websitechatbotbuilder.com" //This is for sending the requests via the admin backend for trial of the chatbot by the user!
    try{
        //also create an object in mongo with unique id scraping id in mongo which will later be updated 
        //and also check if it already exists inside the mongo object or not ... but what if one person wants too .. and they have already spent the money .. but anway. 
        
        const res = await prisma.chatbots.create({
            data:{
                userId, 
                DOMAINS: [defaultDomain, ...domains],
                PUBLIC_API_KEY: publicApiKey,
                websiteURL: website_url,
                status: Progress.inProgress,
                crawlResponse: crawlResponse as unknown as InputJsonValue
            }
        })
        console.log("Made the entry in Mongo!")
        chatbotId = res.chatbotId
        console.log("chatbotId ", chatbotId)
        //PUSH THE JOB TO REDIS!... 
        await redis.lpush("jobs", JSON.stringify({
            crawlResponse,
            PUBLIC_API_KEY: publicApiKey,
            userId,
            chatbotId //It needs the chatbotId for updating the entry in the database. 
        }))
        console.log("Made the entry to Redis!")
        //This will then be picked up the worker!
        console.log("Redis commands executed!")
    }catch(err)
    {
        console.log("err ", err)
    }
    return Response.json({
        msg:"Website Creation Process has been started!",
        chatbotId: chatbotId
    },
    {
        status:200
    }
)
    //Okay so here is what we can do for the user:
    //1. We can start the embedding generation and ingestion into the Qdrant database in the backend and just show it to the user .. 
    //The user will be shown a sidebar in which they will be showed the status of their chatbot... the frontend will peridically poll the backend 
    //about is the chatbot ready is the chatbot ready .... and when it is .. the backend will send the right request .. i.e the confirmation. 
    //It will basically send the code snippet there for how to place the chatbot on your website...
    //Now we need to write the basic function for how we would go about placing those embeddings .. after creating them into the qdrant database. 
 
}





//My personal loggings:
//The user will have the choice to add documents then and there at the start of the scraping process. 
//If the user decides to go forward with it then we will add his/her documents to the text corpus itself .. if not then we will just show him
//a dialog box saying that you can add it in the future by going to >Add Docs then adding the docs there.
//We can have a one time payment of 49 dollars to remove the water mark as well 
