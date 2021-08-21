import { InboxOutlined } from "@ant-design/icons";
import { Button as AntdButton, ButtonProps, Divider, Dropdown, Menu, message, Modal, Space, Upload } from "antd";
import { DraggerProps } from "antd/lib/upload";
import ClipboardJS from "clipboard";
import { saveAs } from 'file-saver';
import { Editor } from "slate";
import { useSlate } from "slate-react";
import { AchievedNode, BlockNode, InlineNode, TextCommand as command, useEditorInfo } from "..";
const { Dragger } = Upload;

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

export const InlineButton: React.FC<{ format: InlineNode & AchievedNode, attr?: Object, isActive?: (editor: Editor) => boolean, icon?: React.ReactNode } & ButtonProps> = (props) => {
    const editor = useSlate();
    const { format, attr, icon, ...buttonProps } = props

    return (
        <AntdButton size='small' type="text" icon={icon} title={format.title}
            style={{
                color: (format.isActive ? format.isActive(editor, attr) : command.isBlockActive(format.key)) ? "#1890ff" : undefined
            }}
            onClick={e => {
                e.preventDefault()
                format.achieve(editor, attr);
}}
{...buttonProps }
        >
    { props.children }
        </AntdButton >
    )
}
export const BlockButton: React.FC<{ format: BlockNode & AchievedNode, attr?: Object, icon?: React.ReactNode } & ButtonProps> = (props) => {
    const editor = useSlate();
    const { format, attr = {}, icon, ...buttonProps } = props;

    return (
        <AntdButton size='small' style={{
            color: (format.isActive ? format.isActive(editor, attr) : command.isBlockActive(format.key)) ? "#1890ff" : undefined
        }}
            type="text"
            icon={icon}
            onClick={e => {
                e.preventDefault();
                format.achieve(editor, attr);
            }}
            {...buttonProps}
        >
            {props.children}
        </AntdButton>
    )
}

export const StartMenu = () => {
    const { editor, initialValue, serialize } = useEditorInfo();
    return <div className='header'>
        <Dropdown.Button size='small' type='ghost' trigger={["hover"]}
            overlay={
                <Menu onClick={
                    ev => {
                        switch (ev.key) {
                            case 'new':
                                Modal.confirm({
                                    title: '新建',
                                    onOk: () => {
                                        localStorage.removeItem('content');
                                        window.location.reload();
                                    },
                                    content:
                                        <>
                                            您当前的文本会被清除且无法恢复,请确保当前文本已保存或导出
                                        </>,
                                });
                                break;
                            case 'open':
                                const reader = new FileReader();
                                let file: Blob;
                                reader.onload = (evt) => {
                                    if (!evt.target || typeof evt.target.result !== 'string') return message.error(`打开失败`);
                                    message.success(`已打开`);
                                    //editor.children = JSON.parse(evt.target.result) as Descendant[];
                                    localStorage.setItem('content', evt.target.result);
                                    window.location.reload();
                                };
                                const props: DraggerProps = {
                                    name: 'file',
                                    multiple: false,
                                    beforeUpload: (f) => {
                                        file = f;
                                        return false;
                                    }
                                };
                                Modal.confirm({
                                    title: '打开文件',
                                    onOk: () => {
                                        reader.readAsText(file);
                                    },
                                    content:
                                        <>
                                            <Dragger {...props}>
                                                <p className="ant-upload-drag-icon">
                                                    <InboxOutlined />
                                                </p>
                                                <p className="ant-upload-text">点击或拖延文件到此处以打开</p>
                                                <p className="ant-upload-hint">
                                                    打开操作会覆盖您当前的文本，请确保当前文本已保存或导出
                                                </p>
                                            </Dragger>
                                        </>,
                                });
                                break;
                            case 'export':
                                Modal.confirm({
                                    title: '导出为wikidot',
                                    content:
                                        <>
                                            <pre id='export-output' dangerouslySetInnerHTML={{ __html: serialize(editor).serializeAll() }} />
                                            <AntdButton id='export-copy' data-clipboard-action="copy" data-clipboard-target="#export-output">copy</AntdButton>
                                        </>,
                                });
                                break;
                            case 'save':
                                saveAs(new Blob([JSON.stringify(initialValue)], { type: 'application/json' }), "atmx.json");
                                break;
                        }
                    }
                }>
                    <Menu.Item key='new'>新建</Menu.Item>
                    <Menu.Item key='open'>打开</Menu.Item>
                    <Menu.Item key='export'>导出</Menu.Item>
                    <Menu.Item key='save'>保存到本地</Menu.Item>
                </Menu>
            }>开始</Dropdown.Button>
    </div>
}
export { ToolBar };
