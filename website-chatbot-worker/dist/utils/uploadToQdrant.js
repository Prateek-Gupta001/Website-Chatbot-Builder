"use strict";
//This is the helper function that would upload the embeddings to qdrant. 
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const jsonString = fs_1.default.readFileSync("embeddings.txt", "utf-8");
const loadedEmbeddings = JSON.parse(jsonString);
console.log("shape ", loadedEmbeddings.length);
console.log("type ", loadedEmbeddings["1"][0].type);
console.log("dims ", loadedEmbeddings["1"][0].dims);
console.log("data ", loadedEmbeddings["1"][0].data);
console.log("size ", loadedEmbeddings["1"][0].size);
console.log("shape ", loadedEmbeddings[0]);
