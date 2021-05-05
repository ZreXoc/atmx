import React from 'react';
import { Button as AntdButton, ButtonProps, Dropdown, Divider, Space, Menu, Modal } from "antd";
import * as Icon from "@ant-design/icons"

import { CustomEditor, CustomCommand, style, blockStyle, inlineStyle } from "..";
import { useSlate } from "slate-react"
import serialize from "../../wikidot/serialize";

const { inline, block } = style;

const ToolBar: React.FC<{ editor: CustomEditor }> = props => {
    const { editor } = props;

    return (
        <>
            <Space split={<Divider type="vertical" />}>
                <div className='header'>
                    <Dropdown.Button title={block.headerOne.title} size='small' trigger={["hover"]}
                        overlay={
                            <Menu onClick={
                                ev => {
                                    switch (ev.key) {
                                        case 'export':
                                            Modal.confirm({
                                                title: '导出为wikidot',
                                                content: <div dangerouslySetInnerHTML={{ __html: serialize(editor) }} />,
                                            });
                                    }
                                }
                            }>
                                <Menu.Item
                                    key='export'
                                >导出
                                             </Menu.Item>
                            </Menu>
                        }>开始</Dropdown.Button>
                    <BlockButton
                        format={block.headerOne}
                    >H1</BlockButton>
                    <BlockButton
                        format={block.headerTwo}
                    >H2</BlockButton>
                    <BlockButton
                        format={block.headerThree}
                    >H3</BlockButton>
                </div>
                <div className='inline'>
                    <MarkButton
                        format={inline.bold}
                        icon={<Icon.BoldOutlined />}
                    />
                    <MarkButton
                        format={inline.italic}
                        icon={<Icon.ItalicOutlined />}
                    />
                    <MarkButton
                        format={inline.underline}
                        icon={<Icon.UnderlineOutlined />}
                    />
                    <MarkButton
                        format={inline.deleted}
                        icon={<Icon.LineOutlined />}
                    />
                </div>
                <div>
                    {/*<InsertLink editor={editor}/>*/}
                </div>
            </Space>
        </>
    );
}

const MarkButton: React.FC<{ format: inlineStyle, icon?: React.ReactNode } & ButtonProps> = (props) => {
    const editor = useSlate()
    const { format, icon } = props
    return (
        <AntdButton size='small' type="text" icon={icon}
            style={{
                color: CustomCommand.isMarkActive(editor, format.key) ? "#1890ff" : undefined
            }}
            onClick={() => CustomCommand.toggleMark(editor, format.key)}
        >
            {props.children}
        </AntdButton>
    )
}
const BlockButton: React.FC<{ format: blockStyle, icon?: React.ReactNode } & ButtonProps> = (props) => {
    const editor = useSlate()
    const { format, icon } = props
    return (
        <AntdButton size='small' type="text" icon={icon}
            style={{
                color: CustomCommand.isBlockActive(editor, format.key) ? "#1890ff" : undefined
            }}
            onClick={() => CustomCommand.toggleBlock(editor, format.key)}
        >
            {props.children}
        </AntdButton>
    )
}

/* const InsertLink: React.FC<{ editor: CustomEditor }> = props => {
    const { editor } = props;
    const getUrl = () => {
        // @ts-ignore
        let [link] = Editor.nodes(editor, {
            match: n =>
                !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'link',
        })
        return link ? link[0].url : ''
    }
    return (
        <>
            <Button title={'导出暂不可用'}
                active={CustomCommand.isBlockActive(editor, block.link.key)}
                onClick={event => {
                    event.preventDefault()
                    //setIsModalVisible(true)
                    const url = window.prompt('Enter the URL of the link:', getUrl())
                    if (!url) return
                    CustomCommand.insertLink(editor, url)
                }}
            >L</Button>
        </>
    )
} */

export { ToolBar };