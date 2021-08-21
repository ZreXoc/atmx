import { Ancestor, Element, Node, NodeEntry, Text } from "slate";


export interface Context extends Object { }

type BaseProps<T extends Context> = { nodeEntry: NodeEntry, context: T, root: Ancestor };
type MatchProps<T extends Context> = { nodeEntry: NodeEntry, context: T, root: Ancestor };
type HandleProps<T extends Context, E extends Node = Node> = { nodeEntry: NodeEntry<E>, context: T, root: Ancestor, texts: SText[] }

export type MarkRule<T extends Context> = {
    match: (props: MatchProps<T>) => boolean,
    mark: (props: BaseProps<T>) => T,
}

type LeafHandler<T extends Context> = {
    match: (props: MatchProps<T> & { texts: SText[], leafs: Text[] }) => boolean,
    handle: (handleProps: HandleProps<T, Element> & { leafs: Text[] }) => SText[]
};

type ElementHandler<T extends Context> = {
    match: (props: MatchProps<T> & { childRanges: Array<[start: number, end: number]> }) => boolean,
    handle: (handleProps: HandleProps<T> & { childRanges: Array<[start: number, end: number]> }) => SText[]
};

export type Handlers<T extends Context> = {
    leafHandler: LeafHandler<T>[],
    elementHandler: ElementHandler<T>[]
}

export type Config<T extends Context> = {
    markRules: MarkRule<T>[],
    serializeHandlers: Handlers<T>,
    length: number
}

class SText {
    originText: string;

    textBefore: Array<string[]>;
    textAfter: Array<string[]>;
    length: number;

    wrap([before, after]: [string?, string?], type: 'inner' | 'outer' = 'outer', priority: number = Math.floor(this.length / 2)) {
        switch (type) {
            case 'inner':
                if (before) this.textBefore[priority].push(before);
                if (after) this.textAfter[(this.length - 1) - priority].unshift(after);
                break;
            case 'outer':
                if (before) this.textBefore[priority].unshift(before);
                if (after) this.textAfter[(this.length - 1) - priority].push(after);
                break;
        }
        return this;
    }

    constructor(text: string, length: number = 5) {
        this.originText = text;
        this.length = length;
        let textBefore = Array<string[]>(length), textAfter = Array<string[]>(length);
        for (let i = 0; i < length; i++) {
            textBefore[i] = [];
            textAfter[i] = [];
        }
        this.textBefore = textBefore;
        this.textAfter = textAfter;
    }

    toString() {
        let before = '', after = '';
        this.textBefore.forEach(texts => before += texts.join(''));
        this.textAfter.forEach(texts => after += texts.join(''));
        return before + this.originText + after;
    }
}

export class TextArray {
    static wrap(texts: SText[], str: [before: string | null, after: string | null], option?: {
        type?: 'inner' | 'outer', range?: [start: number, end: number], priority?: number
    }) {
        let [before, after] = str;
        let length = texts[0].length
        let { type, range: [start, end], priority } = {
            type: 'outer', range: [0, texts.length - 1], priority: Math.floor(length / 2),
            ...option
        }
        switch (type) {
            case 'inner': {
                if (before) texts[start].textBefore[priority].push(before);
                if (after) texts[end].textAfter[(length - 1) - priority].unshift(after);
                break;
            }
            case 'outer': {
                if (before) texts[start].textBefore[priority].unshift(before);
                if (after) texts[end].textAfter[(length - 1) - priority].push(after);
                break;
            }
        }
        return texts;
    }
}

export class Serializer<T extends Context> {
    root: Ancestor;
    texts = new Array<string>();
    markRules: MarkRule<T>[];
    handlers: Handlers<T>;
    length: number;

    serializeAll() {
        const { root } = this;
        const context = ({} as T)
        let texts = this.serialize({ root, nodeEntry: [root, []], context });
        return texts.map(t => t.toString()).join('')
    }

    serialize(props: BaseProps<T>) {
        const { markRules, handlers, length } = this;
        const { nodeEntry, context, root } = props;
        const [node, path] = nodeEntry;
        const { leafHandler, elementHandler } = handlers;
        if (Text.isText(node)) return [node.text].map(text => new SText(text, length))

        let newContext = context;
        let childRanges = new Array<[start: number, end: number]>();//ranges of STexts from the same child

        markRules.forEach(rule => {
            if (rule.match(props)) newContext = rule.mark(props)
        })

        let texts = new Array<SText>();
        let lastRange: [start: number, end: number];
        //leaf
        let leafRanges = new Array<[start: number, end: number]>(), leafStart = 0, leafEnd = leafStart;
        let leafTexts = new Array<SText[]>(), _leafTexts = new Array<SText>();

        [...Node.children(root, path)].forEach((childEntry, index) => {
            let childTexts = this.serialize({ nodeEntry: childEntry, context: newContext, root })
            let range: [start: number, end: number] = lastRange ? [lastRange[1] + 1, lastRange[1] + childTexts.length] : [0, childTexts.length - 1]
            childRanges.push(range);
            lastRange = range;

            if (!Text.isText(childEntry[0])) {
                if (leafEnd === index - 1) {
                    leafRanges.push([leafStart, leafEnd]);
                    leafTexts.push(_leafTexts)
                    _leafTexts = [];
                    leafStart = index + 1;
                    leafEnd = leafStart;
                } else {
                    leafStart = index + 1;
                    leafEnd = leafStart;
                }
            };
            if (Text.isText(childEntry[0])) {
                leafEnd = index;
                _leafTexts = _leafTexts.concat(childTexts);
                if (index === node.children.length - 1) {
                    leafRanges.push([leafStart, leafEnd]);
                    leafTexts.push(_leafTexts);
                }
            }

            texts = texts.concat(childTexts);
        })


        leafRanges.forEach((range, i) => {
            const leafs = node.children.slice(range[0], range[1] + 1);
            const leafText = leafTexts[i];


            leafHandler.forEach((handler) => {

                if (handler.match({ ...props, texts: leafText, leafs: (leafs as Text[]) }))
                    handler.handle({
                        nodeEntry: (nodeEntry as NodeEntry<Element>), context: newContext, root, texts: leafText, leafs: (leafs as Text[])
                    });
            });
        })

        elementHandler.forEach((handler) => {
            if (handler.match({ ...props, childRanges })) texts = handler.handle({ ...props, texts, childRanges })
        });

        return texts;
    }

    constructor(root: Ancestor, markRules: MarkRule<T>[], handlers: Handlers<T>, length = 5) {
        this.root = root;
        this.markRules = markRules;
        this.handlers = handlers;
        this.length = length;
    }
}