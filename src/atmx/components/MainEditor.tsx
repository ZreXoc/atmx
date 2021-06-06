import React, { useMemo, useState, useCallback } from "react";
import { createEditor } from "slate";
import { Slate, Editable, withReact, ReactEditor, RenderLeafProps, RenderElementProps } from "slate-react";

import { ToolBar, PropertiesPanel } from "..";
import { CustomCommand, renderLeaf ,CustomEditor} from "..";
import { style } from "..";

import { Layout } from "antd";
import '../index.less';

import isUrl from 'is-url';

const { Header, Content, Sider, Footer } = Layout;

const MainEditor: React.FC = props => {
    const editor = useMemo(() => withDefault(withReact(createEditor() as ReactEditor)), []) as CustomEditor;
    const [value, setValue] = useState(
        JSON.parse(localStorage.getItem('content/') as string) //TODO
        || [{ "type": "header-three", "children": [{ "text": "你" }, { "text": "好！", "italic": true }] }, { "type": "", "children": [{ "text": "欢迎测试的发送发达撒分" }] }, { "type": "paragraph", "children": [{ "text": "不要清空后输入中文", "italic": true }] }, { "type": "paragraph", "children": [{ "text": "不要使用手机输入法", "italic": true, "underline": true, "bold": true }] }, { "type": "paragraph", "children": [{ "text": "左上可导出（链接暂不可）", "italic": true, "underline": true }] }, { "type": "paragraph", "children": [{ "text": "右键打开链接", "deleted": true }, { "text": " 暂不可用" }] }, { "type": "paragraph", "children": [{ "text": "" }, { "type": "link", "url": "http://smlt.wikidot.com/zeexoc:wdot", "children": [{ "text": "link", "italic": true, "underline": true }] }, { "text": "" }] }]
    )


    const renderElement = useCallback(props => {
        let element;
        Object.values(style.block).some(block => {
            if (props.element.type === block.key) {
                element = block.render(props);
                return true
            }
        })

        return element || <DefaultElement {...props} />
    }, [])

    // 通过 `useCallback` 定义一个可以记忆的渲染叶子节点的函数。
    /*const renderLeaf = useCallback(props => {
        return <Leaf {...props} />
    }, [])*/

    return (
        <Layout id={'editor-container'} className="site-layout">
            <Slate editor={editor as ReactEditor} value={value}
                onChange={value => {
                    setValue(value);
                    // 在 Local Storage 里保存值
                    const content = JSON.stringify(value)
                    localStorage.setItem('content', content)
                }}>
                <div className='editor-header'>
                    <Header className="site-layout-background editor-headbar"
                    >
                        <ToolBar />
                    </Header>
                </div>
                <div className='editor-main'>
                    <Content className="site-layout-background editor-content" >
                        <Editable
                            className={'edit-area'}
                            renderElement={renderElement}
                            renderLeaf={renderLeaf}
                            onKeyDown={
                                e => {
                                    //e.preventDefault();
                                }
                            }
                            spellCheck
                            autoFocus
                        />
                    </Content>
                    <Sider className="site-layout-background editor-sidebar" >
                        <PropertiesPanel />
                    </Sider>
                    {/* <Footer style={{ textAlign: 'center' }}>ATMX Created by ZeeXoc</Footer> */}
                </div>
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

const withDefault = (editor: ReactEditor) => {
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