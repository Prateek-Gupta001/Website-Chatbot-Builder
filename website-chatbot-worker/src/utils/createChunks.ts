//This function takes in a whole string ..and returns chunks of that string (of 5000 characters).

import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export default async function CreateChunks(cleanedText : string)
{
    const splitter = new RecursiveCharacterTextSplitter(
        {
            chunkSize: 1500,
            chunkOverlap: 100,
        });
    const chunks = await splitter.createDocuments([cleanedText])
    //We only need the text chunks
    const textChunks = chunks.map((e)=>{
        return e.pageContent
    })
    console.log("Length of textChunks ", textChunks.length)
    console.log("textchunks ", textChunks)
    return textChunks
}



