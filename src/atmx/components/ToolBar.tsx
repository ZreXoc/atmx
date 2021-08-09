import * as Icon from "@ant-design/icons";
import { Button as AntdButton, ButtonProps, Divider, Dropdown, Menu, message, Modal, Space } from "antd";
import ClipboardJS from "clipboard";
import isUrl from "is-url";
import { Editor, Range, Transforms } from "slate";
import { useSlate } from "slate-react";
import { blockStyle, CustomEditor, inlineStyle, TextCommand as command, useEditorConfig } from "..";



const ToolBar: React.FC = props => {
    const { renderMap,serialize } = useEditorConfig();
    const { inline, block, void: voidStyle } = renderMap;

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
                                                        <pre id='export-output' dangerouslySetInnerHTML={{ __html: serialize.toString() }} />
                                                        <AntdButton id='export-copy' data-clipboard-action="copy" data-clipboard-target="#export-output">copy</AntdButton>
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
                        icon={<Icon.StrikethroughOutlined />}
                    />
                </div>
                <div>
                    <LinkButton />
                    <BlockButton
                        format={block.blockquote}
                        handleClick={(e: React.MouseEvent, editor: CustomEditor) => {
                            const isActive = command.isBlockActive(block.blockquote.key)
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
                    <BlockButton format={block.numberedList}
                        handleClick={() => command.toggleBlock(block.numberedList.key, { nested: true })} icon={<Icon.OrderedListOutlined />} />
                    <BlockButton format={block.bulletedList}
                        handleClick={() => command.toggleBlock(block.bulletedList.key, { nested: true })} icon={<Icon.UnorderedListOutlined />} />
                </div>
                <div>
                    <BlockButton format={voidStyle.horizontalLine} icon={<Icon.MinusOutlined />}
                        handleClick={() => command.insertVoid({ type: 'horizontal-line', children: [{ text: '' }] })} />
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
    const { format, icon, ...buttonProps } = props
    return (
        <AntdButton size='small' type="text" icon={icon} title={format.title}
            style={{
                color: command.isMarkActive(format.key) ? "#1890ff" : undefined
            }}
            onClick={e => {
                e.preventDefault()
                command.toggleMark(format.key)
            }}
            {...buttonProps}
        >
            {props.children}
        </AntdButton>
    )
}
const BlockButton: React.FC<{ format: blockStyle, icon?: React.ReactNode, handleClick?: (e: React.MouseEvent, editor: CustomEditor) => void } & ButtonProps> = (props) => {
    const editor = useSlate()

    const { format, icon } = props
    const handleClick = props.handleClick || (() => { command.toggleBlock(format.key) })
    return (
        <AntdButton size='small' type="text" icon={icon} title={format.title}
            style={{
                color: command.isBlockActive(format.key) ? "#1890ff" : undefined
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
    const { isLinkActive, insertLink, unwrapLink } = command;

    return (
        <Button
            type='text'
            isActive={command.isLinkActive()}
            onMouseDown={event => {
                event.preventDefault()
                if (isLinkActive()) {
                    unwrapLink()
                } else {
                    const url = window.prompt('Enter the URL of the link:');
                    url ? isUrl(url) ? insertLink(url) : message.error('不合法的url:' + url) : message.error('url不可为空');
                }

            }}
        >
            <Icon.LinkOutlined />
        </Button>
    )
}

export { ToolBar };
