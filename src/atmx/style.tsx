import React from 'react'
import { RenderElementProps, RenderLeafProps } from "slate-react";
import { Typography } from 'antd'
import { LinkElement } from ".";
import { TextProps } from "antd/lib/typography/Text";

const { Text, Link } = Typography;

export interface inlineStyle {
    key: string
    render(leaf: CustomLeaf): CustomLeaf
    title?: string
    hotkey?: string
}

export interface blockStyle {
    key: string
    render(props: RenderElementProps, element?: Element): JSX.Element
    title?: string
    hotkey?: string
}

export interface styleInterface {
    inline: {
        [styleName: string]: inlineStyle
    },
    block: {
        [styleName: string]: blockStyle
    }
}

class CustomLeaf {
    readonly props: RenderLeafProps;

    readonly className: Array<string> = []
    readonly attr: Array<TextProps> = []

    appendClass(className: string) {
        this.className.push(className);
        return this;
    }

    appendAttr(key: string, value: any) {
        this[key] = value;
        return this;
    }

    constructor(props: RenderLeafProps) {
        this.props = props
    }

    render() {
        return (
            <span
                {...this.props.attributes}
                {...this.attr}
                className={this.className.join(' ')}
            >
                {this.props.children}
            </span>
        )
    }
}

export const renderLeaf= (props:RenderLeafProps) => {
    let leaf = new CustomLeaf(props);

    Object.values(style.inline).forEach(inlineStyle => {

        if (props.leaf.hasOwnProperty(inlineStyle.key)) {
            inlineStyle.render(leaf);
        }
    })
    return leaf.render();
}


export const style: styleInterface = {
    inline: {
        bold: {
            key: 'bold',
            title: '粗体(B)',
            hotkey: 'ctrl+b',
            render: (leaf) => leaf.appendClass('bold')
        },

        italic: {
            key: 'italic',
            title: '斜体(I)',
            hotkey: 'ctrl+i',
            render: (leaf) => leaf.appendClass('italic')
        },

        underline: {
            key: 'underline',
            title: '下划线(I)',
            hotkey: 'ctrl+u',
            render: (leaf) => leaf.appendClass('underline')
        },

        deleted: {
            key: 'deleted',
            title: '删除线(D)',
            hotkey: 'ctrl+d',
            render: (leaf) => leaf.appendClass('deleted')
        }
    },
    block: {
        //header
        headerOne: {
            key: 'header-one',
            title: '一级标题(H)',
            render:(props: RenderElementProps)=><h1 {...props.attributes}>{props.children}</h1>

        }, headerTwo: {
            key: 'header-two',
            title: '二级标题',
            render:(props: RenderElementProps)=><h2 {...props.attributes}>{props.children}</h2>

        }, headerThree: {
            key: 'header-three',
            title: '三级标题',
            render:(props: RenderElementProps)=><h3 {...props.attributes}>{props.children}</h3>
        },
        link: {
            key: 'link',
            title: '链接',
            render(props: RenderElementProps) {
                const element = props.element as LinkElement;
                return (<a href={element.url} {...props.attributes}>{props.children}</a>)
            }
        },
        blockquote:{
            key: 'block-quote',
            title: '引用',
            render:(props: RenderElementProps) => <blockquote {...props.attributes}>{props.children}</blockquote>
        }
    }
}