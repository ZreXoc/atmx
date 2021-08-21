import { message } from "antd";
import isUrl from "is-url";
import { Editor, Node, Text, Element, Transforms } from "slate";
import { RenderElementProps } from "slate-react";
import { TextCommand as command, LeafRender, AlignElement, Serialize } from "src/atmx";

const nodeMap = {
    inline: {
        bold: {
            key: "bold",
            title: "粗体(B)",
            hotkey: "ctrl+b",
            achieve: () => command.toggleMark("bold"),
            render: (leaf: LeafRender) => leaf.appendClass("bold")
        },

        italic: {
            key: "italic",
            title: "斜体(I)",
            hotkey: "ctrl+i",
            achieve: () => command.toggleMark("italic"),
            render: (leaf: LeafRender) => leaf.appendClass("italic")
        },

        underline: {
            key: "underline",
            title: "下划线(I)",
            hotkey: "ctrl+u",
            achieve: () => command.toggleMark("underline"),
            render: (leaf: LeafRender) => leaf.appendClass("underline")
        },

        deleted: {
            key: "deleted",
            title: "删除线(D)",
            hotkey: "ctrl+d",
            achieve: () => command.toggleMark("deleted"),
            render: (leaf: LeafRender) => leaf.appendClass("deleted")
        },

        link: {
            key: "link",
            title: "链接",
            achieve: () => {
                if (command.isMarkActive('link')) return command.removeMark("link");
                let url = window.prompt("Enter the URL of the link:");
                if (!url) message.error("url不可为空");
                else if (!isUrl(url) && isUrl("http://" + url)) url = "http://" + url;
                else message.error("不合法的url:" + url);
                command.toggleMark("link", { url })
            },
            render: (leafRender: LeafRender) => {
                let url = leafRender.getLeaf().link?.url;
                if (url) leafRender.setChildren((
                    <a href={url}>
                        {leafRender.getChildren()}
                    </a>
                ));
            }
        },
    },
    block: {
        //header
        headerOne:
        {
            key: "header-one",
            title: "一级标题(H)",
            hotkey: "ctrl+alt+h",
            achieve: () => command.toggleBlock("header-one"),
            render: (props: RenderElementProps) => <h1 {...props.attributes}>{props.children}</h1>
        },
        headerTwo: {
            key: "header-two",
            title: "二级标题",
            achieve: () => command.toggleBlock("header-two"),
            render: (props: RenderElementProps) => <h2 {...props.attributes}>{props.children}</h2>

        },
        headerThree: {
            key: "header-three",
            title: "三级标题",
            achieve: () => command.toggleBlock("header-three"),
            render: (props: RenderElementProps) => <h3 {...props.attributes}>{props.children}</h3>
        },

        //text-align
        textAlign: {
            key: "text-align",
            title: "对齐",
            isActive: (editor: Editor, attr: any) => {
                const alignType = attr.alignType;
                if (!(alignType && ["left", "center", "right"].includes(alignType))) return false
                const [match] = Editor.nodes(editor, {
                    match: n =>
                        !Editor.isEditor(n) && Element.isElement(n) && n.type === 'text-align',
                })
                return match && (match[0] as AlignElement).alignType === alignType
            },
            achieve: (editor: Editor, attr: any) => {
                const alignType = (attr.alignType && ["left", "center", "right"].includes(attr.alignType)) ? attr.alignType : 'left';
                command.toggleBlock({ type: 'text-align', alignType, children: [] })
            },
            render: (props: RenderElementProps, ele: Element) =>
                <div style={{ textAlign: (ele as AlignElement).alignType }}{...props.attributes}>{props.children}</div>
        },
        /*         link: {
                    key: "link",
                    title: "链接",
                    achieve: (editor: Editor) => {
                        const { isBlockActive } = command;
        
                        const insertLink = (url: string) => {
                            if (editor.selection) {
                                wrapLink(url)
                            }
                        }
        
                        const wrapLink = (url: string) => {
                            if (isBlockActive("link")) {
                                unwrapLink()
                            }
        
                            const { selection } = editor
                            const isCollapsed = selection && Range.isCollapsed(selection)
                            const link: LinkElement = {
                                type: "link",
                                url,
                                children: isCollapsed ? [{ text: url }] : [],
                            }
        
                            if (isCollapsed) {
                                Transforms.insertNodes(editor, link)
                            } else {
                                Transforms.wrapNodes(editor, link, { split: true })
                                Transforms.collapse(editor, { edge: "end" })
                            }
                        }
        
                        const unwrapLink = () => {
                            Transforms.unwrapNodes(editor, {
                                match: n =>
                                    !Editor.isEditor(n) && Element.isElement(n) && n.type === "link",
                            })
                        }
        
                        if (isBlockActive("link")) {
                            unwrapLink()
                        } else {
                            let url = window.prompt("Enter the URL of the link:");
                            if (!url) message.error("url不可为空");
                            else if (isUrl(url) || isUrl("http://" + url)) insertLink("http://" + url);
                            else message.error("不合法的url:" + url);
                        }
                    },
        
                    render(props: RenderElementProps) {
                        const element = props.element as LinkElement;
                        return (<a href={element.url} {...props.attributes}>{props.children}</a>)
                    }
                }, */
        blockquote: {
            key: "block-quote",
            title: "引用",
            achieve: (editor: Editor) => command.toggleBlock("block-quote", { nested: true }),
            render: (props: RenderElementProps) => <blockquote {...props.attributes}>{props.children}</blockquote>
        },
        numberedList: {
            key: "numbered-list",
            title: "有序列表",
            achieve: (editor: Editor) => {
                const isActive = command.isBlockActive("numbered-list");
                command.toggleBlock('numbered-list', { nested: true, split: true })
                if (!isActive) {
                    Transforms.setNodes(editor, { type: 'list-item' })
                } else {
                    Transforms.setNodes(editor, { type: 'paragraph' },
                        { match: n => !Editor.isEditor(n) && Element.isElement(n) && n.type === 'list-item' });

                }
            },
            render: (props: RenderElementProps) => <ol {...props.attributes}>{props.children}</ol>
        },
        bulletedList: {
            key: "bulleted-list",
            title: "无序列表",
            achieve: (editor: Editor) => {
                const isActive = command.isBlockActive("bulleted-list");
                command.toggleBlock('bulleted-list', { nested: true, split: true })
                if (!isActive) {
                    Transforms.setNodes(editor, { type: 'list-item' })
                } else {
                    Transforms.setNodes(editor, { type: 'paragraph' },
                        { match: n => !Editor.isEditor(n) && Element.isElement(n) && n.type === 'list-item' });

                }
            },
            render: (props: RenderElementProps) => <ul {...props.attributes}>{props.children}</ul>
        },
        listItem: {
            key: "list-item",
            render: (props: RenderElementProps) => <li {...props.attributes}>{props.children}</li>
        },
        horizontalLine: {
            key: "horizontal-line",
            title: "分割线",
            achieve: () => command.insertVoid({ type: 'horizontal-line', children: [{ text: '' }] }),
            render: (props: RenderElementProps) => <span className="void" {...props.attributes}><hr />{props.children}</span>,
            isVoid: true
        }
    }
}

export interface SContext extends Serialize.Context {
    headerLevel: number,
    quote: number,
}
const serialize: Serialize.Config<SContext> = {
    markRules: [
        //header
        {
            match: ({ nodeEntry: [node] }) => Element.isElement(node) && !!node.type.match(/header-*/),
            mark: ({ nodeEntry: [node], context }) => {
                let level = 0;
                switch ((node as Element).type) {
                    case 'header-one':
                        level = 1;
                        break;
                    case 'header-two':
                        level = 2;
                        break;
                    case 'header-three':
                        level = 3;
                        break;
                }
                context.headerLevel = level;
                return context
            }
        },
        //quote
        {
            match: ({ nodeEntry: [node] }) => Element.isElement(node) && node.type === 'block-quote',
            mark: ({ context }) => {
                if (!context.quote) context.quote = 0;
                context.quote++;
                return context;
            }
        }
    ],
    serializeHandlers: {
        leafHandler: [
            //inline
            {
                match: () => true,
                handle: ({ nodeEntry: [node], texts, leafs }) => {
                    //merge same mark in constant leafs
                    const findByMark = (mark: string, leafs: Text[], matchValue: boolean = false) => {
                        let ranges = Array<[start: number, end: number]>();
                        let start = 0, end = 0;

                        for (let i = 0; i < leafs.length; i++) {
                            const leaf = leafs[i];
                            if (!Text.isText(leaf)) throw new Error(`unexpected error, node.children[${i}] is not a Text`);
                            //find constant marks
                            if (!leaf[mark]) {
                                start = i + 1;
                                end = start;
                            };
                            if (leaf[mark]) {
                                let next = leafs[i + 1];
                                if (!(next && next[mark] && !(matchValue && leaf[mark] !== next[mark]))) {
                                    ranges.push([start, end]);
                                    start = i + 1;
                                    end = start;
                                    continue;
                                }
                                end = i + 1;
                            };
                        }
                        return ranges;
                    }
                    const map: Array<[mark: string, str: [before: string | null, after: string | null]]> = [
                        ['bold', ['**', '**']],
                        ['italic', ['//', '//']]
                    ]
                    map.forEach(([mark, str]) => {
                        findByMark(mark, leafs).forEach(range => {
                            Serialize.TextArray.wrap(texts, str, { range, priority: 3 })
                        })
                    })

                    //color
                    findByMark('color', leafs, true).forEach(range => {
                        const leaf = leafs[range[0]];
                        if (!Text.isText(leaf)) throw new Error(`unexpected error, leafs[${range[0]}] is not a Text`);
                        Serialize.TextArray.wrap(texts, [`#${leaf.color}|`, `##`], { range: range, priority: 3 })
                    })

                    //link
                    findByMark('link', leafs, true).forEach(range => {
                        const leaf = leafs[range[0]];
                        if (!Text.isText(leaf)) throw new Error(`unexpected error, leafs[${range[0]}] is not a Text`);
                        const { link } = leaf
                        if (!link) throw new Error('unexpected error, leaf.link is not exist');
                        Serialize.TextArray.wrap(texts, [`[${link.url} `, `]`], { range: range, type: 'inner', priority: 4 })
                    })

                    /*                     for (let i = 0; i < node.children.length; i++) {
                                            const leaf = node.children[i]
                                            if (!Text.isText(leaf)) throw new Error("unexpected error");
                                            //hex color already has a '#'
                                            if (leaf.color)
                                                Serialize.TextArray.wrap(texts, [`#${leaf.color}|`, `##`], { range: [i, i], priority: 3 })
                                        } */
                    return texts;
                }
            },
        ],
        elementHandler: [
            //line-break
            {
                match: ({ nodeEntry: [node], root }) => {
                    if (!Element.isElement(node)) return false;
                    let hasTextChild = node.children.some(n => Text.isText(n));
                    if (!hasTextChild) return false;
                    return Editor.isEditor(root) ? !root.isInline(node) : Element.isElement(node)
                },
                handle: ({ texts }) => {
                    texts[texts.length - 1].wrap([undefined, '\n'], 'outer', 0);
                    return texts;
                }
            },

            //header
            {
                match: ({ nodeEntry: [node] }) => Element.isElement(node) && !!node.type.match(/header-*/),
                handle: ({ nodeEntry: [node], texts }) => {
                    let level = 0;
                    switch ((node as Element).type) {
                        case 'header-one':
                            level = 1;
                            break;
                        case 'header-two':
                            level = 2;
                            break;
                        case 'header-three':
                            level = 3;
                            break;
                    }
                    let str = Array(level).fill('+').join('') + ' ';
                    Serialize.TextArray.wrap(texts, [str, null], { priority: 1 })
                    return texts;
                }
            },
            //list-item
            {
                match: ({ nodeEntry: [node] }) => Element.isElement(node) && node.type === 'list-item',
                handle: ({ texts, childRanges, root, nodeEntry: [node, path] }) => {
                    let parent = Node.parent(root, path);
                    let str = Editor.isEditor(parent) || parent.type !== 'block-quote' ? '> ' : '>';
                    switch ((parent as Element).type) {
                        case 'numbered-list':
                            str = '# '
                            break;
                        case 'bulleted-list':
                            str = '* '
                            break;
                    }
                    childRanges.forEach(range => {
                        Serialize.TextArray.wrap(texts, [str, null], { range, priority: 1 })
                    })

                    return texts;
                }
            },
            //list container
            {
                match: ({ nodeEntry: [node] }) => Element.isElement(node) && !!node.type.match(/(.*)-list/),
                handle: ({ texts, childRanges, root, nodeEntry: [node, path] }) => {
                    let parent = Node.parent(root, path);
                    let str = Editor.isEditor(parent) || !parent.type.match(/(.*)-list/) ? '' : ' ';
                    childRanges.forEach(range => {
                        Serialize.TextArray.wrap(texts, [str, null], { range, priority: 1 })
                    })

                    return texts;
                }
            },
            //quote
            {
                match: ({ nodeEntry: [node] }) => Element.isElement(node) && node.type === 'block-quote',
                handle: ({ texts, childRanges, root, nodeEntry: [node, path] }) => {
                    let parent = Node.parent(root, path);
                    let str = Editor.isEditor(parent) || parent.type !== 'block-quote' ? '> ' : '>';
                    childRanges.forEach(range => {
                        Serialize.TextArray.wrap(texts, [str, null], { type: 'inner', range, priority: 0 })
                    })

                    return texts;
                }
            },
            //text align
            {
                match: ({ nodeEntry: [node] }) => Element.isElement(node) && node.type === 'text-align',
                handle: ({ texts, nodeEntry: [node, path] }) => {
                    let str: [string, string];
                    switch ((node as AlignElement).alignType) {
                        case 'left':
                            str = ['[[<]]\n', '\n[[/<]]'];
                            break;
                        case 'center':
                            str = ['[[=]]\n', '\n[[/=]]'];
                            break;
                        case 'right':
                            str = ['[[>]]\n', '\n[[/>]]'];
                            break;
                    }
                    Serialize.TextArray.wrap(texts, str, { priority: 1 })
                    return texts;
                }
            }
        ]
    },
    length: 5
}

const editorConfig = {
    nodeMap,
    serialize
}

export default editorConfig;