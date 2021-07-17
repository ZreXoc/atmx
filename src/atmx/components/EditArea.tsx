import { Editable, RenderLeafProps, RenderElementProps } from "slate-react";
import { NodeEntry, Range } from 'slate';
import { IRenderMap, useRender } from "..";


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

const EditArea: React.FC<EditableProps & {renderMap: IRenderMap }> = props => (
    <Editable
        className={'edit-area'}
        {...useRender(props.renderMap)}
        spellCheck
        autoFocus
        {...props}
    />
)

export { EditArea };