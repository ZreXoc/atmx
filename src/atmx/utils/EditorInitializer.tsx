import isUrl from "is-url";
import { createEditor, Descendant, Editor, Element, Node, Transforms } from "slate";
import { withHistory } from "slate-history";
import { DefaultElement, ReactEditor, RenderElementProps, RenderLeafProps, withReact } from "slate-react";
import { CustomLeaf, EditorConfig, EditorInfo, serializeWithEditor, TextCommand } from "..";

export class EditorInitializer {
    private editor: Editor;
    private config!: EditorConfig;
    private originValue!: Descendant[];

    withHistory() {
        withHistory(this.editor);
        return this;
    };

    withAtmx() {
        withAtmx(this.editor)
        return this;
    }

    setConfig(config: EditorConfig) {
        this.config = config;
        return this;
    };

    setValue(value: Descendant[]) {
        this.originValue = value;
        return this;
    }

    build() {
        const { editor, originValue, config: { nodeMap, serializeRules } } = this;

        if (!originValue) throw Error("\"value\" undefined. use \"setValue()\" to initialize before build")

        const renderLeaf = (props: RenderLeafProps) => {
            let leaf = new CustomLeaf(props);

            Object.values(nodeMap.inline).forEach(inlineNode => {
                if(!inlineNode.key) return;
                if (props.leaf.hasOwnProperty(inlineNode.key)) {
                    inlineNode.render(leaf);
                }
            })

            if (props.leaf.color) leaf.appendStyle({ color: props.leaf.color })
            return leaf.render();
        }

        const renderElement = (props: RenderElementProps) => {
            let element;

            Object.values(nodeMap.block).some(ele => {
                if (props.element.type === ele.key) {
                    element = ele.render(props, props.element);
                    return true
                }
                return false;
            })

            return element || <DefaultElement {...props} />
        }

        const serialize = () => serializeWithEditor(editor, serializeRules);

        const editorInfo = () => { return { editor, originValue, initialValue: editor.children, renderLeaf, renderElement, nodeMap, serialize } };
        return (editorInfo as EditorInfo)
    }

    constructor() {
        this.editor = withReact(createEditor() as ReactEditor);
    }
}

const withAtmx = (editor: Editor) => {
    const { insertText, isInline, isVoid, normalizeNode } = editor
    const { insertData } = (editor as ReactEditor);

    editor.isInline = element => {
        return element.type === 'link' ? true : isInline(element)
    }

    editor.isVoid = element => {
        return element.type === 'horizontal-line' ? true : isVoid(element)
    }

    editor.insertText = text => {
        if (text && isUrl(text)) {
            TextCommand.wrapLink(text)
        } else {
            insertText(text)
        }
    }

    (editor as ReactEditor).insertData = data => {
        const text = data.getData('text/plain')

        if (text && isUrl(text)) {
            TextCommand.wrapLink(text)
        } else {
            insertData(data)
        }
    }

    editor.normalizeNode = entry => {
        const [node, path] = entry
        const LIST_TYPES = ['numbered-list', 'bulleted-list']

        if (Element.isElement(node) &&
            (node.type === 'paragraph' || node.type.match(/header-*/) || node.type === 'list-item')
        ) {
            for (const [child, childPath] of Node.children(editor, path)) {
                if (Element.isElement(child) && !editor.isInline(child)) {
                    Transforms.unwrapNodes(editor, { at: childPath });
                    return;
                }
            }
        }

        //parent of 'list-item' must be a list, or its type will be changed into 'paragraph'
        //descendant of 'list-item' must be inline
        if (Element.isElement(node) && node.type === 'list-item') {
            let parent = Node.parent(editor, path);
            if (Editor.isEditor(parent) || !LIST_TYPES.includes(parent.type)) {
                Transforms.setNodes(editor, { type: 'paragraph' }, { at: path });
                return;
            }
        }

        //list.children:{type:'list-item'}[], list.firstChildren:{type:LIST_TYPES}
        if (Element.isElement(node) && LIST_TYPES.includes(node.type)) {
            let isFirstChild = true;
            for (const [child, childPath] of Node.children(editor, path)) {
                if (Element.isElement(child) && isFirstChild && LIST_TYPES.includes(child.type))
                    Transforms.unwrapNodes(editor, { at: childPath, split: true });

                if (Element.isElement(child) && !(child.type === 'list-item' || LIST_TYPES.includes(child.type)))
                    Transforms.setNodes(editor, { type: 'list-item' }, { at: childPath });
                isFirstChild = false;
            }

            /*const parent = Node.parent(editor,path);
            const parentPath = path.slice(0,path.length-1)
            for (const [child, childPath] of Node.children(editor, parentPath)) {
                if
            }*/

            return
        }

        normalizeNode(entry)
    }
}