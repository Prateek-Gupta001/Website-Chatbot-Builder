"use strict";
//This is the main worker file that is going to be taking jobs from the queue and processing them. 
//The worker does the following thing:-
//1. It takes the context from the queue and chunkifies it then creates embeddings for it and then pushes them to qdrant. 
//2. It then updates the mongo db object of the chatbot to make its inProgress field to "Successful"
//3. The main frontend .. i.e the customer's frontned .. keeps polling the main backend which keeps polling the db .. to know what's the status of the chatbot creation. 
//4. The backend .. upon the successful chatbot creation will give the API key to the user to use his/her chatbot. 
//Now on with the worker code. 
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const removeBigWords_1 = __importDefault(require("./utils/removeBigWords"));
const cleanSpecialChars_1 = __importDefault(require("./utils/cleanSpecialChars"));
const redis_1 = __importDefault(require("./db/redis"));
const fs_1 = __importDefault(require("fs"));
const dotenv = __importStar(require("dotenv"));
const createChunks_1 = __importDefault(require("./utils/createChunks"));
const createEmbeddings_1 = __importDefault(require("./utils/createEmbeddings"));
require("./utils/IntialiseExtractor");
const uploadToQdrant_1 = __importDefault(require("./utils/uploadToQdrant"));
const prisma_1 = __importDefault(require("./db/prisma"));
const client_1 = require("@prisma/client");
dotenv.config();
// interface FullCrawlResult {
//   success: boolean;
//   status: string;
//   completed: number;
//   total: number;
//   creditsUsed: number;
//   expiresAt: Date;
//   jobId?: string; // Add other properties you see in the object
//   data: CrawlResponse[]; // The array of single pages is here!
// }
//NOTE: I am using any as the types here because firecrawl.dev doesn't provide the right types!!!
let i = 0;
function startWorker() {
    return __awaiter(this, void 0, void 0, function* () {
        while (true) { //Put this in an while true loop!  
            try {
                const content = yield redis_1.default.brpop("jobs", 0);
                if (!content) {
                    return;
                }
                console.log("We got some content from redis bruh! ", content[0]);
                const jsonContent = JSON.parse(content[1]);
                let FullcrawlResponse = jsonContent.crawlResponse;
                const publicApiKey = jsonContent.PUBLIC_API_KEY;
                const chatbotId = jsonContent.chatbotId;
                console.log("crawlResponse recieved whose type is ", typeof (FullcrawlResponse));
                //Step 1: Clean the fucking data. 
                const crawlResponse = FullcrawlResponse.data;
                const cleanMarkdownDataArray = crawlResponse.map((e) => {
                    return e.markdown;
                });
                const allMarkdownText = cleanMarkdownDataArray.join(" ");
                let cleanText = (0, cleanSpecialChars_1.default)((0, removeBigWords_1.default)(allMarkdownText));
                fs_1.default.writeFileSync("output.txt", cleanText, "utf-8");
                //Step 2: Create chunks!
                const textChunks = yield (0, createChunks_1.default)(cleanText);
                //Step 3: Create embeddings.
                const embeddedTextChunksPromises = textChunks.map((chunk) => __awaiter(this, void 0, void 0, function* () {
                    const embedding = yield (0, createEmbeddings_1.default)(chunk);
                    return embedding;
                }));
                const embeddedTextChunks = yield Promise.all(embeddedTextChunksPromises);
                const embeddingsJsonString = JSON.stringify(embeddedTextChunks, null, 2); // The null, 2 makes the JSON pretty
                fs_1.default.writeFileSync("embeddings.txt", embeddingsJsonString, "utf-8");
                console.log("Embedding Creation Successful!");
                //Step 4: Upload embeddings ... to qdrant.
                //Should you just store all the things that are high compute .. on the disk?
                //mmmm.... for a short while maybe .. but ..not right now man .. let's just first get this thing started man!
                console.log("Beginning uploading to qdrant!");
                const res = yield (0, uploadToQdrant_1.default)(textChunks, embeddedTextChunks, publicApiKey);
                if (res.status == false) {
                    return false;
                }
                //Step 5: Update the database entry for chatbot.
                yield prisma_1.default.chatbots.update({
                    where: {
                        chatbotId: chatbotId
                    },
                    data: {
                        status: client_1.Progress.Successful
                    }
                });
            }
            catch (err) {
                console.log("The worker got into an error while trying to process! ", err);
            }
        }
    });
}
startWorker();
//Step 1 in cleaning the data is 
//Step 1: Remove Big words and links and stuff.
//Step 2: Remove new line characters and and hashtags and stuff and forward slashes and stuff like that. 
//Step 3: 
