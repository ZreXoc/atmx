import React from "react";
import { Layout } from "antd";

import Editor from "./editor";

import "./App.less"

const App: React.FC = props => {
    return (
        <Layout>
            <Editor />
        </Layout>
    );
}

export default App;