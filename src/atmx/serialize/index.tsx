import { Ancestor, Node, Editor, Element, Text, NodeEntry } from 'slate'
import { CustomEditor, CustomElement, FormattedText, LinkElement } from '..';

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

        for (let { value: node, done } = nodes.next(); !done;) {

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

    before = new Array<string[]>(5);
    after = new Array<string[]>(5);

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

class Serializer {
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
        match: ((sTexts: SText[], index: number) => [asStart?: boolean, asEnd?: boolean]) | string,
        action: (sTexts: SText[], start: number, end: number) => any
    }) {
        let { sTexts } = this;

        let start = 0;
        for (let i = 0; i < sTexts.length; i++) {
            const [asStart, asEnd] =
                option.match instanceof Function ? option.match(sTexts, i) :
                    [
                        !!(!sTexts[i].hasMark(option.match) && sTexts[i + 1] && sTexts[i + 1].hasMark(option.match)),
                        !!(sTexts[i].hasMark(option.match) && !(sTexts[i + 1] && sTexts[i + 1].hasMark(option.match)))
                    ]

            if (asStart) start = i + 1;
            if (asEnd) {
                option.action(sTexts, start, i)
                start = i + 1;
            };
        }
    }

    constructor(node: Node) {
        this.node = node;
        this.texts = Node.texts(this.node)

        this.sTexts = [];
        const texts = Node.texts(this.node)
        for (let { value: text, done } = texts.next(); !done;) {
            let sText = new SText(text as NodeEntry<Text>);
            sText.map(this.node);
            this.sTexts.push(sText);
        }

        this.join({
            match: 'bold',
            action: (t, before, after) => this.wrap({
                range: [before, after],
                value: ['**', '**'],
                priortity:4
            })
        })
    }
}

const serialize = (node: Node) => {
    const serializer = new Serializer(node)
    return ''
}

export { serialize }