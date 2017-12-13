import * as React from 'react';
import { PureComponent as Component, createElement as create } from 'react';
import { Maplet } from './components/maplet';
import { QuizletComponent } from "./components/quizlet";
import { input, Dictionary } from "./common/common";
import { Toolbar } from "./components/index";
import continents = require("./data/continents");

import { Transform } from "./common/csv-importer";
import * as ol from "openlayers";

function asGeom(geometry: { type: string; coordinates: any }) {
    let hack: any = ol.geom;
    let geom = new hack[geometry.type](geometry.coordinates, "XY");
    return geom;
}

function filterByContinent(name: string) {
    let europe = continents.features.filter(f => f.properties.CONTINENT === name)[0];
    if (!europe) return null;
    let geom:ol.geom.Polygon = asGeom(europe.geometry);
    let bbox = geom.getExtent();
    return (f: IGeoJsonFeature<any>) => {
        let countryGeom: ol.geom.Polygon = asGeom(f.geometry);
        let country = countryGeom.getExtent();
        return ol.extent.intersects(bbox, country) && geom.intersectsExtent(country);
    };
}

interface IPacket<T> {
    type: string;
    url: string;
    name: string; // primaryFieldName
    weight?: (d: IGeoJsonFeature<T>) => number;
    filter?: (d: IGeoJsonFeature<T>) => boolean;
}

interface IGeoJson<T> {
    type: "FeatureCollection";
    features: Array<IGeoJsonFeature<T>>;
}

interface IGeoJsonFeature<T> {
    type: string;
    properties: T;
    geometry: {
        type: string;
        coordinates: any;
    }
}

class GeoJsonLoader<T extends { weight: number }> {

    load(packet: IPacket<T>, cb: (data: IGeoJson<T>) => void) {
        let client = new XMLHttpRequest();
        client.open("GET", packet.url, true);
        client.onloadend = () => {
            let geoJson: IGeoJson<T> = JSON.parse(client.responseText);
            if (packet.filter) {
                geoJson.features = geoJson.features.filter(f => packet.filter(f));
            }
            if (packet.weight) {
                geoJson.features.forEach(f => f.properties.weight = packet.weight(f));
            }
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
                    {
                        let hack: any = ol.geom;
                        let geom = new hack[f.geometry.type](f.geometry.coordinates, "XY");
                        geom.transform("EPSG:4326", "EPSG:3857");
                        feature.setGeometry(geom);
                    }
                    feature.setProperties(f.properties);
                    return feature;
                });
                source.addFeatures(features);
            });
    }
}

const packets: Dictionary<IPacket<any>> = {
    "World Countries": {
        type: "geojson",
        url: "./data/countries.json",
        name: "name"
    },
    "European Countries": {
        type: "geojson",
        url: "./data/countries.json",
        name: "name",
        filter: filterByContinent("Europe")
    },
    "African Countries": {
        type: "geojson",
        url: "./data/countries.json",
        name: "name",
        filter: filterByContinent("Africa")
    },
    "South American Countries": {
        type: "geojson",
        url: "./data/countries.json",
        name: "name",
        filter: filterByContinent("South America")
    },
    "Continents": {
        type: "geojson",
        url: "./data/continents.json",
        name: "CONTINENT",
    },
    "World Cities": {
        type: "geojson",
        url: "./data/cities.json",
        name: "city",
        weight: f => f.properties.population / 50000000,
        filter: f => f.properties.population > 10000000,
    },
    "US States": {
        type: "geojson",
        url: "./data/us-states.json",
        name: "name",
        filter: f => (0.5 < Math.random()) || (-1 === "AlaskaHawaiiPuerto Rico".indexOf(f.properties.name)),
    },
    "US Great Lakes": {
        type: "geojson",
        url: "https://gist.githubusercontent.com/tristanwietsma/6046119/raw/f5e8654b5a811199d2f2190b3090d1c1e3488436/greatlakes.geojson",
        name: "name"
    },
    "US Cities": {
        type: "geojson",
        url: "./data/us-cities.json",
        name: "name",
        weight: f => (f.properties.pop / 8405837),
        filter: f => f.properties.pop > 500000,
    },
}

export interface AppState {
    orientation: "portrait" | "landscape";
    source: ol.source.Vector;
    featureNameFieldName: string;
    packetName: string;
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
        let vectorSource = new ol.source.Vector();
        this.state = {
            orientation: "landscape",
            source: vectorSource,
            packetName: "",
            featureNameFieldName: "",
        };
    }

    private pickPacket(packetName: string) {
        let packet = packets[packetName];

        this.setState(prev => ({
            packetName: packetName,
            featureNameFieldName: packet.name,
        }));

        populateLayerSource(this.state.source, packet);
    }

    render(): any {
        return <div className="app">
            <title>React + Openlayers Lab</title>
            {!this.state.featureNameFieldName && <Toolbar>
                <label>Pick a Quiz</label>
                {Object.keys(packets).map(p => <button onClick={() => this.pickPacket(p)}>{p}</button>)}
            </Toolbar>}
            {!!this.state.packetName && <QuizletComponent
                questionsPerQuiz={25}
                quizletName={this.state.packetName}
                source={this.state.source}
                featureNameFieldName={this.state.featureNameFieldName}
            />}
        </div>;
    }
}
