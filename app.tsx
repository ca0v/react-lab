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

interface IPacket<T> {
    type: string;
    url: string;
    name: string; // primaryFieldName
    radius: (d: T) => number;
    filter: (d: T) => boolean;
}

interface IGeoJson<T> {
    type: "FeatureCollection";
    features: Array<{
        type: string;
        properties: T;
        geometry: {
            type: string;
            coordinates: any;
        }
    }>;
}

class GeoJsonLoader<T> {

    load(packet: IPacket<T>, cb: (data: IGeoJson<T>) => void) {
        let client = new XMLHttpRequest();
        client.open("GET", packet.url, true);
        client.onloadend = () => {
            let geoJson: IGeoJson<T> = JSON.parse(client.responseText);
            geoJson.features = geoJson.features.filter(f => packet.filter(f.properties));
            cb(geoJson);
        };
        client.send();
    }

}

function populateLayerSource(source: ol.source.Vector, packet: IPacket<any>) {
    switch (packet.type) {
        case "geojson":
            let loader = new GeoJsonLoader<any>();
            loader.load(packet, geojson => {
                let features = geojson.features.map(f => {
                    let feature = new ol.Feature();
                    let geom = new ol.geom.Point(f.geometry.coordinates, "XY");
                    geom.transform("EPSG:4326", "EPSG:3857");
                    feature.setGeometry(geom);
                    feature.setProperties(f.properties);
                    return feature;
                });
                source.addFeatures(features);
            });
    }
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
        type: "geojson",
        url: "./data/cities.json",
        loader: GeoJsonLoader,
        name: "city",
        radius: (d: { population: number }) => Math.log(d.population),
        filter: (d: { population: number }) => d.population > 10000000,
    },
    "usa states": {
        url: "./data/us-states.json",
        name: "name",
    }
}

export interface AppState {
    orientation: "portrait" | "landscape";
    source: ol.source.Vector;
    featureNameFieldName: string;
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
        let packet = packets["world city centers"];
        let vectorSource = new ol.source.Vector();
        this.state = {
            orientation: "landscape",
            source: vectorSource,
            featureNameFieldName: packet.name,
        };

        populateLayerSource(vectorSource, packet);
    }
    

    render(): any {
        return <div className="app">
            <title>React + Openlayers Lab</title>
            <QuizletComponent
                source={this.state.source}
                featureNameFieldName={this.state.featureNameFieldName}
            />
        </div>;
    }
}
