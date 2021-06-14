import React, { useCallback, useState } from "react";
import { Node } from "slate"
import { useSlate } from "slate-react"

import { CirclePicker, ColorResult } from 'react-color'
import { Layout, Menu } from "antd";
import { CustomCommand } from "../command";

const { SubMenu } = Menu;
const { Header, Content, Footer, Sider } = Layout;

export const PropertiesPanel = () => {
    const editor = useSlate();
    const [page, setPage] = useState('1')
    const [...fragment] = useCallback(
        () => editor.selection ? Node.fragment(editor, editor.selection) : [],
        [editor.selection],
    )()

    const [...pureText] = useCallback(
        () => {
            return fragment.map(f => [...Node.string(f)]);
        },
        [fragment],
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
                        <span>text:{pureText?.map(n => n.join('')).join(' ')}</span>
                        <ColorPicker onChange={(color) =>  CustomCommand.addMark(editor, 'color', color.hex)} />
                    </div> : null}
            </Content>
        </Layout>
    )
}

const ColorPicker: React.FC<{ onChange: (color: ColorResult | any) => any }> = (props) => {
    const { onChange } = props;
    return (
        <div onMouseDown={e => e.preventDefault()}>
            <CirclePicker
                onChange={onChange}
            />
        </div>
    )
}