import React, { useMemo, useState, useCallback } from "react";
import { Node, Editor, Element, Text, Transforms, Range } from "slate";
import { Slate, ReactEditor, RenderLeafProps, RenderElementProps } from "slate-react";

import { CustomCommand, CustomEditor } from "..";


import { Layout } from "antd";
import '../../index.less';

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
                }}     
                >
                {props.children}
            </Slate>
        </Layout>
    )
}

export const withDefault = (editor: ReactEditor) => {
    const { insertData, insertText, isInline, isVoid } = editor

    editor.isInline = element => {
        return element.type === 'link' ? true : isInline(element)
    }

    editor.isVoid = element => {
        return element.type === 'horizontal-line' ? true : isVoid(element)
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