import * as React from 'react';
import { PureComponent as Component, createElement as create } from 'react';
import { Maplet } from './components/maplet';
import { QuizletComponent } from "./components/quizlet";
import { input } from "./common/common";

export interface AppState {
    orientation: "portrait" | "landscape";
    url: string;
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
        this.state = {
            orientation: "landscape",
            url: "./data/countries.json"
        };
    }

    render(): any {
        return <div className="app">
            <title>React + Openlayers Lab</title>
            <QuizletComponent geojsonUrl={this.state.url} featureNameFieldName="name" />
        </div>;
    }
}
