import * as React from 'react';

export interface ComponentState {
}

export interface ComponentProps {
    title?: string;
    value?: number;
}

export class Component extends React.Component<ComponentProps, ComponentState> {
    
    render() {
        return <div>
            <label>{this.props.title}<input value={this.props.value}/></label>
        </div>;
    }

    componentWillMount() {
        console.log("componentWillMount", this);
    }

    componentWillUnMount() {
        console.log("componentWillUnMount", this);
    }

    componentDidMount() {
        console.log("componentDidMount", this);
    }

    componentWillReceiveProps() {
        console.log("componentWillReceiveProps", this);
    }

    componentDidUpdate() {
        console.log("componentDidUpdate", this);
    }

    componentWillUnmount() {
        console.log("componentWillUnmount", this);
    }

    componentWillUpdate() {
        console.log("componentWillUpdate", this);
    }

}