import { Button as AntdButton, ButtonProps, Divider, Dropdown, Menu, Modal, Space } from "antd";
import ClipboardJS from "clipboard";

import { AchievedNode, BlockNode, InlineNode, TextCommand as command, useEditorInfo } from "..";

const ToolBar: React.FC = props => {
    const { editor } = useEditorInfo();
    command.setEditor(editor);

    new ClipboardJS('#export-copy');

    return (
        <>
            <Space split={<Divider type="vertical" />}>
                {props.children}
            </Space>
        </>
    );
}

export const DefaultButton: React.FC<{ isActive?: boolean } & ButtonProps> = (props) => {
    const { isActive = false, ...buttonProps } = props;
    return (
        <AntdButton
            style={{
                color: isActive ? "#1890ff" : undefined
            }}
            {...buttonProps}>
            {props.children}
        </AntdButton>
    )
}

export const InlineButton: React.FC<{ format: InlineNode & AchievedNode, icon?: React.ReactNode } & ButtonProps> = (props) => {
    const { editor } = useEditorInfo()
    const { format, icon, ...buttonProps } = props

    return (
        <AntdButton size='small' type="text" icon={icon} title={format.title}
            style={{
                color: command.isMarkActive(format.key) ? "#1890ff" : undefined
            }}
            onClick={e => {
                e.preventDefault()
                format.achieve(editor);
            }}
            {...buttonProps}
        >
            {props.children}
        </AntdButton>
    )
}
export const BlockButton: React.FC<{ format: BlockNode & AchievedNode, icon?: React.ReactNode } & ButtonProps> = (props) => {
    const { editor } = useEditorInfo();
    const { format, icon } = props;

    return (
        <AntdButton size='small' style={{
            color: command.isBlockActive(format.key) ? "#1890ff" : undefined
        }}
            type="text"
            icon={icon}
            onClick={e => {
                e.preventDefault();
                format.achieve(editor);
            }}
        >
            {props.children}
        </AntdButton>
    )
}

export const StartMenu = () => {
    const { serialize } = useEditorInfo();
    return <div className='header'>
        <Dropdown.Button size='small' type='ghost' trigger={["hover"]}
            overlay={
                <Menu onClick={
                    ev => {
                        switch (ev.key) {
                            case 'export':
                                Modal.confirm({
                                    title: '导出为wikidot',
                                    content:
                                        <>
                                            <pre id='export-output' dangerouslySetInnerHTML={{ __html: serialize().toString() }} />
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
}
export { ToolBar };
