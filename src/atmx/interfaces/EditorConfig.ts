import { Editor, Element } from "slate";
import { RenderElementProps } from "slate-react";
import { CustomLeaf, Serializer } from "..";

export interface EditorConfig {
    nodeMap: INodeMap;
    serializeRules: ISerializeRule[];
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
    achieve?: (editor: Editor) => any;
    render: (customLeaf: CustomLeaf) => CustomLeaf;
}

export interface BlockNode {
    key: string;
    title?: string;
    //description?:string;
    hotkey?: string;
    achieve?: (editor: Editor) => any;
    render: (props: RenderElementProps, element?: Element) => JSX.Element;
    isVoid?: boolean;
}

export interface AchievedNode {
    achieve: (editor: Editor) => any;
}


export type ISerializeRule = (serializer: Serializer) => any;