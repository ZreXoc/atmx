import React from "react";
import { Layout } from "antd";

import MyEditor from "./editor";

import "./App.less"

const App: React.FC = props => {
    return (
        <Layout>
            <MyEditor />
        </Layout>
    );
}

export default App;