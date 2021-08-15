import { EditorInfo } from "..";

let config: EditorInfo;

export const useEditorInfo = (editorInfo?: EditorInfo) => {
    if (editorInfo) config = editorInfo;
    return config();
}