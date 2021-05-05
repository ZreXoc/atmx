import React from "react";
import {useState} from "react";
import {Layout, Menu} from "antd";
import {UserOutlined} from "@ant-design/icons";

import {MainEditor} from "./atmx";

import "./App.less"
const {Content, Sider, Footer} = Layout;

const App: React.FC = props => {
    const [collapsed, setCollapse] = useState(true);
    const [contentMarginLeft, setContentMarginLeft] = useState(80);
    const onCollapse = (isCollapsed:boolean):void=>{
        setCollapse(isCollapsed);
        setContentMarginLeft(isCollapsed?80:200);
    };
    return (
        <Layout>
            <Sider
                collapsible collapsed={collapsed} onCollapse={onCollapse}
                style={{
                    overflow: 'auto',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                }}
            >
                <div className="logo"/>
                <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
                    <Menu.Item key="1" icon={<UserOutlined/>}>
                        nav 1
                    </Menu.Item>

                </Menu>
            </Sider>
            <Layout className="site-layout" style={{marginLeft: contentMarginLeft}}>
                <Content style={{margin: '24px 16px 0', overflow: 'initial'}}>
                    <div className="site-layout-background" style={{padding: 24, minHeight: '30em'}}>
                        <MainEditor/>
                    </div>
                </Content>
                <Footer style={{textAlign: 'center'}}>WeTry Created by ZeeXoc</Footer>
            </Layout>
        </Layout>
    );
}

export default App;