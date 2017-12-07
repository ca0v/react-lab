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
    right: (quizlet: QuizletComponent) => (feature: ol.Feature | ol.render.Feature, res: number) => new ol.style.Style({
        fill: new ol.style.Fill({
            color: [0, 128, 0, 0.5]
        }),
        text: new ol.style.Text({
            text: `✔ ${feature.get(quizlet.props.featureNameFieldName)}`,
            scale: 1,
        }),
        stroke: new ol.style.Stroke({
            color: [20, 200, 200, 1],
            width: 2
        }),
    }),
    wrong: (quizlet: QuizletComponent) => (feature: ol.Feature | ol.render.Feature, res: number) => new ol.style.Style({
        fill: new ol.style.Fill({
            color: [255, 0, 0, 0.5]
        }),
        text: new ol.style.Text({
            text: feature.get(quizlet.props.featureNameFieldName),
            scale: 5,
        }),
        stroke: new ol.style.Stroke({
            color: [200, 20, 200, 1],
            width: 2
        }),
    }),
    indeterminate: (quizlet: QuizletComponent) => (feature: ol.Feature | ol.render.Feature, res: number) => {
        let featureName = feature.get(quizlet.props.featureNameFieldName);

        let showText = quizlet.state.hint && (1 < quizlet.state.hint);
        let showOutline = quizlet.state.hint && (2 < quizlet.state.hint) && (quizlet.state.answer === featureName);

        return new ol.style.Style({
            text: new ol.style.Text({
                text: showText ? featureName : "",
                scale: 1,
                stroke: new ol.style.Stroke({
                    color: [200, 200, 200, 1],
                    width: 2
                }),
            }),
            stroke: new ol.style.Stroke({
                color: showOutline ? [200, 20, 200, 1] : [20, 20, 200, 1],
                width: showOutline ? quizlet.state.hint : 1
            }),
        });
    }
};

export interface QuizletStates {
    answer?: string;
    layer?: ol.layer.Vector;
    center: [number, number];
    zoom: number;
    score: number;
    features: ol.Collection<ol.Feature>;
    mapTrigger?: { message: string, args: any[] };
    hint?: number;
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
                trigger={this.state.mapTrigger}
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
                        let featureName = args.feature.get(this.props.featureNameFieldName);
                        this.init(args.layer, {
                            firstLetter: featureName[0]
                        });
                        this.zoomToFeature(args.feature);
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
                    osm={false}
                    center={this.state.center}
                    zoom={Math.max(0, this.state.zoom - 5)}
                    allowZoom={true}
                    allowPan={true}
                    orientation="landscape"
                    onClick={(args: { coordinate: ol.Coordinate }) => {
                        this.setState(prev => ({
                            center: args.coordinate
                        }))
                    }}
                    layers={{ geoJson: ["./data/countries.json"] }}
                    features={this.state.features}>
                </OpenLayers>
            </OpenLayers>
            <div className="score">Score<label>{this.state.score} {answers && `${answers.length} remaining`}</label></div>
            <div className="score">Remaining<label>{answers ? answers.length : "?"}</label></div>
            <div className="score">Find<label>{this.state.answer}</label></div>
            <br /> <div className="score">
                <button onClick={() => this.skip()}>Skip</button>
                <button onClick={() => this.hint()}>Hint</button>
            </div>
        </div >;
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

    init(layer: ol.layer.Vector, args?: { firstLetter: string }) {
        let source = layer.getSource();
        let fieldName = this.props.featureNameFieldName;
        let features = source.getFeatures();
        features.forEach(f => f.setStyle(styles.indeterminate(this)));
        answers = features.map(f => f.get(fieldName));
        if (args && args.firstLetter) answers = answers.filter(v => 0 === v.indexOf(args.firstLetter));
        shuffle(answers);

        this.setState(prev => ({
            layer: layer,
            score: prev.score || 0
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
            feature.setStyle(styles.right(this));
            this.next();
        } else {
            this.score(-20);
            let actualFeature = this.find();
            if (actualFeature) {
                actualFeature.setStyle(styles.wrong(this));
                this.zoomToFeature(actualFeature);
                this.state.answer && answers.unshift(this.state.answer);
                setTimeout(() => this.next(), 2500);
            }
        }
        return result;
    }

    zoomToFeature(feature: ol.Feature) {
        let extent = feature.getGeometry().getExtent();
        this.setState(prev => ({
            mapTrigger: {
                message: "extent",
                args: {
                    extent: extent
                }
            }
        }));
    }

    next() {
        if (!answers.length) return;
        this.setState(prev => ({
            answer: answers.pop(),
            hint: 0,
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
        let center = ol.extent.getCenter(feature.getGeometry().getExtent());
        this.setState(prev => ({
            score: prev.score - 5,
            hint: (prev.hint || 0) + 1,
            center: center,
            zoom: Math.min(Math.max(5, prev.zoom + 1), 6),
            mapTrigger: { message: "refresh" }
        }));
    }
}
