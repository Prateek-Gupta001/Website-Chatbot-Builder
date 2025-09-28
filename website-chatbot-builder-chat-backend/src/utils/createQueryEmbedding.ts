//This is the function for creating the query embedding. 

export default async function createQueryEmbedding(query: string)
{
    const extractor = await global.extractorPromise
    const queryEmebdding = await extractor("Represent this sentence for searching relevant passages: "+ query,  
        {
            pooling: "mean", 
            normalize: true
        }
    )
    return Array.from(queryEmebdding)
}

