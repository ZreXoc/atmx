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
} | ParagraphElement | LinkElement|BlockquoteElement


export type FormattedText = { 
    text: string
    bold?: true
    italic?: true 
    color?:string
 }

export type CustomText = FormattedText

declare module 'slate' {
    interface CustomTypes {
        Editor: CustomEditor
        Element: CustomElement
        Text: CustomText
        Node: CustomEditor | CustomElement | CustomText
    }
}