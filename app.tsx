import * as React from 'react';
import { PureComponent as Component, createElement as create } from 'react';
import { Maplet } from './components/maplet';
import { QuizletComponent } from "./components/quizlet";
import { input, Dictionary } from "./common/common";
import { Toolbar } from "./components/index";
import { BingImagerySet } from "./components/openlayers";

import { Transform } from "./common/csv-importer";
import { storage } from "./common/storage";

import { IPacket } from "./components/packets/common";
import {Loader as JsonLoader} from "./components/packets/loaders/agsjsonloader";
import {Loader as GeoJsonLoader} from "./components/packets/loaders/geojsonloader";

import packets = require("./components/packets/index");

import * as ol from "openlayers";

function populateLayerSource(source: ol.source.Vector, packet: IPacket<any>) {
    switch (packet.type) {
        case "agsjson":
            {
                let loader = new JsonLoader();
                loader.load(packet.url, agsjson => {
                    let typeMap: Dictionary<"Polygon" | "Point"> = {
                        "esriGeometryPolygon": "Polygon",
                        "esriGeometryPoint": "Point",
                    };
                    let geoType = typeMap[agsjson.geometryType];
                    let features = agsjson.features.map(f => {
                        let feature = new ol.Feature();
                        {
                            let geom: any;
                            switch (geoType) {
                                case "Point":
                                    geom = new ol.geom.Point([f.geometry.x, f.geometry.y], "XY");
                                    break;
                                case "Polygon":
                                    geom = new ol.geom.Polygon(f.geometry.rings, "XY");
                                    break;
                            }
                            geom.transform("EPSG:4326", "EPSG:3857");
                            feature.setGeometry(geom);
                        }
                        feature.setProperties(f.attributes);
                        return feature;
                    });
                    source.addFeatures(features);
                })
                break;
            }
        case "geojson":
            {
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
                break;
            }
    }
}

export interface AppState {
    orientation: "portrait" | "landscape";
    source: ol.source.Vector;
    featureNameFieldName: string;
    packetName: string;
    packetStyle: BingImagerySet;
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
            packetStyle: "Aerial",
        };
    }

    private pickPacket(packetName: string) {
        let packet = packets[packetName];
        packet.score = storage.force(this.state.packetName).score;

        this.setState(prev => ({
            packetName: packetName,
            featureNameFieldName: packet.name,
            packetStyle: packet.style || "AerialWithLabels"
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
                questionsPerQuiz={20}
                quizletName={this.state.packetName}
                getLayerStyle={(score: number) => this.getLayerStyle(score)}
                source={this.state.source}
                featureNameFieldName={this.state.featureNameFieldName}
            />}
        </div>;
    }

    getLayerStyle(score: number) {
        let packet = packets[this.state.packetName];
        if (!packet || !packet.style) return "AerialWithLabels";
        return packet.style(score);
    }
}
