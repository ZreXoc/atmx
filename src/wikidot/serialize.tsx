import { Descendant, NodeEntry, Path } from 'slate';
import { Node, Text } from 'slate'
import { CustomEditor } from 'src/atmx';

type TextRange = {
    from: number;
    to: number;
}

type TextWrapper = TextRange & {
    before: string;
    after: string;
}

type FindOption = {
    match?: (texts: Text[], index: number) => [asStart: boolean | undefined, asEnd: boolean | undefined]
}

enum WrapType {
    pretend,
    attent
}

class TextWrapper2 {
    before = new Array<string[]>(5);
    text: Text;
    after = new Array<string[]>(5);

    wrap(
        [before, after]: [string, string],
        option?: {
            priortity: 0 | 1 | 2 | 3 | 4
            type: [WrapType, WrapType]
        }) {
        option = Object.assign({
            priortity: 2
        }, option)
        option.type[0] === WrapType.pretend ? this.before[option.priortity].unshift(before) : this.before[option.priortity].push(before);
        option.type[1] === WrapType.pretend ? this.after[option.priortity].unshift(after) : this.after[option.priortity].unshift(after);
    }

    toString = () => this.before.map(t => t.join('')).join('') + this.text.text + this.after.map(t => t.join('')).join('')

    constructor(text: Text) {
        this.text = text;
    }
}

class Serializer {
    readonly node: Node;

    readonly texts: NodeEntry<Text>[];

    readonly pureTexts: Text[];

    readonly wrapper2 = new Map<Path, TextWrapper2>()

    readonly wrapper = new Array<Array<TextWrapper>>([], [], []);

    findMark(mark: string, option?: FindOption) {
        let { pureTexts } = this;

        let start = 0;
        let fragments = new Array<{ range: TextRange, texts: Text[] }>()

        for (let i = 0; i < pureTexts.length; i++) {
            const [
                asStart = !!(!pureTexts[i][mark] && pureTexts[i + 1] && pureTexts[i + 1][mark]),
                asEnd = !!(pureTexts[i][mark] && !(pureTexts[i + 1] && pureTexts[i + 1][mark]))
            ] = option?.match ? option.match(pureTexts, i) : []

            if (asStart) start = i + 1;
            if (asEnd) {
                fragments.push({ range: { from: start, to: i }, texts: pureTexts.slice(start, i + 1) });
                start = i + 1;
            };
        }
        return fragments;
    }

    pretend = (text: string, priortity: 0 | 1 | 2 = 0) => this.wrapText({ from: 0, to: 0, before: text, after: '' }, priortity)
    append = (text: string, priortity: 0 | 1 | 2 = 0) => this.wrapText({ from: this.pureTexts.length - 1, to: this.pureTexts.length - 1, before: '', after: text }, priortity)

    wrapText(wrapper: TextWrapper, priortity: 0 | 1 | 2 = 1) {
        this.wrapper[priortity].push(wrapper)
        return this;
    }

    wrapAllText(mark: string, wrapper: (texts: Text[]) => [before: string, after: string], option?: FindOption) {
        const fragments = this.findMark(mark, option)
        fragments.forEach(({ range, texts }, i) => {
            const [before, after] = wrapper(texts);
            this.wrapText({
                ...range,
                before,
                after
            });
        });
    }

    constructor(node: Node) {
        this.node = node;
        this.texts = [...Node.texts(node)];
        this.pureTexts = this.texts.map(t => t[0]);
        console.log(this.wrapper2);
        
        this.texts.forEach(text => this.wrapper2.set(text[1], new TextWrapper2(text[0])))
    }

    //参考draft.js
    render() {
        let str = this.pureTexts.map(text => {
            return {
                text, before: Array<string>(), after: Array<string>()
            }
        });//[{text,before,after},...]
        this.wrapper.forEach(w => w.forEach(
            wrapper => {
                str[wrapper.from].before.push(wrapper.before);
                str[wrapper.to].after.unshift(wrapper.after);
            }
        ))

        return str.map(v => v.before.join('') + v.text.text + v.after.join('')).join('')
    }
}


const serialize = (editor: CustomEditor) => {
    let str = Array<string>();
    const serializerEX = new Serializer(editor);

    editor.children.map((node: Descendant) => {
        const serializer = new Serializer(node);

        serializeMap.inline.forEach(t => t(serializer))
        serializeMap.block.forEach(t => t(serializer))

        str.push('<p>' + serializer.render() + "</p>")
    })


    return str.join('');
}

interface ISerializeMap {
    inline: Array<(serializer: Serializer) => Serializer>
    block: Array<(serializer: Serializer) => Serializer>
}

const serializeMap: ISerializeMap = {
    inline: [
        //合并具有相同mark的Text
        (serializer) => {

            [
                ['underline', '__'], ['deleted', '--'], ['italic', '//'], ['bold', '**']
            ].forEach(([mark, wrap]) =>
                serializer.wrapAllText(mark, () => [wrap, wrap])
            )

            serializer.wrapAllText('color', texts => [`##${texts[0]?.color?.slice(1)}|`, '##'], {//去除16进制颜色码的'#'
                match: (texts, i) => [, texts[i].color !== undefined && texts[i].color !== texts[i + 1]?.color] //需要color一致
            })

            return serializer
        }

    ],
    block: [
        (serializer) => {
            const nn = Node
            //TODO 将path加入serializer后在实现block嵌套和link等带参渲染
            //用Node.level实现
            const matchType = (type: string, d: () => any) => Node.matches(serializer.node, { type, children: [] }) ? d() : null;
            matchType('header-one', () => serializer.pretend('+ '))
            matchType('header-two', () => serializer.pretend('++ '))
            matchType('header-three', () => serializer.pretend('+++ '))
            matchType('block-quote', () => serializer.pretend('> '))

            return serializer
        }
    ]
}

export default serialize;