import Redis from "ioredis";
import * as dotenv from 'dotenv';
dotenv.config();

declare global {
    var redis: Redis | undefined
}

const redis = global.redis || new Redis (process.env.REDIS_DB_URL || "")

redis.on("error", (err)=>{
    console.log("Got an error while connecting to redis ", err)
})

if(process.env.NODE_ENV !== "production"){
    global.redis = redis;
}

export default redis