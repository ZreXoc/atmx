import { EditorConfig } from "..";

let config: EditorConfig;

export const useEditorConfig = (editorConfig?: EditorConfig) => {
    if (editorConfig) config = editorConfig;
    return config();
}