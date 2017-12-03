import * as React from 'react';
import { PureComponent as Component, createElement as create } from 'react';
import { ToggleMap } from './components/index';
import { OpenLayers } from './components/openlayers';
import { input } from "./common/common";

export interface AppState {
    portrait: boolean;
}

export interface AppProps {
    showmap: boolean;
    bing?: boolean;
    center: [number, number];
    zoom: number;
}

export class App extends Component<AppProps, AppState> {

    constructor(props: AppProps) {
        super(props);
        this.state = { portrait: true }
    }

    render(): any {
        return <div className="app">
            <title>React + Openlayers Lab</title>
            <ToggleMap showmap={this.props.showmap} center={this.props.center} zoom={this.props.zoom} portrait={this.state.portrait} />
            {input(this)}
        </div>;
    }
}
