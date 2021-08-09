import { Node, Element, Text, Path, NodeEntry, Editor } from "slate";
import { CustomElement, FormattedText, LinkElement } from "..";

enum WrapType {
    pretend,
    attend
}

class SText {
    readonly text: Text;
    readonly path: Path;
    readonly editor: Editor;

    headerLevel: 0 | 1 | 2 | 3 = 0;
    quoteLevel: number = 0;
    numberedListLevel: number = 0;
    bulletedListLevel: number = 0;
    link: undefined | string;
    horizontalLine: boolean = false;

    before = new Array<string[]>(5);
    after = new Array<string[]>(5);

    getMark = (mark: string) => this.text[mark]

    wrap(value: [before?: string, after?: string], option: {
        priority?: 0 | 1 | 2 | 3 | 4,
        type?: [WrapType?, WrapType?]
    }) {
        const [before = '', after = ''] = value;
        const [typeBefore = WrapType.pretend, typeAfter = WrapType.attend] = option.type || [];
        const { priority = 2 } = option;

        typeBefore[0] === WrapType.pretend ? this.before[priority].unshift(before) : this.before[priority].push(before);
        typeAfter[1] === WrapType.pretend ? this.after[4 - priority].unshift(after) : this.after[4 - priority].unshift(after);
    }

    toString() {
        let before = this.before.map(t => t.join(''))
        let after = this.after.map(t => t.join(''))
        return before.join('') + this.text.text + after.join('')
    };

    constructor(editor: Editor, text: NodeEntry<Text>) {
        this.editor = editor;
        [this.text, this.path] = text;

        for (let i = 0; i < 5; i++) {
            this.before[i] = new Array<string>();
            this.after[i] = new Array<string>();
        }

        const nodes = Node.levels(editor, this.path)

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
                case 'numbered-list':
                    this.numberedListLevel++;
                    break;
                case 'bulleted-list':
                    this.bulletedListLevel++;
                    break;
                case 'link':
                    this.link = (node[0] as LinkElement).url
                    break;
                case 'horizontal-line':
                    this.horizontalLine = true
                    break;
            }
        }
    }

    static hasSameParent = (editor: Editor, ...sTexts: SText[]) =>
        sTexts.every((sText, i) =>
            !sText ? false :
                i < sTexts.length - 1 ?
                    Node.parent(editor, sTexts[i].path) === Node.parent(editor, sTexts[i + 1].path) : true)

    static inSameParagraph = (editor: Editor, ...sTexts: SText[]) =>
        sTexts.every((v, i) => {
            const find = (sText: SText) => {
                for (const nodeEntry of Node.levels(editor, sText.path, { reverse: true })) {
                    if (Element.isElement(nodeEntry[0]) && !editor.isInline(nodeEntry[0])) {
                        return nodeEntry[0];
                    }
                }
            }
            return sTexts[i + 1] ? find(sTexts[i]) === find(sTexts[i + 1]) : true
        })
}

export class Serializer {
    editor: Editor;
    texts: Generator<NodeEntry<FormattedText>, void, undefined>;
    sTexts: SText[];

    *get(match: (sText: SText, index: number, sTexts: SText[]) => boolean)
        : Generator<[index: number, sTexts: SText[]], void, undefined> {
        for (let i = 0; i < this.sTexts.length; i++) {
            if (match(this.sTexts[i], i, this.sTexts)) yield [i, this.sTexts]
        }
    }

    *find(option: {
        range?: [start?: number, end?: number]
        match: (sText: SText, index: number, sTexts: SText[]) => [asStart: boolean, asEnd: boolean],
        split?: 'none' | 'paragraph',
        emptyString?: boolean
    }): Generator<[start: number, end: number], void, undefined> {
        let { sTexts } = this;

        let [start = 0, end = sTexts.length] = option.range || [];
        if (sTexts === this.sTexts && option.split === 'paragraph') {
            for (let i = 0; i < end; i++) {
                if (!sTexts[i + 1] || !SText.inSameParagraph(this.editor, sTexts[i], sTexts[i + 1])
                ) {
                    for (const range of this.find({ ...option, range: [start, i + 1], split: 'none' })) yield range;
                    start = i + 1;
                }
            }
        } else {
            for (let i = start; i < end; i++) {
                const current = sTexts[i];
                if (!option.emptyString && current.text.text === '') continue;
                const [asStart, asEnd] = option.match(current, i - start, sTexts.slice(start, end));
                if (asStart) start = i;
                if (asEnd) yield [start, i];
            }
        }
    }

    findByMark = (mark: string) => this.find({
        match: (sText, i, sTexts) => {
            const past = !!sTexts[i - 1]?.getMark(mark) || false, current = !!sTexts[i].getMark(mark), next = !!sTexts[i + 1]?.getMark(mark) || false
            return [!past && current, current && !next]
        },
        split: 'paragraph'
    });

    wrap(value: [before: string, after: string], option: {
        range: [start: number, end: number],
        priority?: 0 | 1 | 2 | 3 | 4,
        type?: [WrapType?, WrapType?]
    }) {
        const [before, after] = value;
        const { range: [start, end] } = option;
        this.sTexts[start].wrap([before, ''], option);
        this.sTexts[end].wrap(['', after], option);
        return this;
    }

    wrapByMark = (mark: string, before: string, after: string = before) => {
        for (const range of this.findByMark(mark)) this.wrap([before, after], { range })
    }

    toString = () => this.sTexts.map(s => s.toString()).join('');

    constructor(editor: Editor) {
        this.editor = editor;
        this.texts = Node.texts(this.editor)

        this.sTexts = [];
        const texts = Node.texts(this.editor)
        for (let text of texts) {
            let sText = new SText(editor, text as NodeEntry<Text>);
            this.sTexts.push(sText);
        }
    }
}

export const serializeWithEditor = (editor: Editor, map: SerializeMap) => {
    const serializer = new Serializer(editor);
    map.forEach(v => v(serializer));
    return serializer;
}

export type SerializeMap = Array<(s: Serializer) => any>