import { BaseEditor, Descendant } from 'slate'
import { ReactEditor } from 'slate-react'

export type CustomEditor = BaseEditor | ReactEditor

export type ParagraphElement = {
    type: 'paragraph'
    children: Descendant[]
}

export type AlignElement = {
    type: 'text-align',
    children: Descendant[]
    alignType: 'left' | 'center' | 'right'

}

export type LinkElement = {
    type: 'link'
    url: string
    children: FormattedText[]
}

export type BlockquoteElement = {
    type: 'block-quote'
    children: Descendant[]
}

export type NumberList = {
    type: 'number-list'
    children: Descendant[]
}

export type CustomElement = CustomVoid | {
    type: string
    children: Descendant[]
} | ParagraphElement | LinkElement | BlockquoteElement | NumberList | AlignElement


export type FormattedText = {
    text: string
    bold?: true
    italic?: true
    color?: string
}

export type CustomText = FormattedText

export type CustomVoid = ({ type: 'horizontal-line' }) & { children: [{ text: '' }] }

declare module 'slate' {
    interface CustomTypes {
        Node: CustomEditor | CustomElement | CustomText | CustomVoid
        Editor: CustomEditor
        Element: CustomElement
        Text: CustomText
        Void: CustomVoid
    }
}