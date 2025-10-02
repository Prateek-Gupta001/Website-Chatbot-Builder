//This is the main function that executes the call to the LLM with the desired/relevant chunks/context. 

import { ModelMessage, streamText } from "ai";
import prisma from "../db/prisma";
import { google } from "@ai-sdk/google";

export default async function LLMCall(messages: ModelMessage[], userId: string, systemPrompt : string)
{
    await prisma.users.update({
        where:{
            id: userId
        },
        data:{
            messages:{
                decrement: 1
            }
        }
    })
    const result = await streamText({
        model: google("gemini-2.5-pro"),
        system: systemPrompt,
        messages: messages
    })
    return result
}