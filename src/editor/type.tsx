import {BaseEditor} from 'slate'
import {ReactEditor} from 'slate-react'

export type CustomEditor = {
    type: string
} & (BaseEditor | ReactEditor)

export type ParagraphElement = {
    type: 'paragraph'
    children: CustomText[]
}

export type HeadingElement = {
    type: 'heading'
    level: number
    children: CustomText[]
}

export type CustomElement = {
    type: string
    children: CustomText[]
} |ParagraphElement | HeadingElement


export type FormattedText = { text: string; bold: boolean; italic: boolean }

export type CustomText = FormattedText

declare module 'slate' {
    interface CustomTypes {
        Editor: CustomEditor
        Element: CustomElement
        Text: CustomText
        Node: CustomEditor | CustomElement | CustomText
    }
}