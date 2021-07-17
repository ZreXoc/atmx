import { useCallback, useEffect } from "react";
import { DefaultElement, RenderElementProps, RenderLeafProps } from "slate-react";
import { CustomLeaf, IRenderMap } from "..";

export const useRender = (renderMap: IRenderMap) => {
    const renderLeaf = useCallback((props: RenderLeafProps) => {
        let leaf = new CustomLeaf(props);

        Object.values(renderMap.inline).forEach(inlineStyle => {
            if (props.leaf.hasOwnProperty(inlineStyle.key)) {
                inlineStyle.render(leaf);
            }
        })

        if (props.leaf.color) leaf.appendStyle({ color: props.leaf.color })
        return leaf.render();
    }, [])

    const renderElement = useCallback((props: RenderElementProps) => {
        let element;

        Object.values(renderMap.block).some(ele => {
            if (props.element.type === ele.key) {
                element = ele.render(props);
                return true
            }
        })
        Object.values(renderMap.void).some(ele => {
            if (props.element.type === ele.key) {
                element = ele.render(props);
                return true
            }
        })

        return element || <DefaultElement {...props} />
    }, [])

    return { renderLeaf, renderElement }
}