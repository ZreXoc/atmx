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
    matchValue?: (texts: Text[], index: number) => [shouldStart:boolean|undefined,shouldEnd:boolean|undefined]

}
class Texts {
    t: NodeEntry<FormattedText>[];

    readonly wrapper = Array<Array<TextWrapper>>([], [], []);

    wrap(wrapper: TextWrapper, priortity: 0 | 1 | 2 = 1) {
        this.wrapper[priortity].push(wrapper)
        return this;
    }

    constructor(node: Node) {
        this.t = [...Node.texts(node)]
    }
    //参考draft.js
    render() {
        let str = this.t.map(value => {
            return {
                text: value[0].text, before: Array<string>(), after: Array<string>()
            }
        });//[{text,before,after},...]
        this.wrapper.forEach(w => w.forEach(
            wrapper => {
                str[wrapper.from || 0].before.push(wrapper.before);
                str[wrapper.to || (str.length - 1)].after.unshift(wrapper.after);
            }
        ))

        return str.map(v => v.before.join('') + v.text + v.after.join('')).join('')
    }
}

class Serializer {
    readonly node: Node;

    readonly texts: Text[];

    readonly wrapper = Array<Array<TextWrapper>>([], [], []);


    findMark(mark: string, option?: FindOption) {
        let { texts } = this;

        let from = 0;
        let textRanges = new Array<TextRange>()

        for (let i = 0; i < texts.length; i++) {
            const current = texts[i], next = texts[i + 1]

            let shouldStart = !current[mark] && next && next[mark];
            let shouldEnd = current[mark] && !(next && next[mark]);

            if (option?.matchValue) [shouldStart=shouldStart,shouldEnd=shouldEnd] = option.matchValue(texts, i);

            if (shouldStart) from = i + 1;
            if (shouldEnd) {
                textRanges.push({ from, to: i });
                from = 0;
            };
        }
        return textRanges;
    }

    wrap(wrapper: TextWrapper, priortity: 0 | 1 | 2 = 1) {
        this.wrapper[priortity].push(wrapper)
        return this;
    }

    wrapAll(mark: string, wrapper: [string, string], option?: FindOption) {
        const textRanges = this.findMark(mark, option)

        textRanges.forEach(textRange => this.wrap({
            ...textRange,
            before: wrapper[0],
            after: wrapper[1]
        })
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
                str[wrapper.from || 0].before.push(wrapper.before);
                str[wrapper.to === undefined ? (str.length - 1) : wrapper.to].after.unshift(wrapper.after);
            }
        ))

        return str.map(v => v.before.join('') + v.text.text + v.after.join('')).join('')
    }
}


const serialize = (editor: CustomEditor) => {
    let str = Array<string>();
    editor.children.map((node: Descendant) => {
        const serializer = new Serializer(node);

        serializeMap.text.forEach(t => t(serializer))

        str.push('<p>' + serializer.render() + "</p>")
    })

    return str.join('');
}

interface ISerializeMap {
    text: Array<(arg0: Serializer) => Serializer>
}

const serializeMap: ISerializeMap = {
    text: [
        //inline
        //合并具有相同mark的Text
        (serializer) => {

            [
                ['underline', '__'], ['deleted', '--'], ['italic', '//'], ['bold', '**']
            ].forEach(([mark, wrap]) => {
                serializer.wrapAll(mark, [wrap, wrap])
            })

            // serializer.wrapAll('color', ['##|', '##'], {
            //     matchValue: (texts, i) => [texts[i].color === texts[i + 1]?.color] 需要color一致
            // }) 

            return serializer
        }

    ]
}

export default serialize;