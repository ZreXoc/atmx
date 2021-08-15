import { Editor, Descendant } from "slate";
import { RenderLeafProps, RenderElementProps } from "slate-react";
import { INodeMap, Serializer } from "..";

export type EditorInfo = () => {
    editor: Editor;
    originValue: Descendant[]

    renderLeaf: (props: RenderLeafProps) => JSX.Element;

    renderElement: (props: RenderElementProps) => JSX.Element;

    nodeMap: INodeMap;

    serialize: () => Serializer;
}