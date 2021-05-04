import {Button as AntdButton, Dropdown, Divider, Space, Menu, Modal, Input} from "antd";
import * as Icon from "@ant-design/icons"
import {CustomCommand} from "../actions";
import style from "../style";
import {Editor, Element as SlateElement} from "slate";
import serialize from "../../wikidot/serialize";

const {inline, block} = style;

const ToolBar = props => {
    const {editor} = props;


    return (
        <>
            <Space split={<Divider type="vertical"/>}>
                <div className='header'>
                     <Dropdown.Button title={block.headerOne.title} size='small' type="text" trigger="hover"
                                     onSelect={() => CustomCommand.toggleMark(editor, block.headerOne.key)}
                                     overlay={
                                         <Menu onClick={
                                             ev=>{
                                                 switch (ev.key){
                                                     case 'export':
                                                        Modal.confirm({
                                                            title: '导出为wikidot',
                                                            content:<div dangerouslySetInnerHTML={{__html: serialize(editor)}} />,
                                                        });
                                                 }
                                             }
                                         }>
                                             <Menu.Item
                                                 key='export'
                                                 >导出
                                             </Menu.Item>
                                         </Menu>
                                     }>开始</Dropdown.Button>
                                     {/* <Dropdown.Button title={block.headerOne.title} size='small' type="text" trigger="hover"
                                     onSelect={() => CustomCommand.toggleBlock(editor, block.headerOne.key)}
                                     overlay={
                                         <Menu onClick={
                                             ev=>CustomCommand.toggleInlineMark(editor,'bold')
                                         }>
                                             <Menu.Item
                                                 key={ block.headerTwo.key}
                                                 >H2</Menu.Item>
                                             <Menu.Item
                                                 onClick={() => CustomCommand.toggleBlock(editor, block.headerThree.key)}>H3</Menu.Item>
                                             <Menu.Item
                                                 onClick={() => CustomCommand.toggleBlock(editor, block.headerFour.key)}>H4</Menu.Item>
                                         </Menu>
                                     }>H1</Dropdown.Button>*/}
                    <Button title={block.headerOne.title}
                            active={CustomCommand.isMarkActive(editor, block.headerOne.key)}
                            onClick={() => CustomCommand.toggleBlock(editor, block.headerOne.key)}
                    >H1</Button>
                    <Button title={block.headerTwo.title}
                            active={CustomCommand.isMarkActive(editor, block.headerTwo.key)}
                            onClick={() => CustomCommand.toggleBlock(editor, block.headerTwo.key)}
                    >H2</Button>
                    <Button title={block.headerThree.title}
                            active={CustomCommand.isMarkActive(editor, block.headerThree.key)}
                            onClick={() => CustomCommand.toggleBlock(editor, block.headerThree.key)}
                    >H3</Button>
                </div>
                <div className='inline'>
                    <Button title={inline.bold.title}
                            active={CustomCommand.isMarkActive(editor, inline.bold.key)}
                            onClick={() => CustomCommand.toggleMark(editor, inline.bold.key)}
                            icon={<Icon.BoldOutlined/>}
                    />
                    <Button
                        title={inline.italic.title}
                        active={CustomCommand.isMarkActive(editor, inline.italic.key)}
                        onClick={() => CustomCommand.toggleMark(editor, inline.italic.key)}
                        icon={<Icon.ItalicOutlined/>}
                    />
                    <Button title={inline.underline.title}
                            active={CustomCommand.isMarkActive(editor, inline.underline.key)}
                            onClick={() => CustomCommand.toggleMark(editor, inline.underline.key)}
                            icon={<Icon.UnderlineOutlined/>}
                    />
                    <Button title={inline.deleted.title}
                            active={CustomCommand.isMarkActive(editor, inline.deleted.key)}
                            onClick={() => CustomCommand.toggleMark(editor, inline.deleted.key)}
                            icon={<Icon.DeleteOutlined/>}
                    />
                </div>
                <div>
                    {/*<InsertLink editor={editor}/>*/}
                </div>
            </Space>
        </>
    );
}

const Button = props => {
    const {active} = props;
    return (
        <AntdButton size='small' type="text"
                    style={{
                        color: active ? "#1890ff" : undefined
                    }}
                    {...props}>
            {props.children}
        </AntdButton>
    )
}

const InsertLink = props => {
    const {editor} = props;
    const getUrl = () => {
        let [link] = Editor.nodes(editor, {
            match: n =>
                !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'link',
        })
        return link?link[0].url:''
    }
    return (
        <>
            <Button title={'导出暂不可用'}
                    active={CustomCommand.isBlockActive(editor, block.link.key)}
                    onClick={event => {
                        event.preventDefault()
                        //setIsModalVisible(true)
                        const url = window.prompt('Enter the URL of the link:',getUrl())
                        if (!url) return
                        CustomCommand.insertLink(editor, url)
                    }}
            >L</Button>
           {/* <Modal visible={isModalVisible}
                   destroyOnClose={true}
                   onOk={
                       event => {
                           event.preventDefault()
                           setIsModalVisible(false);
                           if (!url) return
                           CustomCommand.insertLink(editor, url)
                       }
                   }
                   onCancel={() => setIsModalVisible(false)}
            >
                <Input addonBefore="http://" defaultValue={getUrl()}
                       onChange={event => {
                           event.preventDefault()
                           setUrl(event.target.value)
                       }}/>
            </Modal>*/}
        </>
    )
}

/*const InsertImage = props => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [src, setSrc] = useState(null)

    return (
        <>
            <Button title={block.image.title} size='small' type="text"
                    icon={<Icon.PictureOutlined/>}
                    onClick={() => {
                        setIsModalVisible(true);
                    }}
            />
            <Modal visible={isModalVisible}
                   onOk={
                       () => {
                           CustomCommand.insertBlock(props.editor, 'image', {src})
                           setIsModalVisible(false);
                       }
                   }
                   onCancel={() => setIsModalVisible(false)}
            >
                <Input addonBefore="http://" defaultValue="scp-cn-wiki.wikidot.com/"
                       onChange={e => setSrc(e.target.value)}/>
            </Modal>
        </>
    )
}*/


export default ToolBar;