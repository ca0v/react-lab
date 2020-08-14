import { PureComponent as Component, createElement as create } from 'react';
import { QuizletComponent } from "./components/quizlet";
import { Toolbar } from "./components/index";
import { BingImagerySet, OtherImagerySet } from "./components/openlayers";

import { storage } from "./common/storage";

import packets = require("./components/packets/index");

import Vector from "@ol/source/Vector";
import type Geometry from '@ol/geom/Geometry';
import { populateLayerSource } from './fun/populateLayerSource';

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
        } as any));

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
