import { MainEditor, EditArea, ToolBar, PropertiesPanel, withDefault, CustomEditor } from '../atmx'
import { Layout } from "antd";
import { useMemo, useState } from 'react';
import { ReactEditor, withReact } from 'slate-react';
import { createEditor } from 'slate';
import { serializeMap } from "./serialize";

const { Header, Content, Sider, Footer } = Layout;

const Editor: React.FC = props => {
    const editor = useMemo(() => withDefault(withReact(createEditor() as ReactEditor)), []) as CustomEditor;
    const [value, setValue] = useState(
        JSON.parse(localStorage.getItem('content') as string) //TODO
        || [{ "type": "paragraph", "children": [{ "text": "aa" }, { "text": "aa", "bold": true }, { "text": "a" }] }]
        //|| [{ "type": "header-three", "children": [{ "text": "你" }, { "text": "好！", "italic": true }] }, { "type": "paragraph", "children": [{ "text": "欢迎测试的发送发达撒分" }] }, { "type": "paragraph", "children": [{ "text": "不要清空后输入中文", "italic": true }] }, { "type": "paragraph", "children": [{ "text": "不要使用手机输入法", "italic": true, "underline": true, "bold": true }] }, { "type": "paragraph", "children": [{ "text": "左上可导出（链接暂不可）", "italic": true, "underline": true }] }, { "type": "paragraph", "children": [{ "text": "右键打开链接", "deleted": true }, { "text": " 暂不可用" }] }, { "type": "paragraph", "children": [{ "text": "" }, { "type": "link", "url": "http://smlt.wikidot.com/zeexoc:wdot", "children": [{ "text": "link", "italic": true, "underline": true }] }, { "text": "" }] }]
    )

    return (
        <MainEditor
            {...{ editor, value, setValue }}
        >
            <div className='editor-header'>
                <Header className="site-layout-background editor-headbar">
                    <ToolBar
                        serializeMap={serializeMap}
                    />
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
        </MainEditor>
    )
}

export default Editor;