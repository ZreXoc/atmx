import { Slate, ReactEditor } from "slate-react";
import { useDefaultValue, TextCommand, EditorConfig } from "..";
import { Layout } from "antd";
import '../../index.less';
import { useState } from "react";

const MainEditor: React.FC<{ editorConfig: EditorConfig }> = props => {
    const { editor, initialValue } = props.editorConfig();
    const [value, setValue] = useState(useDefaultValue(initialValue, false));
    TextCommand.setEditor(editor);

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