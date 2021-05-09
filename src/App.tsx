import React from "react";
import { useState } from "react";
import { Layout, Menu } from "antd";
import { UserOutlined } from "@ant-design/icons";

import { MainEditor, ToolBar } from "./atmx";

import "./App.less"
const { Header, Content, Sider, Footer } = Layout;

const App: React.FC = props => {
    return (
        <Layout>
            <MainEditor />
        </Layout>
    );
}

export default App;