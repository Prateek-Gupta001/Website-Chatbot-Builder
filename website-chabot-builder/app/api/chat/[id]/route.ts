import axios from "axios";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export default async function POST(req: NextRequest, { params } : {params: { id: string }})
{
    const { id } = params;
    const session = await getServerSession(authOptions);
    const chatBackendUrl = process.env.CHAT_BACKEND_URL
    console.log("This is the publicapikey for the chatbot ", id)
    const body = await req.json()
    const messages = body.messages
    const conversationId = body.conversationId //this is a scene here cause it won't be there in the first request .. will only be there in the first one .. 
    //and also what the fuck .. why do I gotta make another endpoint just to fucking relay the request .. just use the chatone bro ...lol .. just 
    //use that one .. and go with that. 
    axios.post(`${chatBackendUrl}/chat`, {
        messages: messages,
        someUserInformation: session,

    })
}