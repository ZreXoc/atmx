import { Editor, Element } from "slate";
import { RenderElementProps } from "slate-react";
import { LeafRender, Serialize, Serializer } from "..";

export interface EditorConfig<T extends Serialize.Context> {
    nodeMap: INodeMap;
    serialize: Serialize.Config<T>
}

export interface INodeMap {
    inline: {
        [name: string]: InlineNode
    }
    block: {
        [name: string]: BlockNode
    };
}

export interface InlineNode {
    key: string;
    title?: string;
    //description?:string;
    hotkey?: string;
    isActive?: (editor: Editor, attr: any) => boolean,
    achieve?: (editor: Editor, attr: any) => any;
    render: (leafRender: LeafRender) => any;
}

export interface BlockNode {
    key: string;
    title?: string;
    //description?:string;
    hotkey?: string;
    isActive?: (editor: Editor, attr: object) => boolean,
    achieve?: (editor: Editor, attr: object) => any;
    render: (props: RenderElementProps, element: Element) => JSX.Element;
    isVoid?: boolean;
}

export interface AchievedNode {
    achieve: (editor: Editor, attr: object) => any;
}