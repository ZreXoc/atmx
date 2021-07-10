import { Node, Element, Text, Path, NodeEntry } from "slate";
import { CustomElement, FormattedText, LinkElement } from "..";

enum WrapType {
    pretend,
    attent
}

class SText {
    readonly text: Text;
    readonly path: Path;
    readonly node: Node;

    headerLevel: 0 | 1 | 2 | 3 = 0;
    quoteLevel: number = 0;
    link: undefined | string;

    before = new Array<string[]>(5);
    after = new Array<string[]>(5);

    getMark = (mark: string) => this.text[mark]

    wrap(value: [before?: string, after?: string], option: {
        priortity?: 0 | 1 | 2 | 3 | 4,
        type?: [WrapType?, WrapType?]
    }) {
        const [before = '', after = ''] = value;
        const [typeBefore = WrapType.pretend, typeAfter = WrapType.attent] = option.type || [];
        const { priortity = 2 } = option;

        typeBefore[0] === WrapType.pretend ? this.before[priortity].unshift(before) : this.before[priortity].push(before);
        typeAfter[1] === WrapType.pretend ? this.after[priortity].unshift(after) : this.after[priortity].unshift(after);
    }

    toString() {
        let before = this.before.map(t => t.join(''))
        let after = this.after.map(t => t.join(''))
        return before.join('') + this.text.text + after.join('')
    };

    constructor(text: NodeEntry<Text>, node: Node) {
        [this.text, this.path] = text;
        this.node = node;

        for (let i = 0; i < 5; i++) {
            this.before[i] = new Array<string>();
            this.after[i] = new Array<string>();
        }

        const nodes = Node.levels(node, this.path)

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
        }
    }

    static hasSameParent = (...sTexts: SText[]) =>
        sTexts.every((sText, i) =>
            !sText ? false :
                i < sTexts.length - 1 ?
                    Node.parent(sTexts[i].node, sTexts[i].path) === Node.parent(sTexts[i + 1].node, sTexts[i + 1].path) : true)

}


class Serializer {
    node: Node;
    texts: Generator<NodeEntry<FormattedText>, void, undefined>;
    sTexts: SText[];

    *get(match: (sText: SText, index: number, sTexts: SText[]) => boolean)
        : Generator<[index: number, sTexts: SText[]], void, undefined> {
        for (let i = 0; i < this.sTexts.length; i++) {
            if (match(this.sTexts[i], i, this.sTexts)) yield [i, this.sTexts]
        }
    }

    *find(sTexts: SText[] = this.sTexts, option: {
        range?: [start?: number, end?: number]
        match: (sText: SText, index: number, sTexts: SText[]) => [asStart: boolean, asEnd: boolean],
        splitBy?: 'none' | 'paragraph',
    }): Generator<[start: number, end: number], void, undefined> {
        let Ae = SText, Nd = Node

        let [start = 0, end = sTexts.length] = option.range || [];
        if (sTexts === this.sTexts && option.splitBy === 'paragraph') {
            for (let i = 0; i < end; i++) {
                //debugger;
                if (!sTexts[i + 1] || !SText.hasSameParent(sTexts[i], sTexts[i + 1])) {
                    debugger
                    for (const range of this.find(sTexts, { ...option, range: [start, i + 1], splitBy: 'none' })) yield range;
                    start = i + 1;
                }
            }
        } else {
            for (let i = start; i < end; i++) {
                const current = sTexts[i];
                const [asStart, asEnd] = option.match(current, i - start, sTexts.slice(start, end));
                if (asStart) start = i;
                if (asEnd) yield [start, i];
            }
        }
    }

    wrap(value: [before: string, after: string], option: {
        range: [start: number, end: number],
        priortity?: 0 | 1 | 2 | 3 | 4,
        type?: [WrapType?, WrapType?]
    }) {
        const [before, after] = value;
        const { range: [start, end] } = option;
        this.sTexts[start].wrap([before, ''], option);
        this.sTexts[end].wrap(['', after], option);
        return this;
    }

    toString = () => this.sTexts.map(s => s.toString()).join('');

    constructor(node: Node) {
        this.node = node;
        this.texts = Node.texts(this.node)

        this.sTexts = [];
        const texts = Node.texts(this.node)
        for (let text of texts) {
            let sText = new SText(text as NodeEntry<Text>, node);
            this.sTexts.push(sText);
        }
    }
}

export const serialize = (node: Node) => {
    const serializer = new Serializer(node);

    const findMark = (mark: string) => serializer.find(undefined, {
        match: (sText, i, sTexts) => {
            const past = !!sTexts[i - 1]?.getMark(mark) || false, current = !!sTexts[i].getMark(mark), next = !!sTexts[i + 1]?.getMark('bold') || false
            debugger;

            return [!past && current, current && !next]
        },
        splitBy: 'paragraph'
    });
    for (const range of findMark('bold')) serializer.wrap(['**', '**'], { range })

    return serializer
}