/**
* Turns a vector layer into a geography quiz.
* User is asked to click a feature.
* If user clicks wrong feature, "incorrect" event is raised
* If user clicks correct feature, "correct" event is raised
*/
import { OpenLayers } from './openlayers';
import { PureComponent as Component, createElement as create } from 'react';
import { render } from "react-dom";
import { shuffle } from "../common/common";
import * as ol from "openlayers";

const styles = {
    right: new ol.style.Style({
        fill: new ol.style.Fill({
            color: [0, 128, 0, 0.5]
        }),
        text: new ol.style.Text({
            text: "☺",
            scale: 5,
        }),
        stroke: new ol.style.Stroke({
            color: [20, 200, 200, 1],
            width: 2
        }),
    }),
    wrong: new ol.style.Style({
        fill: new ol.style.Fill({
            color: [255, 0, 0, 0.5]
        }),
        text: new ol.style.Text({
            text: "☹",
            scale: 5,
        }),
        stroke: new ol.style.Stroke({
            color: [200, 20, 200, 1],
            width: 2
        }),
    }),
    indeterminate: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: [20, 20, 200, 1],
            width: 2
        }),
    })
};

export interface QuizletStates {
    answer?: string;
    layer?: ol.layer.Vector;
    center: [number, number];
    zoom: number;
    score: number;
    features: ol.Collection<ol.Feature>;
}

export interface QuizletProps {
    geojsonUrl: string;
    featureNameFieldName: string;
}

let answers: string[];

export class QuizletComponent extends Component<QuizletProps, QuizletStates> {

    constructor(props: QuizletProps) {
        super(props);
        this.state = {
            answer: "Click the map to Begin!",
            center: [0, 0],
            zoom: 1,
            score: 0,
            features: new ol.Collection<ol.Feature>(),
        }
    }

    render() {
        return <div className="quizlet">
            <OpenLayers
                allowKeyboard={true}
                orientation="full"
                center={this.state.center}
                zoom={this.state.zoom}
                controls={{
                    mousePosition: true,
                }}
                bingImagerySet="Aerial"
                layers={{
                    geoJson: [this.props.geojsonUrl]
                }}
                setCenter={(center, zoom) => {
                    this.setState(() => ({
                        center: center,
                        zoom: zoom
                    }))
                }}
                onFeatureClick={(args: { layer: ol.layer.Vector, feature: ol.Feature }) => {
                    if (!answers || !answers.length) {
                        this.init(args.layer);
                        this.next();
                    }
                    else if (this.test(args.feature)) {
                        this.state.features.push(args.feature);
                    } else {
                        let expectedFeature = this.find();
                        expectedFeature && this.state.features.push(expectedFeature);
                    }
                }}
            >
                <OpenLayers
                    className="inset"
                    bingImagerySet="AerialWithLabels"
                    center={this.state.center}
                    allowZoom={true}
                    allowPan={true}
                    orientation="landscape"
                    onFeatureClick={() => { }}
                    features={this.state.features}>
                </OpenLayers>
            </OpenLayers>
            <div className="score">Score<label>{this.state.score}</label></div>
            <div className="score">Find<label>{this.state.answer}</label></div>
            <br /><div className="score">
                <button onClick={() => this.skip()}>Skip</button>
                <button onClick={() => this.hint()}>Hint</button>
            </div>
        </div>;
    }

    skip() {
        this.score(-1);
        this.state.answer && answers.unshift(this.state.answer);
        this.next();
    }

    score(value: number) {
        this.setState(prev => ({
            score: prev.score + value
        }));
    }

    init(layer: ol.layer.Vector) {
        let source = layer.getSource();
        let fieldName = this.props.featureNameFieldName;
        let features = source.getFeatures();
        features.forEach(f => f.setStyle(styles.indeterminate));
        answers = shuffle(features.map(f => f.get(fieldName)));
        this.setState(prev => ({
            layer: layer,
            score: 0
        }));

        document.addEventListener("keypress", (args) => {
            switch (args.key.toUpperCase()) {
                case "H": this.hint(); break;
                case "S": this.skip(); break;
            }
        });
    }

    // return true if the feature matches the correct answer
    test(feature: ol.Feature) {
        let fieldName = this.props.featureNameFieldName;
        let result = feature.get(fieldName) === this.state.answer;
        if (result) {
            this.score(20);
            feature.setStyle(styles.right);
            this.next();
        } else {
            this.score(-20);
            let actualFeature = this.find();
            if (actualFeature) {
                actualFeature.setStyle(styles.wrong);
                let center = ol.extent.getCenter(actualFeature.getGeometry().getExtent());
                this.setState(prev => ({
                    center: ol.proj.transform(center, "EPSG:3857", "EPSG:4326"),
                    zoom: 6
                }));
                this.state.answer && answers.unshift(this.state.answer);
                setTimeout(() => this.next(), 2500);
            }
        }
        return result;
    }

    next() {
        if (!answers.length) return;
        this.setState(prev => ({
            answer: answers.pop(),
        }));
    }

    find() {
        if (!this.state.layer) return;
        let source = this.state.layer.getSource();
        if (!source) return;
        let features = source.getFeatures().filter(f => f.get(this.props.featureNameFieldName) === this.state.answer);
        if (features && features.length === 1) {
            let feature = features[0];
            return feature;
        }
        return null;
    }

    hint() {
        let feature = this.find();
        if (!feature) return;
        this.score(-5);
        let center = ol.extent.getCenter(feature.getGeometry().getExtent());
        this.setState(prev => ({
            center: ol.proj.transform(center, "EPSG:3857", "EPSG:4326"),
            zoom: prev.zoom + 0.25
        }));
    }
}
