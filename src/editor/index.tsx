import * as Icon from "@ant-design/icons";
import { Button as AntdButton, Card, Dropdown, Layout, Menu, Modal, Row, Typography } from "antd";
import { useState } from "react";
import { Transforms, Editor, Element } from "slate";
import { BlockButton, EditArea, EditorInitializer, InlineButton, MainEditor, PropertiesPanel, Serialize, StartMenu, ToolBar, useDefaultValue, useEditorInfo } from '../atmx';
import editorConfig, { SContext } from "./config";

const { Header, Content, Sider } = Layout;

const MyEditor: React.FC = () => {
    let value = useDefaultValue();
    let valueFromLC = localStorage.getItem('content');
    if (valueFromLC) value = (JSON.parse(valueFromLC));
    else {
        let key: string;
        Modal.confirm({
            title: '初始化文本',
            onOk: () => {
                if (optionalValues[key]) {
                    const content = JSON.stringify(optionalValues[key]);
                    localStorage.setItem('content', content)
                    window.location.reload();
                }
            },
            content: (
                <ValueInitializer editorValueKey={k => key = k} />
            )
        })
    }

    const editorInfo = (new EditorInitializer<SContext>())
        .withHistory()
        .withAtmx()
        .setConfig(editorConfig)
        .setValue(value)
        .build();
    useEditorInfo(editorInfo);

    const { editor, originValue, serialize } = useEditorInfo();
    const { inline, block } = editorConfig.nodeMap;

    return (
        <>
            <MainEditor>
                <div className='editor-header'>
                    <Header className="site-layout-background editor-header">
                        {/* <ToolBar /> */}
                        <ToolBar>
                            <StartMenu />
                            <div>
                                <Row>
                                    <BlockButton format={block.headerOne} >H1</BlockButton>
                                    <BlockButton format={block.headerTwo} >H2</BlockButton>
                                    <BlockButton format={block.headerThree} >H3</BlockButton>
                                </Row>
                            </div>
                            <div>
                                <Row>
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
                                </Row>
                            </div>
                            <div>
                                <Row>
                                    <InlineButton format={inline.link} icon={<Icon.LinkOutlined />} />
                                    {/* <BlockButton format={block.link} icon={<Icon.LinkOutlined />}></BlockButton> */}
                                    <BlockButton format={block.blockquote}>Q</BlockButton>
                                    <BlockButton format={block.numberedList} icon={<Icon.OrderedListOutlined />} />
                                    <BlockButton format={block.bulletedList} icon={<Icon.UnorderedListOutlined />} />
                                </Row>
                                <Row>
                                    <BlockButton format={block.textAlign} attr={{ alignType: 'left' }} icon={<Icon.AlignLeftOutlined />} />
                                    <BlockButton format={block.textAlign} attr={{ alignType: 'center' }} icon={<Icon.AlignCenterOutlined />} />
                                    <BlockButton format={block.textAlign} attr={{ alignType: 'right' }} icon={<Icon.AlignRightOutlined />} />
                                </Row>
                            </div>
                            <div>
                                <Row>
                                    <BlockButton format={block.horizontalLine} icon={<Icon.MinusOutlined />} />
                                </Row>
                            </div>
                            <div>
                                <Row>
                                    <Dropdown overlay={<QuickInsertMenu editor={editor} />}>
                                        <Typography.Link className="ant-dropdown-link" onClick={e => e.preventDefault()}>
                                            快速插入<Icon.DownOutlined />
                                        </Typography.Link>
                                    </Dropdown>
                                </Row>
                            </div>
                        </ToolBar>
                    </Header>
                </div>

                <div className='editor-main'>
                    <Content className="site-layout-background editor-content" >
                        <EditArea />
                    </Content>
                    <Sider className="site-layout-background editor-sidebar" >
                        <PropertiesPanel />
                    </Sider>
                    {/* <Footer style={{ textAlign: 'center' }}>ATMX Created by ZeeXoc</Footer> */}
                </div>
            </MainEditor >
        </>
    )
}

const optionalValues = {
    withDefault: [{ "type": "paragraph", "children": [{ "text": "请输入文本" }] }],
    withEmpty: [{ "type": "paragraph", "children": [{ "text": "" }] }],
    withStandardSCPFile: [
        { "type": "paragraph", "children": [{ "text": "项目编号：", "bold": true }, { "text": "SCP-CN-XXXX" }] },
        { "type": "paragraph", "children": [{ "text": "" }] },
        { "type": "paragraph", "children": [{ "text": "项目等级：", "bold": true }, { "text": "Safe/Euclid/Keter" }] }, { "type": "paragraph", "children": [{ "text": "" }] },
        { "type": "paragraph", "children": [{ "text": "特殊收容措施：", "bold": true }, { "text": "" }] },
        { "type": "paragraph", "children": [{ "text": "" }] },
        { "type": "paragraph", "children": [{ "text": "描述：", "bold": true }, { "text": "" }] },
        { "type": "paragraph", "children": [{ "text": "" }] },
        { "type": "paragraph", "children": [{ "text": "附录：", "bold": true }, { "text": "" }] }
    ],
    withSCPFileAndAppendix: [
        { "type": "paragraph", "children": [{ "text": "项目编号：", "bold": true }, { "text": "SCP-CN-XXXX" }] },
        { "type": "paragraph", "children": [{ "text": "" }] },
        { "type": "paragraph", "children": [{ "text": "项目等级：", "bold": true }, { "text": "Safe/Euclid/Keter" }] }, { "type": "paragraph", "children": [{ "text": "" }] },
        { "type": "paragraph", "children": [{ "text": "特殊收容措施：", "bold": true }, { "text": "" }] },
        { "type": "paragraph", "children": [{ "text": "" }] },
        { "type": "paragraph", "children": [{ "text": "描述：", "bold": true }, { "text": "" }] },
    ]
}

const contentList = {
    withEmpty: <p>(空)</p>,
    withStandardSCPFile: <pre>
        **项目编号：**SCP-CN-XXXX<br />
        <br />
        **项目等级：**Safe/Euclid/Keter（表明分级）<br />
        <br />
        **特殊收容措施：**[说明收容措施的段落]<br />
        <br />
        **描述：**[描述SCP的段落]
    </pre>,
    withSCPFileAndAppendix: <pre>
        **项目编号：**SCP-CN-XXXX<br />
        <br />
        **项目等级：**Safe/Euclid/Keter（表明分级）<br />
        <br />
        **特殊收容措施：**[说明收容措施的段落]<br />
        <br />
        **描述：**[描述SCP的段落]<br />
        <br />
        **附录：**[可选的附加段落]
    </pre>,
};

const ValueInitializer: React.FC<{ editorValueKey: (v: string) => any }> = (props) => {
    const tabList = [
        {
            key: 'withEmpty',
            tab: '空'
        },
        {
            key: 'withStandardSCPFile',
            tab: '标准scp文档'
        },
        {
            key: 'withSCPFileAndAppendix',
            tab: '带实验记录的scp文档'
        },
    ];



    const [key, setKey] = useState('withEmpty');
    const onTabChange = (key: string) => {
        setKey(key);
        props.editorValueKey(key);
    };
    return (
        <>
            <Card
                style={{ width: '100%' }}
                title="选择文档格式"
                tabList={tabList}
                activeTabKey={key}
                onTabChange={onTabChange}
            >{contentList[key]}
            </Card>
        </>)
}

const QuickInsertMenu = (props: { editor: Editor }) => (
    <Menu onMouseDown={e => e.preventDefault()} onClick={({ domEvent, key }) => {
        domEvent.preventDefault();
        Transforms.insertText(props.editor, key as string);
    }}>
        <Menu.Item key="█">█</Menu.Item>
    </Menu >
)

export default MyEditor;