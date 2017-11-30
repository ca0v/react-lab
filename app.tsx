import * as React from 'react';
import * as reactDom from 'react-dom';
import { Component as MyFoo } from './components/myfoo';

let dump = (o: any) => Object.keys(o).map(k => <li key={k} title={k}>{k}: {o[k]}</li>);

export interface AppProps {
    title?: string;
    value?: number;
}

export interface AppState {
    value: number;
    title: string;
}

export class App extends React.Component<AppProps, AppState> {

    constructor(props: AppProps) {
        super(props);
        this.state = {
            value: props.value || Math.ceil(Math.random() * 100),
            title: props.title || "untitled"
        };
    }

    render() {
        return <div className="application">
            <h3>{this.state.title}</h3>
            <label><MyFoo title={this.state.title || this.props.title} value={this.state.value} /></label>
            <ol>{dump(this.props)}</ol>
            <ol>{dump(this.state)}</ol>
            <div>Change Title: <input type="text" value={this.state.title} onChange={event => { this.setState({ title: event.target.value }) }} /></div>
            <button onClick={() => this.increment()}>Increment</button>
            <button onClick={() => this.destroy()}>Destroy</button>
        </div>
    }

    destroy() {
        let node = reactDom.findDOMNode(this).parentElement;
        node && reactDom.unmountComponentAtNode(node);
    }

    increment() {
        this.setState((prev: { value: number }, props) => ({
            value: prev.value + 1
        }));
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
