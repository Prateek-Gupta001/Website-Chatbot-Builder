"use strict";
//This is the main file in which we will be creating the emebddings!
//Now this process is going to take the most amount of time if you don't have a VM that has a GPU ... 
//so let's see how this one goes. 
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
exports.default = generateEmbeddings;
function generateEmbeddings(input_text) {
    return __awaiter(this, void 0, void 0, function* () {
        const extractor = yield global.extractor;
        let output;
        try {
            output = yield extractor(input_text, { pooling: 'mean', normalize: true });
        }
        catch (err) {
            console.log("Got this error right here ", err);
        }
        //@ts-expect-error
        return Array.from(output);
    });
}
