export type inlineStyle = {
    key: string
    render(leaf: CustomLeaf): CustomLeaf
    title?: string
    hotkey?: string
}

export type blockStyle = {
    key: string
    render(props: RenderElementProps, element?: Element): JSX.Element
    title?: string
    hotkey?: string
}

export type voidStyle = blockStyle

export interface IRenderMap {
    inline: {
        [styleName: string]: inlineStyle
    },
    block: {
        [styleName: string]: blockStyle
    },
    void: {
        [styleName: string]: voidStyle
    }
}
