import { PureComponent as Component, createElement as create } from 'react';
import { render } from "react-dom";

export interface IndexStates {
}

export interface IndexProps {
}

export class IndexComponent extends Component<IndexProps, IndexStates> {
}

export class Toolbar extends Component<{}, {}> {
    render() {
        return <span className="toolbar">{this.props.children}</span>;
    }
}

