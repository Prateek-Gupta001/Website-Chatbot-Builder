"use strict";
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
console.log(cleanSpecialChars(`
[Newsletter - Sangnak Samvaad](
- [Institute Quality Assurance Cell](
- [NAD](
- [AISHE] (
- [NSS]( | | |
| --- | --- |
| MoA of JIIT as per UGC (Institutions Deemed to be Universities) Regulations, 2023 | [Click Here]( |
| Rules of JIIT as per UGC (Institutions Deemed to be Universities) Regulations, 2023 | [Click Here]( |
| Members List of JIIT Society | [Click Here]( | 
## Enquire Now! Name \* Mobile \* Email \* City \*Select and Middle AndamanSouth akasamSpsr ValleyEast 
KamengEast SiangKra DaadiKurung Kume Dibang ValleyLower SiangUpper SubansiriWest KamengWest MetroKarbi
`));
