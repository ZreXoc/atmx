import { Descendant } from "slate";

const DefaultValue: Descendant[] = [
    {
        "type": "header-one",
        "children": [
            {
                "type": "paragraph",
                "children": [
                    { "text": "aa" },
                    { "text": "a", "bold": true },
                    { "text": "a", "bold": true, "italic": true },
                    { "text": "a", "italic": true }
                ]
            }
        ]
    }
];

export const useDefaultValue = (value: Descendant[] = DefaultValue, useCookie: boolean = true): Descendant[] =>
    value ? value : useCookie ? JSON.parse(localStorage.getItem('content') as string) : DefaultValue