import { Editor, Element, Transforms, Range, Text } from "slate";
import { LinkElement, CustomVoid } from "..";

let editor: Editor;

export const setEditor = (customEditor: Editor) => {
    editor = customEditor;
}

export function isMarkActive(key: string) {
    const marks = Editor.marks(editor);
    return marks && !!marks[key]
}

export function getMark(key: string) {
    const marks = Editor.marks(editor)
    return marks ? marks[key] : null;
}

export const addMark = (key: string, value: any) => Editor.addMark(editor, key, value);

export function removeMark(key: string) {
    if (isMarkActive(key)) Editor.removeMark(editor, key)
}

export function toggleMark(key: string, value: any = true) {
    const isActive = isMarkActive(key)
    if (isActive) {
        Editor.removeMark(editor, key)
    } else {
        Editor.addMark(editor, key, value)
    }
}

export function isBlockActive(key: string) {
    const [match] = Editor.nodes(editor, {
        match: n =>
            !Editor.isEditor(n) && Element.isElement(n) && n.type === key,
    })

    return !!match
}

export const LIST_TYPES = ['numbered-list', 'bulleted-list']

export function toggleBlock(key: string, option?: {
    split?: boolean
    nested?: boolean
}) {
    const isActive = isBlockActive(key);
    const { nested = false, split = false } = option || {};

    const { selection } = editor;

    if (!isActive || (nested && !Range.isCollapsed(selection as Range))) {
        Transforms.wrapNodes(
            editor,
            {
                type: key,
                children: []
            }
        );
    } else {
        let isChildText = false;
        Transforms.unwrapNodes(editor, {
            match: n => {
                if (!Editor.isEditor(n) && Element.isElement(n) && n.type === key) {
                    isChildText = Text.isText(n.children[0]);
                    return !isChildText
                }
                return false
            },
            split
        })

        if (isChildText)
            Transforms.setNodes(editor,
                {
                    type: 'paragraph',
                },
                {
                    match: n => !Editor.isEditor(n) && Element.isElement(n) && n.type === key,
                    split
                }
            );
    }
}


export function insertLink(url: string) {
    if (editor.selection) {
        wrapLink(url)
    }
}

export function isLinkActive() {
    return isBlockActive('link')
}

export function unwrapLink() {
    Transforms.unwrapNodes(editor, {
        match: n =>
            !Editor.isEditor(n) && Element.isElement(n) && n.type === 'link',
    })
}

export function wrapLink(url: string) {
    if (isBlockActive('link')) {
        unwrapLink()
    }

    const { selection } = editor
    const isCollapsed = selection && Range.isCollapsed(selection)
    const link: LinkElement = {
        type: 'link',
        url,
        children: isCollapsed ? [{ text: url }] : [],
    }

    if (isCollapsed) {
        Transforms.insertNodes(editor, link)
    } else {
        Transforms.wrapNodes(editor, link, { split: true })
        Transforms.collapse(editor, { edge: 'end' })
    }
}

export const isVoidActive = isBlockActive

export function insertVoid(element: CustomVoid) {
    return Transforms.insertNodes(editor, element)
}
