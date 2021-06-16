import { Ancestor, Node, Editor, Element, Text, NodeEntry } from 'slate'
import { useSlate } from 'slate-react';
import { CustomEditor, CustomElement, FormattedText, LinkElement } from '..';
import serializeMap from './map';

enum WrapType {
    pretend,
    attent
}

type SWrapper = {
    value: [before?: string, after?: string];
    type?: [WrapType?, WrapType?]
    priortity?: 0 | 1 | 2 | 3 | 4;
}

/*class SText {
    value: string;
    

    before = new Array<string[]>(5);
    after = new Array<string[]>(5);

    wrap(wrapper: SWrapper) {
        const [before = '', after = ''] = wrapper.value
        const [typeBefore = WrapType.pretend, typeAfter = WrapType.attent] = wrapper.type || []
        const { priortity = 2 } = wrapper

        typeBefore[0] === WrapType.pretend ? this.before[priortity].unshift(before) : this.before[priortity].push(before);
        typeBefore[1] === WrapType.pretend ? this.after[priortity].unshift(after) : this.after[priortity].unshift(after);
    }

    constructor(text: Text) {
        this.value = text.text
    }
}*/

class SText {
    value: NodeEntry<Text>;

    headerLevel: 0 | 1 | 2 | 3 = 0;
    quoteLevel: number = 0;
    link: undefined | string;

    hasMark = (mark: string) => !!this.value[0][mark]

    map(node: Node) {
        const nodes = Node.levels(node, this.value[1])

        for (let node of nodes) {

            if (!Element.isElement(node[0])) continue;

            switch ((node[0] as CustomElement).type) {
                case 'header-one':
                    this.headerLevel = 1;
                    break;
                case 'header-two':
                    this.headerLevel = 2;
                    break;
                case 'header-three':
                    this.headerLevel = 3;
                    break;
                case 'block-quote':
                    this.quoteLevel++;
                    break;
                case 'link':
                    this.link = (node[0] as LinkElement).url
            }
            return this;
        }
    }

    before = new Array<string[]>([], [], [], [], []);
    after = new Array<string[]>([], [], [], [], []);

    wrap(wrapper: SWrapper) {
        const [before = '', after = ''] = wrapper.value
        const [typeBefore = WrapType.pretend, typeAfter = WrapType.attent] = wrapper.type || []
        const { priortity = 2 } = wrapper
        typeBefore[0] === WrapType.pretend ? this.before[priortity].unshift(before) : this.before[priortity].push(before);
        typeBefore[1] === WrapType.pretend ? this.after[priortity].unshift(after) : this.after[priortity].unshift(after);
    }

    toString = () => this.before.map(v => v.join('')).join('') + this.value[0].text + this.after.reverse().map(v => v.join('')).join('')

    constructor(text: NodeEntry<Text>) {
        this.value = text
    }


}

export class Serializer {
    node: Node;
    texts: Generator<NodeEntry<FormattedText>, void, undefined>;
    sTexts: SText[];

    wrap(wrapper: SWrapper & { range: [from: number, to: number] }) {
        const { range: [from, to], value: [before, after], ...option } = wrapper

        this.sTexts[from].wrap({
            value: [before, ''],
            ...option
        });
        this.sTexts[to].wrap({
            value: ['', after],
            ...option
        })
    }

    join(option: {
        match: ((sTexts: SText[], index: number) => [asStart: boolean, asEnd: boolean]) | string,
        action: (sTexts: SText[], range: [start: number, end: number]) => any
    }) {
        let { sTexts } = this;

        let start = 0;

        for (let i = 0; i < sTexts.length; i++) {
            let current = sTexts[i], next = sTexts[i + 1];

            const matchWithMark = (mark: string): [boolean, boolean] =>
                !next ? [false, current.hasMark(mark)]//文末
                : (Node.parent(this.node, current.value[1]) !== Node.parent(this.node, next.value[1]) || Editor.isEditor(Node.common(this.node, current.value[1], next.value[1]))) ?
                        [!current.hasMark(mark) && next.hasMark(mark), current.hasMark(mark)]//不属于同一个“段落”
                        : [
                            !current.hasMark(mark) && next.hasMark(mark),
                            current.hasMark(mark) && !next.hasMark(mark)
                        ]//属于同一个“段落”

            const [asStart, asEnd] = option.match instanceof Function ? option.match(sTexts, i) : matchWithMark(option.match);


            if (asStart) start = i + 1;
            if (asEnd) {
                option.action(sTexts, [start, i])
                // start = i + 1;
            };

        }
    }

    constructor(node: Node) {
        this.node = node;
        this.texts = Node.texts(this.node)

        this.sTexts = [];
        const texts = Node.texts(this.node)
        for (let text of texts) {
            let sText = new SText(text as NodeEntry<Text>);
            sText.map(this.node);
            this.sTexts.push(sText);
        }
    }

    toString = () => this.sTexts.map(t => t.toString()).join('')
}

const serialize = (node: Node) => {
    const serializer = new Serializer(node);

    let c = serializeMap
    //debugger

    for (let s of serializeMap) s(serializer);

    console.log(serializer, serializer.toString());

    return serializer.toString()
}

export { serialize }