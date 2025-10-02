//This is the function that .. given the user query .. retrieves the relevant documents to the user.
//Might wanna use a cross encoder here as well.
import qdrantClient from "../db/qdrant"  
import "./intialiseExtractor"

export default async function retrieveRelevantChunks(queryEmebdding: any, PUBLIC_API_KEY: string, limit: number = 5)
{
    //upload the query emebdding to qdrant to recieve relevant text chunks.
    console.log("The query embedding right here is ", queryEmebdding)
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
        console.log(`\nResult ${i + 1}:`);
        console.log(`  Score: ${result.score.toFixed(4)}`); // Cosine similarity score
        console.log("  Payload:", result.payload); // The original data you stored
        return result.payload
    });

    return relevantTextChunks
}

// async function sampleFunction(){
//     const queryvector = await createQueryEmbedding("What were the placements in JIIT like?")
//     const relevantTextChunks = await  retrieveRelevantChunks(queryvector, "e4c3642c37cab8b69c57d94f1554cdd495dad9a36adcdf419739f7d2006cec5a")
//     console.log("Relevant Text Chunks ", relevantTextChunks)
// }

// sampleFunction()
