//This is the function that .. given the user query .. retrieves the relevant documents to the user.
//Might wanna use a cross encoder here as well.
import qdrantClient from "../db/qdrant"  
import "./intialiseExtractor"

export default async function retrieveRelevantChunks(queryEmebdding: any, PUBLIC_API_KEY: string, limit: number = 5)
{
    //upload the query emebdding to qdrant to recieve relevant text chunks.
    console.log("Now retrieving the relevant chunks here!")
    //check if collection exists or not.
    if(!qdrantClient.collectionExists(PUBLIC_API_KEY))
    {
        console.log("collection with the given public api key doesn't exists ")
        return []
    }
    const searchResults = await qdrantClient.search(PUBLIC_API_KEY,
        {
            vector: queryEmebdding,
            limit: limit,
            with_payload: true
        }
    )
    console.log("\n--- Search Results ---");
    // 6. Process and display the results
    const relevantTextChunks = searchResults.map((result, i) => {
        return result.payload
    });
    console.log("relevantTextChunks ", relevantTextChunks)

    return relevantTextChunks
}

