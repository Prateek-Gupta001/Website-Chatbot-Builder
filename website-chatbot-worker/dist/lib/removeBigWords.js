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
console.log(removeBigWordsandURLs(`
    [Newsletter - Sangnak Samvaad](https://www.jiit.ac.in/newsletter-sangnak-samvaad)\n- 
    [Institute Quality Assurance Cell](https://www.jiit.ac.in/IQAC)\n- [NAD](http://nad.gov.in/)\n- [AISHE]
    (https://www.jiit.ac.in/aishe)\n- [NSS](https://www.jiit.ac.in/nss)\n\n|     |     |\n| --- | --- |\n| MoA of JIIT
     as per UGC (Institutions Deemed to be Universities) Regulations, 2023 | [Click Here](https://www.jiit.ac.in/download/file/fid/6717) 
     |\n| Rules of JIIT as per UGC (Institutions Deemed to be Universities) Regulations, 2023 | [Click Here](https://www.jiit.ac.in/download/file/fid/6718) |\n|
      Members List of JIIT Society | [Click Here](https://www.jiit.ac.in/download/file/fid/6719) |\n\n## Enquire Now!\n\nName \\*\n\nMobile 
      \\*\n\nEmail \\*\n\nCity \\*Select City\\*NicobarsNorth and Middle AndamanSouth AndamansAnantapurChittoorEast GodavariGunturKrishnaKurnoolPr
      akasamSpsr NelloreSrikakulamVisakhapatanamVizianagaramWest GodavariY.S.R.AnjawChanglangDibang ValleyEast KamengEast SiangKra DaadiKurung Kume
      yLohitLongdingLower Dibang ValleyLower SubansiriNamsaiPapum PareSiangTawangTirapUpper SiangUpper SubansiriWest KamengWest SiangBaksaBarpetaBo
      ngaigaonCacharChirangDarrangDhemajiDhubriDibrugarhDima HasaoGoalparaGolaghatHailakandiJorhatKamrupKamrup MetroKarbi AnglongKarimganjKokrajhar
      LakhimpurMarigaonNagaonNalbariSivasagarSonitpur
    TinsukiaUdalguriArariaArwalAurangabadBankaBegusaraiBhagalpurBhojpurBuxarDarbhangaGayaGopalganjJamuiJehanabadKaimur
    `));
