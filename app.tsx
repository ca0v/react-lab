import * as React from 'react';
import * as reactDom from 'react-dom';
import { Component as MyFoo } from './components/myfoo';

function dump(o: any) {
    let keys = Object.keys(o);
    return keys.map(k => <li key={k}>{k}: {o[k]}</li>);
}

class Templates {

    private _value: string;
    public get value(): string {
        return this._value;
    }
    public set value(v: string) {
        this._value = v;
    }

    t1(title: string) {
        return <h1>{title}</h1>;
    }

    t2(list: string[]) {
        return <ul>{list.map(v => <li title={v} key={v}>{v}</li>)}</ul>;
    }

    t3(title: string, value: number) {
        return <div className="container"><MyFoo title={title} value={value}/></div>;
    }
}

let T = new Templates();

export class App extends React.Component<{ title: string }, { value: number, subtitle?: string }> {

    constructor(props: { title: string }) {
        super(props);
        this.state = { value: 123 };
    }

    render() {
        return <div className="application">
            {T.t1(this.props.title)}
            <label><MyFoo title={this.props.title} value={this.state.value}/></label>
            {T.t2("My List Of Items".split(" "))}
            {T.t3(this.state.subtitle || this.props.title, this.state.value)}
            <ul>
                {dump(this.props)}
                {dump(this.state)}
            </ul>
            <input type="text" value={this.state.subtitle || this.props.title} onChange={event => {this.setState({subtitle: event.target.value})}}/>
            <button onClick={() => this.increment()}>Increment</button>
            <button onClick={() => this.destroy()}>Destroy</button>
        </div>
    }

    destroy() {
        let node = reactDom.findDOMNode(this).parentElement;
        node && reactDom.unmountComponentAtNode(node);
    }

    increment() {
        this.setState((prev: {value: number}, props) => ({
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
