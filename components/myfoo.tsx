import * as React from 'react';
import { dump, input } from '../common/common';

export interface ComponentState {
    tickHandler: number;
    ticks: number;
    about: string;
}

export interface ComponentProps {
    title?: string;
    value?: number;
}



export class Component extends React.PureComponent<ComponentProps, ComponentState> {

    constructor(props: ComponentProps) {
        super(props);
    }

    input() {
        let result: JSX.Element = input(this);
        return result;
    }

    render() {
        return <div className='component'>
            <h5>{this.props.title}</h5>
            <label>props: <ol>{dump(this.props)}</ol></label>
            <label>state: <ol>{dump(this.state)}</ol></label>
            <div>{this.input()}</div>
        </div>;
    }

    private tick() {
        this.setState(prev => ({ ticks: (prev.ticks || 0) + 1 }));
    }

    componentWillMount() {
        this.setState((prev, props) => ({
            tickHandler: window.setInterval(() => this.tick(), 1000),
            about: (prev && prev.about) || 'About'
        }));
    }

    componentWillUnmount() {
        clearInterval(this.state.tickHandler);
    }


}