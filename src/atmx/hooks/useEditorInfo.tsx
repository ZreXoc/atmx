import { EditorInfo, Serialize } from "..";

let config: EditorInfo<any>;

export const useEditorInfo = <T extends Serialize.Context>(editorInfo?: EditorInfo<T>) => {
    if (editorInfo) (config as EditorInfo<T>) = editorInfo;
    return config();
}