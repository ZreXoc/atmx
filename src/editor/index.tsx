import React, {useMemo, useState, useCallback} from "react";
import {Slate, Editable, withReact, ReactEditor,RenderLeafProps,RenderElementProps} from "slate-react";
import {createEditor} from "slate";

import {ToolBar} from "./components";
import './index.less';

import style from "./style";

const MainEditor:React.FC = props => {
    const editor = useMemo(() => withReact(createEditor() as ReactEditor),[]);
    const [value, setValue] = useState(
        JSON.parse(localStorage.getItem('/*content*/') as string) //TODO
        || [{"type":"header-one","children":[{"text":"你好！"}]},{"type":"","children":[{"text":"欢迎测试的发送发达撒分"}]},{"type":"paragraph","children":[{"text":"不要清空后输入中文","italic":true}]},{"type":"paragraph","children":[{"text":"不要使用手机输入法","italic":true,"underline":true}]},{"type":"paragraph","children":[{"text":"左上可导出（链接暂不可）","italic":true,"underline":true}]},{"type":"paragraph","children":[{"text":"右键打开链接","italic":true,"underline":true}]},{"type":"paragraph","children":[{"text":""},{"type":"link","url":"http://smlt.wikidot.com/zeexoc:wdot","children":[{"text":"link","italic":true,"underline":true}]},{"text":""}]}]
    )
    //MarkHotkey(editor);

    const renderElement = useCallback(props => {
        let element;
        Object.values(style.block).some(block => {
            if (props.element.type === block.key){
                   element = block.renderer(props);
                   return true
            }
        })
        return element||<DefaultElement {...props}/>
    }, [])

    // 通过 `useCallback` 定义一个可以记忆的渲染叶子节点的函数。
    const renderLeaf = useCallback(props => {
        return <Leaf {...props} />
    }, [])

    return (
        <div id={'editor-container'}>
            <Slate editor={editor} value={value}
                   onChange={value => {
                       setValue(value);
                       // 在 Local Storage 里保存值
                       const content = JSON.stringify(value)
                       localStorage.setItem('content', content)
                   }}>
                <ToolBar editor={editor}/>
                <Editable
                    className={'edit-area'}
                    renderElement={renderElement}
                    renderLeaf={renderLeaf}
                />
            </Slate>
        </div>
    )
}

const Leaf: React.FC<RenderLeafProps> = props => {
    let className:Array<string> = [];
    Object.values(style.inline).forEach(inlineStyle=>{
        if (props.leaf.hasOwnProperty(inlineStyle.key)){
            className.push(inlineStyle.key);
        }
    })
    return (
        <span
            {...props.attributes}
            className={className[0]?className.join(' '):'none'}
        >
      {props.children}
    </span>
    )
}

const DefaultElement:React.FC<RenderElementProps> = props => {
    return <p {...props.attributes}>{props.children}</p>
}

export default MainEditor