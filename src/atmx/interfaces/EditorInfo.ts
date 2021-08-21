import { Editor, Descendant, Ancestor } from "slate";
import { RenderLeafProps, RenderElementProps } from "slate-react";
import { INodeMap, Serialize } from "..";

export type EditorInfo<T extends Serialize.Context = Serialize.Context> = () => {
    editor: Editor;

    originValue: Descendant[];

    initialValue: Descendant[];

    renderLeaf: (props: RenderLeafProps) => JSX.Element;

    renderElement: (props: RenderElementProps) => JSX.Element;

    nodeMap: INodeMap;

    serialize: (node:Ancestor) => Serialize.Serializer<T>;
}