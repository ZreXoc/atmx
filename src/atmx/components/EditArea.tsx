import { Editable } from "slate-react"
import { useEditorConfig } from ".."

export const EditArea: React.FC = () => {
    const { renderLeaf, renderElement } = useEditorConfig()
 
    return <Editable
        className={'edit-area'}
        renderLeaf={renderLeaf}
        renderElement={renderElement}
        spellCheck
        autoFocus
    />
}