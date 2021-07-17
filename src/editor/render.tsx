import { RenderElementProps } from "slate-react";
import { LinkElement, IRenderMap } from "src/atmx";

export const renderMap: IRenderMap = {
    inline: {
        bold: {
            key: 'bold',
            title: '粗体(B)',
            hotkey: 'ctrl+b',
            render: (leaf) => leaf.appendClass('bold')
        },

        italic: {
            key: 'italic',
            title: '斜体(I)',
            hotkey: 'ctrl+i',
            render: (leaf) => leaf.appendClass('italic')
        },

        underline: {
            key: 'underline',
            title: '下划线(I)',
            hotkey: 'ctrl+u',
            render: (leaf) => leaf.appendClass('underline')
        },

        deleted: {
            key: 'deleted',
            title: '删除线(D)',
            hotkey: 'ctrl+d',
            render: (leaf) => leaf.appendClass('deleted')
        }
    },
    block: {
        //header
        headerOne:
        {
            key: 'header-one',
            title: '一级标题(H)',
            render: (props: RenderElementProps) => <h1 {...props.attributes}>{props.children}</h1>

        },
        headerTwo: {
            key: 'header-two',
            title: '二级标题',
            render: (props: RenderElementProps) => <h2 {...props.attributes}>{props.children}</h2>

        },
        headerThree: {
            key: 'header-three',
            title: '三级标题',
            render: (props: RenderElementProps) => <h3 {...props.attributes}>{props.children}</h3>
        },
        link: {
            key: 'link',
            title: '链接',
            render(props: RenderElementProps) {
                const element = props.element as LinkElement;
                return (<a href={element.url} {...props.attributes}>{props.children}</a>)
            }
        },
        blockquote: {
            key: 'block-quote',
            title: '引用',
            render: (props: RenderElementProps) => <blockquote {...props.attributes}>{props.children}</blockquote>
        },
        numberedList: {
            key: 'numbered-list',
            title: '有序列表',
            render: (props: RenderElementProps) => <ol {...props.attributes}>{props.children}</ol>
        },
        bulletedList: {
            key: 'bulleted-list',
            title: '无序列表',
            render: (props: RenderElementProps) => <ul {...props.attributes}>{props.children}</ul>
        },
        listItem: {
            key: 'list-item',
            render: (props: RenderElementProps) => <li {...props.attributes}>{props.children}</li>
        },
    },
    void: {
        horizontalLine: {
            key: 'horizontal-line',
            title: '分割线',
            render: (props: RenderElementProps) => <span className='void' {...props.attributes}><hr />{props.children}</span>
        }
    }
}