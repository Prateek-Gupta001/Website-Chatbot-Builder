//This is the main function that executes the call to the LLM with the desired/relevant chunks/context. 

import { ModelMessage, streamText } from "ai";
import prisma from "../db/prisma";
import { google } from "@ai-sdk/google";
import { Prisma } from "@prisma/client";


export default async function LLMCall(messages: ModelMessage[], userId: string, systemPrompt : string, conversationId: string)
{
    await prisma.users.update({
        where:{
            id: userId
        },
        data:{
            messagesLimit:{
                decrement: 1
            }
        }
    })
    const result = await streamText({
        model: google("gemini-2.5-pro"),
        system: systemPrompt,
        messages: messages,
        async onFinish({text})
        {
        messages.concat({
            role:"assistant",
            content: text,
        })
        console.log("Adding messages to the conversation... conversationId ", conversationId)
        await prisma.conversations.update({
            where:{
                conversationId: conversationId
            },
            data:{
                messages: messages as unknown as Prisma.InputJsonValue
            }
        })
        }
    })
    return result
}