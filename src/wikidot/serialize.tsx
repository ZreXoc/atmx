import escapeHtml from 'escape-html'
import { Descendant, NodeEntry } from 'slate';
import { Ancestor, Node, Text } from 'slate'
import { useSlate } from 'slate-react';
import { CustomEditor, CustomElement, FormattedText } from 'src/atmx';


const serializeText = (node: Text) => {
    const text = [node.text]

    if (node.hasOwnProperty('bold')) {
        text.unshift("**");
        text.push('**');
    }
    if (node.hasOwnProperty('italic')) {
        text.unshift("//");
        text.push('//');
    }
    if (node.hasOwnProperty('underline')) {
        text.unshift("__");
        text.push('__');
    }
    if (node.hasOwnProperty('deleted')) {
        text.unshift("--");
        text.push('--');
    }

    return escapeHtml(text.join(''))
}



const serializeNode = (node: Node): string => {
    if (Text.isText(node)) {
        return serializeText(node)
    }

    const children = node.children.map((n: Node) => serializeNode(n)).join('')

    switch ((node as CustomElement).type) {
        case 'quote':
            return `<blockquote><p>${children}</p></blockquote>`
        case 'paragraph':
            return `<p>${children}</p>`
        case 'header-one':
            return `<p>+ ${children}</p>`
        case 'header-two':
            return `<p>++ ${children}</p>`
        case 'header-three':
            return `<p>+++ ${children}</p>`
        default:
            return `${children}`
    }
}

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

class Serializer {
    readonly node: Node;

    readonly texts: Text[];

    readonly wrapper = Array<Array<TextWrapper>>([], [], []);


    findMark(mark: string, option?: FindOption) {
        let { texts } = this;

        let start = 0;
        let fragments = new Array<{ range: TextRange, texts: Text[] }>()

        for (let i = 0; i < texts.length; i++) {
            const [
                asStart = !!(!texts[i][mark] && texts[i + 1] && texts[i + 1][mark]),
                asEnd = !!(texts[i][mark] && !(texts[i + 1] && texts[i + 1][mark]))
            ] = option?.match ? option.match(texts, i) : []

            //if (mark === 'bold') debugger

            if (asStart) start = i + 1;
            if (asEnd) {
                fragments.push({ range: { from: start, to: i }, texts: texts.slice(start, i + 1) });
                start = i + 1;
            };
        }
        return fragments;
    }

    pretend = (text: string,priortity: 0 | 1 | 2 = 0) => this.wrapText({ from: 0, to: 0, before: text, after: '' },priortity)
    append = (text: string,priortity: 0 | 1 | 2 = 0) => this.wrapText({ from: this.texts.length - 1, to: this.texts.length - 1, before: '', after: text },priortity)

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
            }
            )
        }
        )
    }

    constructor(node: Node) {
        this.node = node;
        this.texts = [...Node.texts(node)].map(t => t[0])
    }

    //参考draft.js
    render() {
        let str = this.texts.map(text => {
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
            const matchType = (type:string,d:()=>any)=>Node.matches(serializer.node, {type,children:[]})?d():null;
            matchType('header-one',()=>serializer.pretend('+ '))
            matchType('header-two',()=>serializer.pretend('++ '))
            matchType('header-three',()=>serializer.pretend('+++ '))
            matchType('block-quote',()=>serializer.pretend('> '))

            return serializer
        }
    ]
}

export default serialize;