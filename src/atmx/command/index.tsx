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

  export const toggleBlock = (editor: CustomEditor, format: string, option?: {
    nested?: boolean
  }) => {
    const isActive = isBlockActive(editor, format)
    const isList = LIST_TYPES.includes(format)
    const { nested } = option || { nested: false };

    const { selection } = editor;

    if (!isActive || (nested && !Range.isCollapsed(selection as Range))) {
      Transforms.wrapNodes(
        editor,
        {
          type: format,
          children: []
        }
      );
      if (isList) Transforms.setNodes(editor, { type: 'list-item' })
    } else {
      Transforms.unwrapNodes(editor,
        {
          match: n => !Editor.isEditor(n) && Element.isElement(n) && n.type === format,
          split: true
        }
      );

      if (isList) Transforms.setNodes(editor, { type: 'paragraph' },
        { match: n => !Editor.isEditor(n) && Element.isElement(n) && n.type === 'list-item' });
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