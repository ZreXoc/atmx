import { Serializer, SerializeMap, SText } from "../atmx";

export const serializeMap: SerializeMap = [
    //inline
    (serializer: Serializer) =>
        Array.of<[mark: string, before: string, after?: string]>(
            ['bold', '**'],
            ['italic', '//'],
            ['underline', '__'],
            ['deleted', '--']
        ).forEach(v => serializer.wrapByMark(...v)),

    (serializer: Serializer) => {
        let ranges = serializer.find({
            match: (sText, i, sTexts) => [!sTexts[i - 1], !sTexts[i + 1]],//匹配段首/末
            splitBy: 'paragraph'
        })
        for (const range of ranges) {
            serializer.wrap(['', '<br/>'], { range, priortity: 0 })
        }
    },
    //header,quote
    (serializer: Serializer) => {
        let ranges = serializer.find({
            match: (sText, i, sTexts) => [!sTexts[i - 1] && (sText.headerLevel || sText.quoteLevel), !sTexts[i + 1]],//匹配段首/末
            splitBy: 'paragraph'
        })
        for (const range of ranges) {
            let { headerLevel, quoteLevel } = serializer.sTexts[range[0]];
            let str = quoteLevel ? new Array(quoteLevel).fill(' ').join('') + '> ' : ''
            str += headerLevel ? new Array(headerLevel).fill('+').join('') + ' ' : ''
            serializer.wrap([str, ''], { range, priortity: 1 })
        }
    }
]