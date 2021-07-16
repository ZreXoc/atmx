import React, { useMemo, useState, useCallback } from "react";
import { Node, Editor, Element, Text, Transforms, Range } from "slate";
import { Slate, ReactEditor, RenderLeafProps, RenderElementProps } from "slate-react";

import { CustomCommand, CustomEditor } from "..";
import { style } from "..";

import { Layout } from "antd";
import '../index.less';

import isUrl from 'is-url';

const MainEditor: React.FC<{ editor: CustomEditor, value: [], setValue: React.Dispatch<any> }> = props => {
    const { editor, value, setValue } = props;

    return (
        <Layout id={'editor-container'} className="site-layout">
            <Slate editor={editor as ReactEditor} value={value}
                onChange={value => {
                    setValue(value);
                    // 在 Local Storage 里保存值
                    const content = JSON.stringify(value)
                    localStorage.setItem('content', content)
                }}>
                {props.children}
            </Slate>
        </Layout>
    )
}

const Leaf: React.FC<RenderLeafProps> = props => {
    let className: Array<string> = [];

    Object.values(style.inline).forEach(inlineStyle => {

        if (props.leaf.hasOwnProperty(inlineStyle.key)) {
            className.push(inlineStyle.key);
        }
    })


    return (
        <span
            {...props.attributes}
            className={className[0] ? className.join(' ') : 'none'}
        >
            {props.children}
        </span>
    )
}

const DefaultElement: React.FC<RenderElementProps> = props => {
    return <p {...props.attributes}>{props.children}</p>
}

export const withDefault = (editor: ReactEditor) => {
    const { insertData, insertText, isInline } = editor

    editor.isInline = element => {
        return element.type === 'link' ? true : isInline(element)
    }

    editor.insertText = text => {
        if (text && isUrl(text)) {
            CustomCommand.wrapLink(editor, text)
        } else {
            insertText(text)
        }
    }

    editor.insertData = data => {
        const text = data.getData('text/plain')

        if (text && isUrl(text)) {
            CustomCommand.wrapLink(editor, text)
        } else {
            insertData(data)
        }
    }
    return editor
}

export { MainEditor }