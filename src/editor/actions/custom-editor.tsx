import {Editor, BaseEditor, Transforms, Element, Text} from "slate";
import "../type";
import {CustomEditor, CustomElement} from "../type";

interface ICustomCommand<Editor = CustomEditor, Type = string, Args = Object | null> {
    (editor: Editor, type: Type, args?: Args): any
}

namespace CustomCommand {
    export const isMarkActive: ICustomCommand = (editor, format) => {
        const marks = Editor.marks(editor)
        return marks ? marks[format] === true : false
    }

    export const toggleMark: ICustomCommand = (editor, format) => {
        const isActive = isMarkActive(editor, format)
        if (isActive) {
            Editor.removeMark(editor, format)
        } else {
            Editor.addMark(editor, format, true)
        }
    }


    export const isBlockActive: ICustomCommand = (editor, format) => {
        // @ts-ignore
        const [match] = Editor.nodes(editor, {
            match: n =>
                !Editor.isEditor(n) && Element.isElement(n) && n.type === format,
        })

        return !!match
    }

    export const toggleBlock: ICustomCommand = (editor, format) => {
        const isActive = isBlockActive(editor, format)
        if (isActive) Transforms.setNodes(editor, {type: 'paragraph',children:[]})

        if (!isActive) Transforms.setNodes(editor, {type: format,children:[]})
    }
}

export {CustomCommand}