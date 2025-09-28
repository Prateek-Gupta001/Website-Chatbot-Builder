//This is the main file in which we will be creating the emebddings!
//Now this process is going to take the most amount of time if you don't have a VM that has a GPU ... 
//so let's see how this one goes. 


export default async function generateEmbeddings(input_text : string)
{
    const extractor = await global.extractorPromise
    let output;
    try{
        output = await extractor(input_text, { pooling: 'mean', normalize: true });
    }catch(err)
    {
        console.log("Got this error right here ", err)
    }
    //@ts-expect-error
    return Array.from(output)
}



