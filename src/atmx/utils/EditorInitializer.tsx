import isUrl from "is-url";
import { createEditor, Descendant, Editor, Element, Node, Transforms } from "slate";
import { withHistory } from "slate-history";
import { DefaultElement, ReactEditor, RenderElementProps, RenderLeafProps, withReact } from "slate-react";
import { CustomLeaf, IRenderMap, SerializeMap, Serializer, serializeWithEditor, TextCommand } from "..";

export class EditorInitializer {
    private editor: Editor;
    private config!: { renderMap: IRenderMap, serializeMap: SerializeMap };
    private initialValue!: Descendant[];

    withHistory() {
        withHistory(this.editor);
        return this;
    };

    withAtmx() {
        const editor = this.editor;
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

            //parent of 'list-item' must be a list, or its type will be changed into 'paragraph'
            const LIST_TYPES = ['numbered-list', 'bulleted-list']
            if (Element.isElement(node) && node.type === 'list-item') {
                let parent = Node.parent(editor, path);
                if (Editor.isEditor(parent) || !LIST_TYPES.includes(parent.type)) {
                    Transforms.setNodes(editor, { type: 'paragraph' })
                }
            }

            //list.children:{type:'list-item'}[], list.firstChildren:{type:LIST_TYPES}
            if (Element.isElement(node) && (node.type === 'numbered-list' || node.type === 'bulleted-list')) {
                let first = true;

                for (const [child, childPath] of Node.children(editor, path)) {
                    if (Element.isElement(child) && first && LIST_TYPES.includes(child.type))
                        Transforms.unwrapNodes(editor, { at: childPath, split: true });

                    if (Element.isElement(child) && !(child.type === 'list-item' || LIST_TYPES.includes(child.type)))
                        Transforms.setNodes(editor, { type: 'list-item' });
                    first = false;
                }
            }
            normalizeNode(entry)
        }

        return this;
    }

    setConfig(config: { renderMap: IRenderMap, serializeMap: SerializeMap }) {
        this.config = config;
        return this;
    };

    setValue(value: Descendant[]) {
        this.initialValue = value;
        return this;
    }

    build() {
        const { editor, initialValue, config: { renderMap, serializeMap } } = this;

        if (!initialValue) throw Error("\"value\" undefined. use \"setValue()\" to initialize before build")

        const renderLeaf = (props: RenderLeafProps) => {
            let leaf = new CustomLeaf(props);

            Object.values(renderMap.inline).forEach(inlineStyle => {
                if (props.leaf.hasOwnProperty(inlineStyle.key)) {
                    inlineStyle.render(leaf);
                }
            })

            if (props.leaf.color) leaf.appendStyle({ color: props.leaf.color })
            return leaf.render();
        }

        const renderElement = (props: RenderElementProps) => {
            let element;

            Object.values(renderMap.block).some(ele => {
                if (props.element.type === ele.key) {
                    element = ele.render(props);
                    return true
                }
                return false;
            })
            Object.values(renderMap.void).some(ele => {
                if (props.element.type === ele.key) {
                    element = ele.render(props);
                    return true
                }
                return false;
            })

            return element || <DefaultElement {...props} />
        }

        const serialize = () => serializeWithEditor(editor, serializeMap);

        const editorConfig = () => { return { editor, initialValue, renderLeaf, renderElement, renderMap, serialize } };

        return (editorConfig as EditorConfig)
    }

    constructor() {
        this.editor = withReact(createEditor() as ReactEditor);
    }
}

export type EditorConfig = () => {
    editor: Editor;
    initialValue: Descendant[]

    renderLeaf: (props: RenderLeafProps) => JSX.Element;

    renderElement: (props: RenderElementProps) => JSX.Element;

    renderMap: IRenderMap;

    serialize: () => Serializer;
}