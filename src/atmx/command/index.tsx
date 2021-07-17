import { Editor, BaseEditor, Transforms, Element, Text, Range } from "slate";
import { CustomEditor, CustomElement, CustomVoid, LinkElement } from "../";

interface ICommand<Args = Object> {
  (editor: CustomEditor, args: Args): any
}

namespace CustomCommand {
  export const isMarkActive: ICommand<string> = (editor, typeName) => {
    const marks = Editor.marks(editor)
    return marks ? marks[typeName] === true : false
  }

  export const getMark: ICommand<string> = (editor, typeName) => {
    const marks = Editor.marks(editor)
    return marks ? marks[typeName] : null;
  }

  export const toggleMark = (editor: CustomEditor, typeName: string, value: any = true) => {
    const isActive = isMarkActive(editor, typeName)
    if (isActive) {
      Editor.removeMark(editor, typeName)
    } else {
      Editor.addMark(editor, typeName, value)
    }
  }

  export const addMark = Editor.addMark

  export const removeMark: ICommand<string> = (editor, typeName) => {
    if (isMarkActive(editor, typeName)) Editor.removeMark(editor, typeName)
  }


  export const isBlockActive: ICommand<string> = (editor, typeName) => {
    const [match] = Editor.nodes(editor, {
      match: n =>
        !Editor.isEditor(n) && Element.isElement(n) && n.type === typeName,
    })

    return !!match
  }

  const LIST_TYPES = ['numbered-list', 'bulleted-list']

  export const toggleBlock: ICommand<string> = (editor, format) => {
    const isActive = isBlockActive(editor, format)
    const isList = LIST_TYPES.includes(format)

    Transforms.unwrapNodes(editor, {
      match: n =>
        LIST_TYPES.includes(
          !Editor.isEditor(n) && Element.isElement(n) ? n.type : ''
        ),
      split: true,
    })
    const newProperties: Partial<Element> = {
      type: isActive ? 'paragraph' : isList ? 'list-item' : format,
    }
    Transforms.setNodes(editor, newProperties)

    if (!isActive && isList) {
      const block = { type: format, children: [] }
      Transforms.wrapNodes(editor, block)
    }
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

  export const isVoidActive = isBlockActive

  export const insertVoid = (editor: CustomEditor, element: CustomVoid) =>
    Transforms.insertNodes(editor, element)
}

export { CustomCommand }