import { RenderLeafProps } from "slate-react";

export class LeafRender {
    private props: RenderLeafProps;

    readonly className: Array<string> = []
    readonly style: Object = {}
    readonly attr = []

    getLeaf = () => this.props.leaf;
    getChildren = () => this.props.children;
    setChildren = (newChildren: any) => this.props.children = newChildren;

    appendClass(className: string) {
        this.className.push(className);
        return this;
    }

    appendStyle(style: React.CSSProperties) {
        Object.assign(this.style, style);
        return this;
    }

    appendAttr(key: string, value: any) {
        this[key] = value;
        return this;
    }

    constructor(props: RenderLeafProps) {
        this.props = props
    }

    render() {
        return (
            <span
                {...this.props.attributes}
                {...this.attr}
                className={this.className.join(' ')}
                style={this.style}
            >
                {this.props.children}
            </span>
        )
    }
}