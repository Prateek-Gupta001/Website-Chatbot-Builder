//This is going to be the route in which the frontend is going to keep polling the backend on .. which is going to in turn poll the database to check whether
//the chatbot creation process is done or not ... 
//Once it IS done ... send back the code snippet for that and the website for that as well...

import prisma from "@/db/prisma";
import { NextRequest, NextResponse } from "next/server"
import { Progress } from "@prisma/client";


export async function GET(req: NextRequest){
    const searchParms = req.nextUrl.searchParams;
    const chatbotId = searchParms.get("chatbotId")
    if(!chatbotId)
    {
        return NextResponse.json({
            msg: "No ChatbotId provided here!"
        },
    {
        status: 413 //see status code and have the one which conveys that something is missing
    })
    }
    const chatbot = await prisma.chatbots.findUnique({
        where:{
            chatbotId: chatbotId
        },
        select:{
            status: true
        }
    })
    if(chatbot?.status === Progress.Unsucessful)
    {
        return NextResponse.json({
            msg:"Some error occurred while we were trying to create your chatbot ..Please try again or contact us at: ...."
        },
    {
        status: 500
    })
    }
    if(chatbot?.status === Progress.inProgress)
    {
        return NextResponse.json({
            msg: "Chatbot creation still in progress!"
        })
    }
    //Now return the code files and stuff like that ... maybe open a seperate panel in which they can actually chat with the chatbot there and have a good time.
}