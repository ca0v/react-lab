/**
* Turns a vector layer into a geography quiz.
* User is asked to click a feature.
* If user clicks wrong feature, "incorrect" event is raised
* If user clicks correct feature, "correct" event is raised
*/
import { OpenLayers } from './openlayers';
import { PureComponent as Component, createElement as create } from 'react';
import { render } from "react-dom";
import { debounce, distinct, shuffle, storage } from "../common/common";
import * as ol from "openlayers";

const theme = {
    textFillColor: [200, 200, 200, 1],
    pointFillColor: [200, 200, 200, 0.5],
    textBorderColor: [200, 100, 20, 1],
    correctFillColor: [20, 100, 20, 0.3],
    correctBorderColor: [20, 100, 20, 1],
    incorrectFillColor: [200, 20, 20, 0.3],
    incorrectBorderColor: [200, 20, 20, 1],
    borderColor: [200, 100, 20, 1],
    hintBorderColor: [200, 20, 200, 1],
    noColor: [0, 0, 0, 0],
};

// converts [0..1] into 10..1
function rank(feature: ol.Feature) {
    let weight = feature.get("weight") || 0;
    return Math.max(1, Math.min(10, 10 - Math.round(10 * weight)));
}

function color(color: any) {
    let result: [number, number, number, number] = color;
    return result;
}

const styles = {
    correct: (quizlet: QuizletComponent) => (feature: ol.Feature | ol.render.Feature, res: number) => [
        new ol.style.Style({
            fill: new ol.style.Fill({
                color: color(theme.correctFillColor),
            }),
            stroke: new ol.style.Stroke({
                color: color(theme.correctBorderColor),
                width: 2
            }),
        }),
        new ol.style.Style({
            text: new ol.style.Text({
                text: `${feature.get(quizlet.props.featureNameFieldName)}`,
                scale: 2,
                fill: new ol.style.Fill({
                    color: color(theme.textFillColor),
                }),
                stroke: new ol.style.Stroke({
                    color: color(theme.correctBorderColor),
                    width: 2,
                }),
            }),
        })
    ],
    wrong: (quizlet: QuizletComponent) => (feature: ol.Feature, res: number) => {

        let featureName = feature.get(quizlet.props.featureNameFieldName);

        switch (feature.getGeometry().getType()) {
            case "Point":
                return new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 10,
                        stroke: new ol.style.Stroke({
                            color: color(theme.incorrectBorderColor),
                            width: 1
                        }),
                        fill: new ol.style.Fill({
                            color: color(theme.incorrectFillColor),
                        }),
                    }),
                    text: new ol.style.Text({
                        text: res < 50 ? featureName : "",
                        scale: 2,
                        stroke: new ol.style.Stroke({
                            color: color(theme.incorrectBorderColor),
                            width: 1
                        }),
                        fill: new ol.style.Fill({
                            color: color(theme.textFillColor),
                        }),
                    }),
                });

            default:
                return [

                    new ol.style.Style({
                        fill: new ol.style.Fill({
                            color: color(theme.incorrectFillColor),
                        }),
                        stroke: new ol.style.Stroke({
                            color: color(theme.incorrectBorderColor),
                            width: 2,
                        }),
                    }),
                    new ol.style.Style({
                        text: new ol.style.Text({
                            text: feature.get(quizlet.props.featureNameFieldName),
                            scale: 2,
                            fill: new ol.style.Fill({
                                color: color(theme.textFillColor),
                            }),
                            stroke: new ol.style.Stroke({
                                color: color(theme.incorrectBorderColor),
                                width: 2,
                            }),
                        }),
                    }),
                ];
        }
    },

    indeterminate: (quizlet: QuizletComponent) => (feature: ol.Feature, res: number) => {
        let featureName = feature.get(quizlet.props.featureNameFieldName);

        let hint = quizlet.state.hint || 0;
        let showText = 1 < hint;
        let isCurrentFeature = (quizlet.state.answer === featureName);
        let showOutline = (1 < hint) && isCurrentFeature;
        let weight = feature.get("weight") || 1;
        let radius = 10 + Math.round(weight * 20);
        if (isCurrentFeature && hint) radius += 2 * hint;

        if ((weight / res) < (0.5 / 8196)) return;

        switch (feature.getGeometry().getType()) {
            case "Point":
                return (radius > 0) && new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: radius,
                        stroke: new ol.style.Stroke({
                            color: color(theme.borderColor),
                            width: 1 + hint / 2
                        }),
                        fill: new ol.style.Fill({
                            color: color(theme.pointFillColor),
                        }),
                    }),
                    text: new ol.style.Text({
                        text: (res < (50 + 10 * hint) ? featureName : ""),
                        scale: 1.5,
                        stroke: new ol.style.Stroke({
                            color: color(theme.textBorderColor),
                            width: 1
                        }),
                        fill: new ol.style.Fill({
                            color: color(theme.textFillColor),
                        }),
                    }),
                });

            default:
                return new ol.style.Style({
                    text: new ol.style.Text({
                        text: showText ? featureName : "",
                        scale: 2,
                        stroke: new ol.style.Stroke({
                            color: color(theme.textBorderColor),
                            width: 2
                        }),
                        fill: new ol.style.Fill({
                            color: color(theme.textFillColor),
                        }),
                    }),
                    stroke: new ol.style.Stroke({
                        color: color(showOutline ? theme.hintBorderColor : theme.borderColor),
                        width: 2
                    }),
                });
        }
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
    answers: string[];
}

export interface QuizletProps {
    source: ol.source.Vector;
    featureNameFieldName: string;
}

export class QuizletComponent extends Component<QuizletProps, QuizletStates> {

    constructor(props: QuizletProps) {
        super(props);
        this.state = {
            answer: "Click a Feature to Begin!",
            center: [0, 0],
            zoom: 3,
            score: storage.getItem().score || 0,
            features: new ol.Collection<ol.Feature>(),
            answers: [],
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
                    source: [this.props.source]
                }}
                setCenter={(center, zoom) => {
                    this.setState(() => ({
                        center: center,
                        zoom: zoom
                    }))
                }}
                onLayerAdd={(args: { layer: ol.layer.Vector }) => {
                    let source = args.layer.getSource();
                    source.once("addfeature", debounce(() => {
                    }, 500));
                }}
                onFeatureClick={(args: {
                    layer: ol.layer.Vector,
                    feature: ol.Feature
                }) => {
                    {
                        // bring-to-front
                        let source = args.layer.getSource();
                        source.removeFeature(args.feature);
                        args.feature.setId(Math.random() * 10000);
                        source.addFeature(args.feature);
                        source.changed();
                    }
                    let answers = this.state.answers;
                    if (!answers || !answers.length) {
                        let featureName = args.feature.get(this.props.featureNameFieldName);
                        this.init(args.layer);
                        this.next();
                    }
                    else if (this.test(args.feature)) {
                        this.score(20);
                        args.feature.setStyle(styles.correct(this));
                        if (this.state.answer && 0 === this.state.hint) {
                            let correctAnswers = storage.getItem();
                            correctAnswers[this.state.answer] = (correctAnswers[this.state.answer] || 0) + 1;
                            correctAnswers.score = this.state.score;
                            storage.setItem(correctAnswers);
                        }
                        this.next();
                        this.state.features.push(args.feature);
                    } else {
                        this.score(-20);
                        let actualFeature = this.find();
                        if (actualFeature) {
                            actualFeature.setStyle(styles.wrong(this));
                            this.zoomToFeature(actualFeature);
                            this.state.features.push(actualFeature);
                            this.skip();
                        }
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
            <div className="score">Score<label>{this.state.score}</label></div>
            <div className="score">Find<label>{this.state.answer}</label></div>
            {!!this.state.answers.length && <div className="score">Remaining<label>{(1 + this.state.answers.length) || "?"}</label></div>}
            <br /> <div className="score">
                <button onClick={() => this.skip()}>Skip</button>
                <button onClick={() => this.hint()}>Hint</button>
            </div>
        </div >;
    }

    skip() {
        if (!this.state.answer) return;
        this.score(-1);
        let answers = this.state.answers;
        answers && answers.unshift(this.state.answer);
        this.next();
    }

    score(value: number) {
        this.setState(prev => ({
            score: prev.score + value
        }));
        let g = storage.getItem();
        g.score = this.state.score;
        storage.setItem(g);
    }

    generate(features: ol.Feature[]) {
        // remove answers that have been answered correctly
        let fieldName = this.props.featureNameFieldName;
        let correctAnswers = storage.getItem();
        this.setState(prev => ({
            score: correctAnswers.score || 0
        }));
        delete correctAnswers.score;

        let counts = {};
        let answers = features.map(f => f.get(fieldName));

        let values = distinct(correctAnswers).map(v => parseInt(v)).sort().reverse();
        // remove most correct answers until less than 10 remain
        {
            let nextAnswers = answers;
            while (values.length && nextAnswers.length > 10) {
                answers = nextAnswers;
                let maxCount = values.pop() || 0;
                console.log(`removing where count >= ${maxCount}`);
                nextAnswers = nextAnswers.filter(f => !correctAnswers[f] || (correctAnswers[f] < maxCount));
            }
        }

        shuffle(answers);
        if (answers.length > 10) {
            answers = answers.splice(0, 10);
        }
        return answers;
    }

    init(layer: ol.layer.Vector) {
        let source = layer.getSource();
        let features = source.getFeatures();
        features.forEach(f => f.setStyle(styles.indeterminate(this)));
        this.setState(prev => ({
            layer: layer,
            answers: this.generate(features)
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
        return result;
    }

    zoomToFeature(feature: ol.Feature, grow = 1) {

        let scale = (extent: ol.Extent, scale: number) => {
            let center = ol.extent.getCenter(extent);
            let width = Math.max(1000, ol.extent.getWidth(extent), ol.extent.getHeight(extent)) * scale;
            return [center[0] - width, center[1] - width, center[0] + width, center[1] + width];
        }

        this.setState(prev => ({
            mapTrigger: {
                message: "extent",
                args: {
                    extent: scale(feature.getGeometry().getExtent(), grow)
                }
            }
        }));
    }

    next() {
        let answers = this.state.answers;
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
        this.score(-5);
        let center = ol.extent.getCenter(feature.getGeometry().getExtent());
        this.setState(prev => ({
            hint: (prev.hint || 0) + 1,
            mapTrigger: { message: "refresh" },
            center: center,
            zoom: Math.min(12, 5 + (prev.hint || 0) + 1)
        }));
    }
}
