import { QdrantClient } from "@qdrant/js-client-rest";
import * as dotenv from 'dotenv';
dotenv.config();


declare global {
    var qdrantClient: QdrantClient | undefined
}


const qdrantClient = global.qdrantClient || new QdrantClient({ url: process.env.QDRANT_CLUSTER_URL, apiKey: process.env.QDRANT_API_KEY }) 

if(process.env.NODE_ENV !== "production"){
    global.qdrantClient = qdrantClient;
}

export default qdrantClient