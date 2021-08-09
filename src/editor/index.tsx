import { MainEditor, ToolBar, PropertiesPanel, useEditorConfig, EditorInitializer, useDefaultValue, EditArea } from '../atmx'
import { Layout } from "antd";
import { serializeMap } from "./serialize";
import { renderMap } from './render';

const { Header, Content, Sider } = Layout;

const Editor: React.FC = props => {
    const editorConfig = (new EditorInitializer())
        .withHistory()
        .withAtmx()
        .setConfig({ renderMap, serializeMap })
        .setValue(useDefaultValue())
        .build();
    useEditorConfig(editorConfig);

    return (
        <MainEditor editorConfig={editorConfig} >
            <div className='editor-header'>
                <Header className="site-layout-background editor-header">
                    <ToolBar />
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
    )
}

export default Editor;