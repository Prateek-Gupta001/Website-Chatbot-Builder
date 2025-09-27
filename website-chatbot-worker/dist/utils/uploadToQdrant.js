"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = uploadToQdrant;
//This is the helper function that would upload the embeddings to qdrant. 
const qdrant_1 = __importDefault(require("../db/qdrant"));
function uploadToQdrant(chunks, embeddings, publicApiKey) {
    return __awaiter(this, void 0, void 0, function* () {
        if (embeddings.length != chunks.length) {
            console.log("Emebddings and chunks lenght ", embeddings.length, " ", chunks.length);
            console.log("The length of the embeddings list and the chunks list doesn't match!");
            return {
                status: false,
                error: "The length of the embeddings list and the chunks list doesn't match!"
            };
        }
        //Create a collection with the publicApiKey as the name. 
        //Upsert collections/points on it. 
        const collection_name = publicApiKey;
        const vector_size = embeddings["1"][0].size;
        const distance_metric = "Dot";
        try {
            yield qdrant_1.default.createCollection(collection_name, {
                vectors: {
                    size: vector_size,
                    distance: distance_metric
                }
            });
            console.log("Collection Name ", publicApiKey, " created successfully!");
        }
        catch (err) {
            console.log("Got an error here while trying to create a collection ", err);
            return {
                status: false,
                error: err
            };
        }
        let id = 0;
        let points = [];
        for (let i = 0; i < chunks.length; i++) {
            const vectorData = embeddings[i.toString()][0].data;
            const vectorAsArray = Array.isArray(vectorData) ? vectorData : Object.values(vectorData);
            points.push({
                id: i,
                vector: vectorAsArray,
                payload: { text: chunks[i] }
            });
        }
        try {
            const upsertOperation = yield qdrant_1.default.upsert(collection_name, {
                wait: true,
                points: points
            });
            console.log("Qdrant Upsert Operation Successful! ");
            return {
                status: true
            };
        }
        catch (err) {
            console.log("Got an error while upserting ", err);
            return {
                status: false
            };
        }
        // qdrantClient.upsert()
    });
}
//Okay so now there is a bunch of things... first is the domain configuration right here .. 
//So ... when should you ask the user .. which domains he or she needs configured. 
//Well I am guessing at the start would be fine. I don't think it would be that bad .. though .. I think the lesser the friction till payment the better off it would be .. 
// import fs from "fs"
// const jsonString = fs.readFileSync("embeddings.txt", "utf-8")
// const loadedEmbeddings = JSON.parse(jsonString)
// //Now in qdrant we would just pass in the chunks and along with them thier embeddings. 
// console.log("shape ", loadedEmbeddings.length)
// console.log("type ", loadedEmbeddings["1"][0].type)
// console.log("dims ", loadedEmbeddings["1"][0].dims)
// console.log("data ", loadedEmbeddings["1"][0].data)
// console.log("size ", loadedEmbeddings["1"][0].size)
// console.log("shape ", loadedEmbeddings[0])
