import {Typography} from "antd";
import {RenderElementProps} from "slate-react";

const style = {
    inline: {
        bold: {
            key: 'bold',
            title: '粗体(B)',
            hotkey: 'ctrl+b',
        },

        italic: {
            key: 'italic',
            title: '斜体(I)',
            hotkey: 'ctrl+i',
        },

        underline: {
            key: 'underline',
            title: '下划线(I)',
            hotkey: 'ctrl+u',
        },

        deleted: {
            key: 'deleted',
            title: '删除线(D)',
            hotkey: 'ctrl+d',
        }
    },
    block: {
        //header
        headerOne: {
            key: 'header-one',
            title: '一级标题(H)',
            renderer(props:RenderElementProps) {
                return (<h1 {...props.attributes}>{props.children}</h1>)
            }
        }, headerTwo: {
            key: 'header-two',
            title: '二级标题',
            renderer(props:RenderElementProps) {
                return (<h2 {...props.attributes}>{props.children}</h2>)
            }
        }, headerThree: {
            key: 'header-three',
            title: '三级标题',
            renderer(props:RenderElementProps) {
                return (<h3 {...props.attributes}>{props.children}</h3>)
            }
        }
    }

}

export default style;