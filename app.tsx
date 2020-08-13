import * as React from 'react';
import { PureComponent as Component, createElement as create } from 'react';
import { Maplet } from './components/maplet';
import { QuizletComponent } from "./components/quizlet";
import { input, Dictionary } from "./common/common";
import { Toolbar } from "./components/index";
import { BingImagerySet, OtherImagerySet } from "./components/openlayers";

import { Transform } from "./common/csv-importer";
import { storage } from "./common/storage";

import { IPacket } from "./components/packets/common";
import { Loader as JsonLoader } from "./components/packets/loaders/agsjsonloader";
import { Loader as GeoJsonLoader } from "./components/packets/loaders/geojsonloader";

import packets = require("./components/packets/index");

import Vector from "@ol/source/Vector";
import type Geometry from '@ol/geom/Geometry';
import Feature from '@ol/Feature';
import Polygon from '@ol/geom/Polygon';
import Point from '@ol/geom/Point';
import * as olGeom from "@ol/geom";

function defaultStyle(score: number): BingImagerySet | OtherImagerySet {
    score = Math.floor(score / 500);
    switch (score) {
        case 0: return "CanvasDarkWithLabels";
        case 1: return "AerialWithLabels";
        case 2: return "Aerial";
        case 3: return "WaterColorWithLabels";
        case 4: return "WaterColor";
        case 5: return "BlackWithLabels";
        case 6: return "Black";
        default: return "EsriAerial";
    }
}

function populateLayerSource(source: Vector<Geometry>, packet: IPacket<any>) {
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
                        let feature = new Feature();
                        {
                            let geom: any;
                            switch (geoType) {
                                case "Point":
                                    geom = new Point([f.geometry.x, f.geometry.y], "XY");
                                    break;
                                case "Polygon":
                                    geom = new Polygon(f.geometry.rings, "XY");
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
        case "multigeojson":
        case "geojson":
            {
                let loader = new GeoJsonLoader<any>();
                loader.load(packet, geojson => {
                    let features = geojson.features.map(f => {
                        let feature = new Feature();
                        {
                            const hack: any = olGeom;
                            const geom = new hack[f.geometry.type](f.geometry.coordinates, "XY");
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
    source: Vector<Geometry>;
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
        let vectorSource = new Vector();
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
                {Object.keys(packets)
                    .sort((a, b) => (storage.force(b).score - storage.force(a).score) || a.localeCompare(b))
                    .map(p => <button onClick={() => this.pickPacket(p)}>{p} ({storage.force(p).score})</button>)}
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
        if (!packet || !packet.style) return defaultStyle(score);
        return packet.style(score);
    }
}
