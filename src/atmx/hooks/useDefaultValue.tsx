import { Descendant } from "slate";

const DefaultValue: Descendant[] = [{ "type": "paragraph", "children": [{ "text": "请输入文本" }] }]

export const useDefaultValue = (): Descendant[] => DefaultValue;