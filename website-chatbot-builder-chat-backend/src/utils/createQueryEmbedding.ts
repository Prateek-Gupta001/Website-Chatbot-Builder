//This is the function for creating the query embedding. 

export default async function createQueryEmbedding(query: string)
{
    console.log("Creating the query embedding!")
    let result: any;
    try{
        const extractor = await global.extractorPromise
        const queryEmebdding = await extractor("Represent this sentence for searching relevant passages: "+ query,  
            {
                pooling: "mean", 
                normalize: true
            })
        result = queryEmebdding
        
    }catch(err)
    {
        console.log("Got this error while creating the query embedding")
    }
    return Array.from(result.data)
}

