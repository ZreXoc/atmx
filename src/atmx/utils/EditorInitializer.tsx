import isUrl from "is-url";
import { Ancestor, createEditor, Descendant, Editor, Element, Node, Transforms } from "slate";
import { withHistory } from "slate-history";
import { DefaultElement, ReactEditor, RenderElementProps, RenderLeafProps, withReact } from "slate-react";
import { LeafRender, EditorConfig, EditorInfo, Serialize, TextCommand } from "..";

export class EditorInitializer<T extends Serialize.Context> {
    private editor: Editor;
    private config!: EditorConfig<T>;
    private originValue!: Descendant[];

    withHistory() {
        withHistory(this.editor);
        return this;
    };

    withAtmx() {
        withAtmx(this.editor)
        return this;
    }

    setConfig(config: EditorConfig<T>) {
        this.config = config;
        return this;
    };

    setValue(value: Descendant[]) {
        this.originValue = value;
        return this;
    }

    build() {
        const { editor, originValue, config: { nodeMap, serialize: _serialize } } = this;

        if (!originValue) throw Error("\"value\" undefined. use \"setValue()\" to initialize before build")

        const renderLeaf = (props: RenderLeafProps) => {
            let leafRender = new LeafRender(props);

            Object.values(nodeMap.inline).forEach(inlineNode => {
                if (!inlineNode.key) return;
                if (props.leaf.hasOwnProperty(inlineNode.key)) {
                    inlineNode.render(leafRender);
                }
            })

            if (props.leaf.color) leafRender.appendStyle({ color: props.leaf.color })
            return leafRender.render();
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

        const serialize = (node: Ancestor) => {
            let { markRules, serializeHandlers, length } = _serialize;
            return new Serialize.Serializer<T>(node, markRules, serializeHandlers, length)
        };

        const editorInfo = () => { return { editor, originValue, initialValue: editor.children, renderLeaf, renderElement, nodeMap, serialize } };
        return (editorInfo as EditorInfo<T>)
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
        if (Element.isElement(node) && node.type === 'block-quote') {
            for (const [child, childPath] of Node.children(editor, path)) {
                if (Element.isElement(child) && editor.isInline(child)) {
                    Transforms.wrapNodes(editor, { type: 'paragraph', children: [] }, { at: childPath });
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

        //list.child:{ type: 'list-item' || node.type }, list.firstChildren:{ type: 'list-item' }
        if (Element.isElement(node) && LIST_TYPES.includes(node.type)) {
            let isFirstChild = true;
            for (const [child, childPath] of Node.children(editor, path)) {
                if (!Element.isElement(child)) {
                    isFirstChild = false;
                    continue;
                }
                if (isFirstChild && LIST_TYPES.includes(child.type))
                    Transforms.unwrapNodes(editor, { at: childPath, split: true });

                if (child.type !== 'list-item' && !LIST_TYPES.includes(child.type))
                    Transforms.setNodes(editor, { type: 'list-item' }, { at: childPath });

                if (LIST_TYPES.includes(child.type) && child.type !== node.type)
                    Transforms.setNodes(editor, { type: node.type }, { at: childPath });

                isFirstChild = false;
            }

            return
        }

        normalizeNode(entry)
    }
}