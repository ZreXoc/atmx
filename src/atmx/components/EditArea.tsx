import { Editable } from "slate-react"
import { useEditorInfo } from ".."

export const EditArea: React.FC = () => {
    const { renderLeaf, renderElement } = useEditorInfo()
 
    return <Editable
        className={'edit-area'}
        renderLeaf={renderLeaf}
        renderElement={renderElement}
        spellCheck
        autoFocus
    />
}