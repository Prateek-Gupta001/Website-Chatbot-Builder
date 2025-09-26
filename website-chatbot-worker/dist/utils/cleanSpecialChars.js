"use strict";
//This function is for removing the special characters that are there in markdown and also to convert the whole text to markdown. 
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = cleanSpecialChars;
function cleanSpecialChars(inputText) {
    if (typeof inputText !== 'string') {
        return '';
    }
    const textWithoutMarkdown = inputText.replace(/[\[\]()#*|-]/g, '');
    const cleanedText = textWithoutMarkdown.replace(/\s{2,}/g, ' ').trim();
    return cleanedText.toLowerCase();
}
