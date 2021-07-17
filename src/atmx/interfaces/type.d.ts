import { BaseEditor, Descendant } from 'slate'
import { ReactEditor } from 'slate-react'

export type CustomEditor = BaseEditor | ReactEditor

export type ParagraphElement = {
    type: 'paragraph'
    children: CustomText[]
}

export type LinkElement = {
    type: 'link'
    url: string
    children: Descendant[]
}

export type BlockquoteElement = {
    type: 'block-quote'
    children: CustomText[]
}

export type CustomElement = {
    type: string
    children: CustomText[]
} | ParagraphElement | LinkElement | BlockquoteElement | CustomVoid


export type FormattedText = {
    text: string
    bold?: true
    italic?: true
    color?: string
    textAlign?: 'left' | 'center' | 'right'
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