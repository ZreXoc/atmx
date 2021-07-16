import { Button as AntdButton, Layout, ButtonProps, Dropdown, Divider, Space, Menu, Modal, message } from "antd";
import * as Icon from "@ant-design/icons"

import { Node, Editor, Transforms, Range } from "slate";
import { useSlate } from "slate-react";
import { CustomEditor, CustomCommand as command, style, blockStyle, inlineStyle, Serializer } from "..";
import { serialize, SerializeMap } from "../serialize";
import ClipboardJS from "clipboard";
import isUrl from "is-url";

const { inline, block } = style;

const ToolBar: React.FC<{ serializeMap: SerializeMap }> = props => {
    const editor = useSlate();
    const { serializeMap } = props;

    new ClipboardJS('#export-copy');

    return (
        <>
            <Space split={<Divider type="vertical" />}>
                <div className='header'>
                    <Dropdown.Button title={block.headerOne.title} size='small' type='ghost' trigger={["hover"]}
                        overlay={
                            <Menu onClick={
                                ev => {
                                    switch (ev.key) {
                                        case 'export':
                                            Modal.confirm({
                                                title: '导出为wikidot',
                                                content:
                                                    <>
                                                        <pre id='export-output' dangerouslySetInnerHTML={{ __html: serialize(editor, serializeMap).toString() }} />
                                                        <Button id='export-copy' data-clipboard-action="copy" data-clipboard-target="#export-output">copy</Button>
                                                    </>,
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
                </div>
                <div>
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
                    <InlineButton
                        format={inline.bold}
                        icon={<Icon.BoldOutlined />}
                    />
                    <InlineButton
                        format={inline.italic}
                        icon={<Icon.ItalicOutlined />}
                    />
                    <InlineButton
                        format={inline.underline}
                        icon={<Icon.UnderlineOutlined />}
                    />
                    <InlineButton
                        format={inline.deleted}
                        icon={<Icon.LineOutlined />}
                    />
                </div>
                <div>
                    <LinkButton />
                    <BlockButton
                        format={block.blockquote}
                        handleClick={(e: React.MouseEvent, editor: CustomEditor) => {
                            const isActive = command.isBlockActive(editor, block.blockquote.key)
                            const { selection } = editor;
                            if (!isActive || !Range.isCollapsed(selection as Range)) {
                                Transforms.wrapNodes(
                                    editor,
                                    {
                                        type: 'block-quote',
                                        children: []
                                    },
                                    { match: n => Editor.isBlock(editor, n) }
                                )
                            } else {
                                Transforms.unwrapNodes(
                                    editor,
                                    { match: n => Editor.isBlock(editor, n) && n['type'] === 'block-quote' }
                                )
                            }

                        }}
                    >Q</BlockButton>
                </div>
            </Space>
        </>
    );
}

const Button: React.FC<{ isActive?: boolean } & ButtonProps> = (props) => {
    const { isActive = false } = props;
    return (
        <AntdButton
            style={{
                color: isActive ? "#1890ff" : undefined
            }}
            {...props}>
            {props.children}
        </AntdButton>
    )
}

const InlineButton: React.FC<{ format: inlineStyle, icon?: React.ReactNode } & ButtonProps> = (props) => {
    const editor = useSlate()
    const { format, icon } = props
    return (
        <AntdButton size='small' type="text" icon={icon}
            style={{
                color: command.isMarkActive(editor, format.key) ? "#1890ff" : undefined
            }}
            onClick={e => {
                e.preventDefault()
                command.toggleMark(editor, format.key)
            }}
        >
            {props.children}
        </AntdButton>
    )
}
const BlockButton: React.FC<{ format: blockStyle, icon?: React.ReactNode, handleClick?: (e: React.MouseEvent, editor: CustomEditor) => void } & ButtonProps> = (props) => {
    const editor = useSlate()

    const { format, icon } = props
    const handleClick = props.handleClick || (() => { command.toggleBlock(editor, format.key) })
    return (
        <AntdButton size='small' type="text" icon={icon}
            style={{
                color: command.isBlockActive(editor, format.key) ? "#1890ff" : undefined
            }}
            onClick={e => {
                e.preventDefault()
                handleClick(e, editor)
            }}
        >
            {props.children}
        </AntdButton>
    )
}

const LinkButton = () => {
    const editor = useSlate()
    const { isLinkActive, insertLink, unwrapLink } = command;

    return (
        <Button
            type='text'
            isActive={command.isLinkActive(editor)}
            onMouseDown={event => {
                event.preventDefault()
                if (isLinkActive(editor)) {
                    unwrapLink(editor)
                } else {
                    const url = window.prompt('Enter the URL of the link:');
                    url ? isUrl(url) ? insertLink(editor, url) : message.error('不合法的url:' + url) : message.error('url不可为空');
                }

            }}
        >
            <Icon.LinkOutlined />
        </Button>
    )
}

export { ToolBar };