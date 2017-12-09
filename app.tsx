import * as React from 'react';
import { PureComponent as Component, createElement as create } from 'react';
import { Maplet } from './components/maplet';
import { QuizletComponent } from "./components/quizlet";
import { input, Dictionary } from "./common/common";

import { Transform } from "./common/csv-importer";

if (0) {
    // sample REST reqeust
    let client = new XMLHttpRequest();
    client.open("GET", "./data/getit.txt", true);
    client.onloadend = () => {
    };
    client.send();
}

const packets = {
    "usa great lakes": {
        url: "https://gist.githubusercontent.com/tristanwietsma/6046119/raw/f5e8654b5a811199d2f2190b3090d1c1e3488436/greatlakes.geojson",
        name: "NAME"
    },
    "world countries": {
        url: "./data/countries.json",
        name: "name"
    },
    "usa city centers": {
        url: "./data/us-cities.json",
        name: "name",
    },
    "world city centers": {
        url: "./data/cities.json",
        name: "city",
        radius: (d: { population: number }) => Math.log(d.population),
    },
    "usa states": {
        url: "./data/us-states.json",
        name: "name",
    }
}

export interface AppState {
    orientation: "portrait" | "landscape";
    url: string;
    featureNameFieldName: string;
    styler?: (feature: ol.Feature, res: number) => ol.style.Style;
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
        let source = packets["world city centers"];
        this.state = {
            orientation: "landscape",
            url: source.url,
            featureNameFieldName: source.name,
        };
    }

    render(): any {
        return <div className="app">
            <title>React + Openlayers Lab</title>
            <QuizletComponent
                geojsonUrl={this.state.url}
                featureNameFieldName={this.state.featureNameFieldName}
                styler={this.state.styler}
            />
        </div>;
    }
}
