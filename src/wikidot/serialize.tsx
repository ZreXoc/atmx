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

interface ITextWrapper {
    //wrap的范围
    from?: number;
    to?: number;

    before: string;
    after: string;
}

class Texts {
    t: NodeEntry<FormattedText>[];

    readonly wrapper = Array<Array<ITextWrapper>>([], [], []);

    wrap(wrapper: ITextWrapper, priortity: 0 | 1 | 2 = 1) {
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

        return str.map(v => v.before + v.text + v.after).join('')
    }
}

class Serializer {
    readonly node: Node;

    readonly texts: Texts;

    wrap = (wrapper: ITextWrapper) => this

    constructor(node: Node) {
        this.node = node;
        this.texts = new Texts(node)
        this.wrap = (wrapper: ITextWrapper) => {
            this.texts.wrap(wrapper);
            return this;
        };
    }

    render() {
        return this.texts.render()
    }
}

const serialize = (node: Node) => {
    const nnn = Node

    let output = serializeNode(node);

    //去除重复符号
    //\*{4}|\/{4}|\-{4}|\_{4}
    let symbols = '*/-_'.split('').map(value =>
        `\\${value}{4}`
    ).join('|')
    symbols = `${symbols}`
    let flag = new RegExp(symbols, 'g')
    while (flag.test(output)) {
        output = output.replace(flag, '')
    }

    console.log(output)

    return output
}

export const renderSerialize = (editor: CustomEditor) => {
    let str = Array<string>();
    editor.children.map((node: Descendant) => {
        const serializer = new Serializer(node);
        serializeMap.text.forEach(t => t(serializer))
        str.push(serializer.render())
    })
    console.log(str, 11);

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
            let texts = serializer.texts.t;
            let temp = Array<{ mark: string, index: number }>();
            texts.forEach(([text], index) => {
                Object.keys(text).forEach(mark => {
                    if (mark === 'text') return
                    console.log({ temp, mark });

                    if (!temp.some(s => s.mark === mark)) temp.push({ mark, index })
                });
                temp.forEach(s => {
                    if (index === 0) return
                let kk  = Math.floor(Math.random()*100).toString()

                    if (!text[s.mark]) serializer.wrap({
                        from: s.index,
                        to: index-1,
                        before: kk,
                        after: kk
                    })
                })
            });

            return serializer
        }

    ]
}

export default serialize;