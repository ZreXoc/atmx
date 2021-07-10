import { Node, Text, Path } from "slate";

declare enum WrapType {
    pretend,
    attent
}

declare class SText {
    readonly text: Text;
    readonly path: Path;
    readonly node: Node;

    headerLevel: 0 | 1 | 2 | 3 = 0;
    quoteLevel: number = 0;
    link: undefined | string;

    before: Array<string[5]>;
    after: Array<string[5]>;

    getMark(mark: string): any;

    wrap(wrapper: {
        text: [before: string, after: string],
        priortity: 0 | 1 | 2 | 3 | 4 = 2,
        type?: [WrapType?, WrapType?]
    }): this;

    toString(): string;

    constructor(text: NodeEntry<Text>, node: Node);

    static hasSameParent(...sText: SText[]): boolean

    static wrap(wrapper: {
        text: [before: string, after: string],
        range: [start: number, end: number]
        priortity: 0 | 1 | 2 | 3 | 4 = 2,
        type?: [WrapType?, WrapType?]
    }): void
}


declare class Serializer {
    node: Node;
    texts: Generator<NodeEntry<FormattedText>, void, undefined>;
    sTexts: SText[];

    get: (match: (sText: SText, index: number, sTexts: SText[]) => boolean) =>
        Generator<[index:number,sTexts:SText[]], void, undefined>;
    find: (option: {
        match: (sText: SText, index: number, sTexts: SText[]) => [asStart: boolean, asEnd: boolean],
        splitBy?: 'none' | 'paragraph',
    }) => Generator<[start: number, end: number], void, undefined>;

    toString(): string;

    constructor(node: Node);
}