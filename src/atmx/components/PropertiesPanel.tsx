import { useCallback, useState } from "react";
import { Node, Range,Element, Path, BaseRange } from "slate"
import { useSlate } from "slate-react"

import { Layout, Menu } from "antd";
import { Text } from "slate";

const { SubMenu } = Menu;
const { Header, Content, Footer, Sider } = Layout;

export const PropertiesPanel = () => {
    const editor = useSlate();
    const [page, setPage] = useState('1')
    const [...nodes] = useCallback(
        () => editor.selection ? Node.fragment(editor, editor.selection) : [],
        [editor.selection],
    )()
        console.log(nodes);
        
    const [...texts] = useCallback(
        () => {
            if(!editor.selection) return[]
            
            const range = Range.isForward(editor.selection as BaseRange)
            ?[editor.selection?.anchor,editor.selection?.focus]
            :[editor.selection?.focus,editor.selection?.anchor]
            return Node.texts(editor,{
            from:range[0]?.path,
            to:range[1]?.path,
        }
        )},
        [editor.selection],
    )()
    
    return (
        <Layout className='propertie-panel'>
            <Header className='site-layout-background'>
                <Menu mode="horizontal" onSelect={(info) => setPage(info.key.toString())} defaultSelectedKeys={['1']}>
                    <Menu.Item key="1">基本</Menu.Item>
                    <Menu.Item key="2">nav 2</Menu.Item>
                </Menu>
            </Header>
            <Content className='site-layout-background'>
                {page == '1' ?
                    <div>
                        <span>text:{texts?.map(n=>n[0].text).join('\n')}</span>

                    </div> : null}
            </Content>
        </Layout>
    )
}