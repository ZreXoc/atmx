import { Editor, BaseEditor, Transforms, Element, Text, Range } from "slate";
import "../type";
import { CustomEditor, CustomElement, LinkElement } from "../type";

interface ICustomCommand<Args = Object> {
  (editor: CustomEditor, args: Args): any
}

namespace CustomCommand {
  export const isMarkActive: ICustomCommand<string> = (editor, format) => {
    const marks = Editor.marks(editor)
    return marks ? marks[format] === true : false
  }

  export const getMark: ICustomCommand<string> = (editor, key) => {
    const marks = Editor.marks(editor)
    return marks ? marks[key] : null;
  }

  export const toggleMark: ICustomCommand<string> = (editor, key) => {
    const isActive = isMarkActive(editor, key)
    if (isActive) {
      Editor.removeMark(editor, key)
    } else {
      Editor.addMark(editor, key, true)
    }
  }

  export const addMark = Editor.addMark

  export const removeMark: ICustomCommand<string> = (editor, key) => {
    if (isMarkActive(editor, key)) Editor.removeMark(editor, key)
  }


  export const isBlockActive: ICustomCommand = (editor, format) => {
    const [match] = Editor.nodes(editor, {
      match: n =>
        !Editor.isEditor(n) && Element.isElement(n) && n.type === format,
    })

    return !!match
  }

  export const toggleBlock: ICustomCommand<string> = (editor, key) => {
    const isActive = isBlockActive(editor, key)

    Transforms.setNodes(
      editor,
      { type: isActive ? undefined : key },
      { match: n => Editor.isBlock(editor, n) }
    )
  }

  export const insertLink = (editor: CustomEditor, url: string) => {
    if (editor.selection) {
      wrapLink(editor, url)
    }
  }

  export const isLinkActive = (editor: CustomEditor) => isBlockActive(editor, 'link')

  export const unwrapLink = (editor: CustomEditor) => {
    Transforms.unwrapNodes(editor, {
      match: n =>
        !Editor.isEditor(n) && Element.isElement(n) && n.type === 'link',
    })
  }

  export const wrapLink = (editor: CustomEditor, url: string) => {
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

export { CustomCommand }