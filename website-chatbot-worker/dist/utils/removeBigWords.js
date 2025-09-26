"use strict";
//This function is to remove extremely long words and urls from the markdown text. 
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = removeBigWordsandURLs;
function removeBigWordsandURLs(inputText) {
    if (typeof inputText !== 'string') {
        return '';
    }
    const textWithoutUrls = inputText.replace(/https?:\/\/\S+/g, '');
    const textWithoutLongWords = textWithoutUrls.replace(/\b\S{16,}\b/g, '');
    const cleanedText = textWithoutLongWords.replace(/\s{2,}/g, ' ').trim();
    return cleanedText;
}
