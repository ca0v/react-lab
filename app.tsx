import * as React from 'react';
import * as reactDom from 'react-dom';
import { Component as MyFoo } from './components/myfoo';
import { dump, input } from './common/common';
import { OpenLayers } from './components/openlayers';

export interface AppProps {
    title?: string;
    value?: number;
}

export interface AppState {
    value: number;
    title: string;
    showComponents: boolean;
}

export class App extends React.PureComponent<AppProps, AppState> {

    constructor(props: AppProps) {
        super(props);
        this.state = {
            value: props.value || 0,
            title: props.title || "untitled",
            showComponents: false,
        };
    }

    get title() {
        return this.state.title || this.props.title;
    }

    input() {
        let result: JSX.Element = input(this);
        return result;
    }

    render() {
        return <div className="application">
            <h3>{this.title}</h3>
            <label>app props: <ol>{dump(this.props)}</ol></label>
            <label>app state: <ol>{dump(this.state)}</ol></label>
            <div>{this.input()}</div>
            {(this.state.showComponents) && <div>
                <div className='panel'>
                    <OpenLayers osm={true} center={[-121.4944, 38.5816]} zoom={10} orientation='portrait' />
                    <OpenLayers bing={true} center={[-73.994792, 40.7408906]} zoom={18} />
                    <OpenLayers osm={true} center={[-82.3940, 34.8526]} zoom={10} />
                </div>
                <MyFoo title={`Component of ${this.title}`} value={2 * this.state.value} />
            </div>}
            <div className='toolbar'>
                <button onClick={() => this.increment()}>Increment</button>
                <button onClick={() => this.destroy()}>Destroy</button>
            </div>
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
