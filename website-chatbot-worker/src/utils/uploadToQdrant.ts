//This is the helper function that would upload the embeddings to qdrant. 
import qdrantClient from "../db/qdrant"



export default async function uploadToQdrant(chunks: string[],embeddings: any, publicApiKey: string)
{
    console.log("The length of the embeddings list and the chunks list doesn't match!")
    if(embeddings.length != chunks.length)
    {
        return {
            status: false,
            error: "The length of the embeddings list and the chunks list doesn't match!"
        } 
    }
    //Create a collection with the publicApiKey as the name. 

    //Upsert collections/points on it. 
    const collection_name = publicApiKey
    const vector_size = embeddings["1"][0].size
    const distance_metric = "Dot"
    try{
        await qdrantClient.createCollection(collection_name, {
            vectors:{
                size: vector_size,
                distance: distance_metric
            }
        })
        console.log("Collection Name ", publicApiKey, " created successfully!")
    }catch(err)
    {
        console.log("Got an error here while trying to create a collection")
        return {
            status: false, 
            error : err
        }
    }
    let id = 0
    let points: any = []
    let sample = 3
    console.log(typeof(embeddings[sample.toString()][0].data))
    for(let i = 0; i < chunks.length; i++)
    {
        points.push({
            id: id+1,
            vector : embeddings[i.toString()][0].data,
            payload: { text: chunks[i]}
        })
    }
    try{
        const upsertOperation = await qdrantClient.upsert(collection_name, 
            {
                wait: true, 
                points:[
                    points
                ]
            }
        )
        console.log("Qdrant Upsert Operation Successful! ")
        return {
            status: true
        }
    }catch(err)
    {
        console.log("Got an error while upserting ", err)
        return {
            status: false
        }
    }

    // qdrantClient.upsert()

}

//Okay so now there is a bunch of things... first is the domain configuration right here .. 
//So ... when should you ask the user .. which domains he or she needs configured. 
//Well I am guessing at the start would be fine. I don't think it would be that bad .. though .. I think the lesser the friction till payment the better off it would be .. 


import fs from "fs"

const jsonString = fs.readFileSync("embeddings.txt", "utf-8")

const loadedEmbeddings = JSON.parse(jsonString)

//Now in qdrant we would just pass in the chunks and along with them thier embeddings. 


console.log("shape ", loadedEmbeddings.length)

console.log("type ", loadedEmbeddings["1"][0].type)
console.log("dims ", loadedEmbeddings["1"][0].dims)
console.log("data ", loadedEmbeddings["1"][0].data)
console.log("size ", loadedEmbeddings["1"][0].size)

console.log("shape ", loadedEmbeddings[0])