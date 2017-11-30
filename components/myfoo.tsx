import * as React from 'react';

export interface ComponentState {
    tickHandler: number;
    ticks: number;
}

export interface ComponentProps {
    title?: string;
    value?: number;
}


function dump(o: any) {
    let keys = Object.keys(o);
    return keys.map(k => <li key={k}>{k}: {o[k]}</li>);
}

export class Component extends React.Component<ComponentProps, ComponentState> {

    constructor(props: ComponentProps) {
        super(props);
    }
    
    render() {
        return <div className={(this.props.value || 0) % 2 === 0 ? "even" : "odd"}>
            <h4>{this.props.title}</h4>
            <ol>{dump(this.props)}</ol>
            <ol>{dump(this.state)}</ol>
        </div>;
    }

    private tick() {
        this.setState(prev => ({ ticks: (prev.ticks || 0) + 1 }));
    }

    componentWillMount() {
        console.log("componentWillMount", this);
        this.setState({ tickHandler: window.setInterval(() => this.tick(), 1000) });
    }

    componentWillUnmount() {
        console.log("componentWillUnmount", this);
        clearInterval(this.state.tickHandler);
    }


}