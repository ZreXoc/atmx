import { Slate, ReactEditor } from "slate-react";
import { useEditorInfo, BlockNode, InlineNode } from "..";
import { Layout } from "antd";
import '../../index.less';
import { useState } from "react";
import React from "react";
import hotkeys from "hotkeys-js";

const MainEditor: React.FC = props => {
    const { editor, nodeMap, originValue } = useEditorInfo();
    const [value, setValue] = useState(originValue);

    //hotkey
    Object.values(nodeMap).forEach(t => Object.values(t).forEach(n => {
        const node = n as InlineNode | BlockNode;
        if (node.hotkey && node.achieve)
            hotkeys(node.hotkey, e => {
                e.preventDefault();
                if (node.achieve) node.achieve(editor);
            })
    }));

    return (
        <Layout id={'editor-container'} className="site-layout">
            <Slate
                editor={editor as ReactEditor}
                value={value}
                onChange={value => {
                    setValue(value);
                    const content = JSON.stringify(value)
                    localStorage.setItem('content', content)
                }}
            >
                {props.children}
            </Slate>
        </Layout>
    )
}

export { MainEditor }