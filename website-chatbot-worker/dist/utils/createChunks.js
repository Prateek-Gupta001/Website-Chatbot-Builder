"use strict";
//This function takes in a whole string ..and returns chunks of that string (of 5000 characters).
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CreateChunks;
const textsplitters_1 = require("@langchain/textsplitters");
function CreateChunks(cleanedText) {
    return __awaiter(this, void 0, void 0, function* () {
        const splitter = new textsplitters_1.RecursiveCharacterTextSplitter({
            chunkSize: 1500,
            chunkOverlap: 100,
        });
        const chunks = yield splitter.createDocuments([cleanedText]);
        //We only need the text chunks
        const textChunks = chunks.map((e) => {
            return e.pageContent;
        });
        console.log("Length of textChunks ", textChunks.length);
        return textChunks;
    });
}
