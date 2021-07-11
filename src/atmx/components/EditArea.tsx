import { Layout } from "antd";
import { Editable, RenderLeafProps, RenderElementProps, DefaultElement } from "slate-react";
import { NodeEntry, Range } from 'slate';
import { CustomLeaf, style } from "..";


type EditableProps = {
    decorate?: (entry: NodeEntry) => Range[];
    onDOMBeforeInput?: (event: InputEvent) => void;
    placeholder?: string;
    readOnly?: boolean;
    role?: string;
    style?: React.CSSProperties;
    renderElement?: (props: RenderElementProps) => JSX.Element;
    renderLeaf?: (props: RenderLeafProps) => JSX.Element;
    as?: React.ElementType;
} & React.TextareaHTMLAttributes<HTMLDivElement>;

export const renderLeaf = (props: RenderLeafProps) => {
    let leaf = new CustomLeaf(props);

    Object.values(style.inline).forEach(inlineStyle => {

        if (props.leaf.hasOwnProperty(inlineStyle.key)) {
            inlineStyle.render(leaf);
        }
    })

    if (props.leaf.color) leaf.appendStyle({ color: props.leaf.color })
    return leaf.render();
}

export const renderElement = (props: RenderElementProps) => {
    let element;
    Object.values(style.block).some(block => {
        if (props.element.type === block.key) {
            element = block.render(props);
            return true
        }
    })

    return element || <DefaultElement {...props} />
}

const EditArea: React.FC<EditableProps> = props => (
    <Editable
        className={'edit-area'}
        {...{ renderLeaf, renderElement }}
        spellCheck
        autoFocus
        {...props}
    />
)

export { EditArea };



