import {Editor, BaseEditor, Transforms, Element, Text,Range} from "slate";
import "../type";
import {CustomEditor, CustomElement, LinkElement} from "../type";

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
        const [match] = Editor.nodes(editor, {
            match: n =>
                !Editor.isEditor(n) && Element.isElement(n) && n.type === format,
        })

        return !!match
    }

    export const toggleBlock: ICustomCommand = (editor, format) => {
        const isActive = isBlockActive(editor, format)

        Transforms.setNodes(
            editor,
            { type: isActive ? undefined : format },
            { match: n => Editor.isBlock(editor, n) }
          )
    }

    export const insertLink = (editor:CustomEditor,url:string) => {
        if (editor.selection) {
          wrapLink(editor, url)
        }
      }
      
      export const isLinkActive = (editor:CustomEditor)=>isBlockActive(editor,'link')
      
      export const unwrapLink =( editor:CustomEditor)  => {
        Transforms.unwrapNodes(editor, {
          match: n =>
            !Editor.isEditor(n) && Element.isElement(n) && n.type === 'link',
        })
      }
      
      export  const wrapLink = (editor:CustomEditor, url:string) => {
        if (isLinkActive(editor)) {
          unwrapLink(editor)
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

}

export {CustomCommand}