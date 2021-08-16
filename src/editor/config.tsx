import { message } from "antd";
import isUrl from "is-url";
import { Editor, Element, Transforms, Range } from "slate";
import { RenderElementProps } from "slate-react";
import { ISerializeRule, LinkElement, Serializer, TextCommand as command, CustomLeaf, AlignElement } from "src/atmx";

const nodeMap = {
    inline: {
        bold: {
            key: "bold",
            title: "粗体(B)",
            hotkey: "ctrl+b",
            achieve: () => command.toggleMark("bold"),
            render: (leaf: CustomLeaf) => leaf.appendClass("bold")
        },

        italic: {
            key: "italic",
            title: "斜体(I)",
            hotkey: "ctrl+i",
            achieve: () => command.toggleMark("italic"),
            render: (leaf: CustomLeaf) => leaf.appendClass("italic")
        },

        underline: {
            key: "underline",
            title: "下划线(I)",
            hotkey: "ctrl+u",
            achieve: () => command.toggleMark("underline"),
            render: (leaf: CustomLeaf) => leaf.appendClass("underline")
        },

        deleted: {
            key: "deleted",
            title: "删除线(D)",
            hotkey: "ctrl+d",
            achieve: () => command.toggleMark("deleted"),
            render: (leaf: CustomLeaf) => leaf.appendClass("deleted")
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
                debugger;
                return match && (match[0] as AlignElement).alignType === alignType
            },
            achieve: (editor: Editor, attr: any) => {
                const alignType = (attr.alignType && ["left", "center", "right"].includes(attr.alignType)) ? attr.alignType : 'left';
                command.toggleBlock({ type: 'text-align', alignType, children: [] })
            },
            render: (props: RenderElementProps, ele: Element) =>
                <div style={{ textAlign: (ele as AlignElement).alignType }}{...props.attributes}>{props.children}</div>
        },
        link: {
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
                    else if (isUrl(url) || isUrl(url += "http://")) insertLink(url);
                    else message.error("不合法的url:" + url);
                }
            },

            render(props: RenderElementProps) {
                const element = props.element as LinkElement;
                return (<a href={element.url} {...props.attributes}>{props.children}</a>)
            }
        },
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
                if (!isActive) {
                    Transforms.wrapNodes(
                        editor,
                        {
                            type: "numbered-list",
                            children: []
                        }
                    );
                    Transforms.setNodes(editor, { type: 'list-item' })
                } else {

                    Transforms.unwrapNodes(editor,
                        {
                            match: n => !Editor.isEditor(n) && Element.isElement(n) && n.type === "numbered-list",
                            //split: isList ? false : true
                            split: true
                        }
                    );
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
                if (!isActive) {
                    Transforms.wrapNodes(
                        editor,
                        {
                            type: "bulleted-list",
                            children: []
                        }
                    );
                    Transforms.setNodes(editor, { type: 'list-item' })
                } else {
                    Transforms.unwrapNodes(editor,
                        {
                            match: n => !Editor.isEditor(n) && Element.isElement(n) && n.type === "bulleted-list",
                            //split: isList ? false : true
                            split: true
                        }
                    );
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

const serializeRules: ISerializeRule[] = [
    //inline
    (serializer: Serializer) =>
        Array.of<[mark: string, before: string, after?: string]>(
            ['bold', '**'],
            ['italic', '//'],
            ['underline', '__'],
            ['deleted', '--']
        ).forEach(m => serializer.wrapByMark(...m)),

    //line break
    (serializer: Serializer) => {
        let ranges = serializer.find({
            match: (sText, i, sTexts) => [!sTexts[i - 1], !sTexts[i + 1]],//匹配段首,段末
            split: 'paragraph',
            emptyString: true
        })
        for (const range of ranges) {
            serializer.wrap(['', '<br/>'], { range, priority: 0 })
        }
    },

    //header,quote
    (serializer: Serializer) => {
        let ranges = serializer.find({
            match: (sText, i, sTexts) => [!sTexts[i - 1] && (sText.headerLevel || sText.quoteLevel), !sTexts[i + 1]],//匹配段首/末
            split: 'paragraph'
        })
        for (const range of ranges) {
            let { headerLevel, quoteLevel } = serializer.sTexts[range[0]];
            let str = quoteLevel ? new Array(quoteLevel).fill('>').join('') + ' ' : ''
            str += headerLevel ? new Array(headerLevel).fill('+').join('') + ' ' : ''
            serializer.wrap([str, ''], { range, priority: 0 })
        }
    },

    //list
    (serializer: Serializer) => {
        let ranges = serializer.find({
            match: (sText, i, sTexts) => [!sTexts[i - 1] && (sText.numberedListLevel || sText.bulletedListLevel), !sTexts[i + 1]],//匹配段首/末
            split: 'paragraph'
        })
        for (const range of ranges) {
            let { numberedListLevel, bulletedListLevel } = serializer.sTexts[range[0]];
            let str = numberedListLevel ? new Array(numberedListLevel).fill(' ').join('') + '# ' : ''
            str += bulletedListLevel ? new Array(bulletedListLevel).fill('+').join('') + '* ' : ''
            serializer.wrap([str, ''], { range, priority: 1 });
        }

    },

    //link,color
    (serializer: Serializer) => {
        let ranges = serializer.find({
            match: (sText, i, sTexts) => (sText.link || sText.text.color) ? [true, true] : [false, false],
            split: 'paragraph'
        })
        for (const range of ranges) {
            const link = serializer.sTexts[range[0]].link;
            const color = serializer.sTexts[range[0]].text.color;
            if (link) serializer.wrap([`[[[${link} | `, ']]]'], { range, priority: 4 })
            if (color) serializer.wrap([`#${color}|`, '##'], { range, priority: 3 })//16进制color自带一个#
        }
    },

    //
    (serializer: Serializer) => {
        let ranges = serializer.find({
            match: (sText, i, sTexts) => [sTexts[i].horizontalLine, sTexts[i].horizontalLine],
            split: 'paragraph',
            emptyString: true
        })
        for (const range of ranges) {
            serializer.wrap(['----', ''], { range })
        }
    },

    //number list,bulleted list
    //TODO
]

const editorConfig = {
    nodeMap,
    serializeRules
}

export default editorConfig;