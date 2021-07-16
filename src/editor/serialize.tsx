import { Serializer, SerializeMap, SText } from "../atmx";

export const serializeMap: SerializeMap = [
    //inline
    (serializer: Serializer) =>
        Array.of<[mark: string, before: string, after?: string]>(
            ['bold', '**'],
            ['italic', '//'],
            ['underline', '__'],
            ['deleted', '--']
        ).forEach(m => serializer.wrapByMark(...m)),

    //linebreak
    (serializer: Serializer) => {
        let ranges = serializer.find({
            match: (sText, i, sTexts) => [!sTexts[i - 1], !sTexts[i + 1]],//匹配段首,段末
            split: 'paragraph',
            emptyString: true
        })
        for (const range of ranges) {
            serializer.wrap(['', '<br/>'], { range, priortity: 0 })
        }
    },

    //header,quote
    (serializer: Serializer) => {
        let ranges = serializer.find({
            match: (sText, i, sTexts) => [!sTexts[i - 1] && (sText.headerLevel || sText.quoteLevel), !sTexts[i + 1]],//匹配段首/末
            split: 'paragraph'
        })
        for (const range of ranges) {
            let { headerLevel, quoteLevel } = serializer.sTexts[range[0]];
            let str = quoteLevel ? new Array(quoteLevel).fill('>').join('') + ' ' : ''
            str += headerLevel ? new Array(headerLevel).fill('+').join('') + ' ' : ''
            serializer.wrap([str, ''], { range, priortity: 1 })
        }
    },

    //link,color
    (serializer: Serializer) => {
        let ranges = serializer.find({
            match: (sText, i, sTexts) => (sText.link || sText.text.color) ? [true, true] : [false, false],
            split: 'paragraph'
        })
        for (const range of ranges) {
            const link = serializer.sTexts[range[0]].link;
            const color = serializer.sTexts[range[0]].text.color;
            if (link) serializer.wrap([`[${link} `, ']'], { range, priortity: 4 })
            if (color) serializer.wrap([`#${color}|`, '##'], { range, priortity: 3 })//16进制color自带一个#
        }
    }
]