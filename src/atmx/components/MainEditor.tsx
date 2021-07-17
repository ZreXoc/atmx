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
    const { insertData, insertText, isInline, isVoid, normalizeNode } = editor

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

    editor.normalizeNode = entry => {
        const [node, path] = entry

        //parent of 'list-item' must be a list, or its type will be changed into 'paragraph'
        const LIST_TYPES = ['numbered-list', 'bulleted-list']
        if (Element.isElement(node) && node.type === 'list-item') {
            let parent = Node.parent(editor, path);
            if (Editor.isEditor(parent) || !LIST_TYPES.includes(parent.type)) {
                Transforms.setNodes(editor, { type: 'paragraph' })
            }
        }

        //list.children:{type:'list-item'}[], list.firstChildren:{type:LIST_TYPES}
        if (Element.isElement(node) && (node.type === 'numbered-list' || node.type === 'bulleted-list')) {
            let first = true;
            
            for (const [child, childPath] of Node.children(editor, path)) {
                if (Element.isElement(child) && first && LIST_TYPES.includes(child.type))
                    Transforms.unwrapNodes(editor, { at: childPath, split: true });

                if (Element.isElement(child) && !(child.type === 'list-item' || LIST_TYPES.includes(child.type)))
                    Transforms.setNodes(editor, { type: 'list-item' });
                first = false;
            }
        }

        normalizeNode(entry)
    }

    return editor
}

export { MainEditor }