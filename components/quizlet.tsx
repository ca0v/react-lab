/**
* Turns a vector layer into a geography quiz.
* User is asked to click a feature.
* If user clicks wrong feature, "incorrect" event is raised
* If user clicks correct feature, "correct" event is raised
*/
import { OpenLayers } from './openlayers';
import { PureComponent as Component, createElement as create } from 'react';
import { render } from "react-dom";
import { Dictionary, debounce, distinct, EventDispatcher, shuffle, LocalStorage } from "../common/common";
import * as ol from "openlayers";

interface IStorage {
    score: number;
    stats: Dictionary<{
        correct: number;
        incorrect: number;
        hint: number;
    }>
};

const questionsPerQuiz = 3;

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

function color(color: any) {
    let result: [number, number, number, number] = color;
    return result;
}

function scaleExtent(extent: ol.Extent, scale = 1) {
    let center = ol.extent.getCenter(extent);
    let width = 0.5 * Math.max(1000, ol.extent.getWidth(extent), ol.extent.getHeight(extent)) * scale;
    return [center[0] - width, center[1] - width, center[0] + width, center[1] + width];
}

/**
 * Styles for the various question states and geometries...any react goodies we can use here?
 */
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

    incorrect: (quizlet: QuizletComponent) => (feature: ol.Feature | ol.render.Feature, res: number) => {

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

    indeterminate: (quizlet: QuizletComponent) => (feature: ol.Feature | ol.render.Feature, res: number) => {
        let featureName = feature.get(quizlet.props.featureNameFieldName);

        let hint = quizlet.state.hint || 0;
        let showText = 1 < hint;
        let isCurrentFeature = (quizlet.state.answer === featureName);
        let showOutline = (1 < hint) && isCurrentFeature;
        let weight = feature.get("weight") || 1;
        let radius = 10 + Math.round(weight * 20);
        if (isCurrentFeature && hint) radius += 2 * hint;

        if ((weight / res) < (0.5 / 8196)) return new ol.style.Style();

        switch (feature.getGeometry().getType()) {
            case "Point":
                if (radius <= 0) return new ol.style.Style();
                return new ol.style.Style({
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
    center: [number, number];
    zoom: number;
    features: ol.Collection<ol.Feature>;
    mapTrigger?: { message: string, args: any[] };
    hint?: number;
    answers: string[];
    score: number;
}

export interface QuizletProps {
    quizletName: string;
    source: ol.source.Vector;
    featureNameFieldName: string;
}

export class QuizletComponent extends Component<QuizletProps, QuizletStates> {

    private dispatcher = new EventDispatcher<any>();

    constructor(props: QuizletProps) {
        super(props);

        let storage = new LocalStorage<Dictionary<IStorage>>();
        let data = storage.getItem();
        let statInfo = data[props.quizletName] = (data[props.quizletName] || {
            stats: {}
        });

        this.state = {
            center: [0, 0],
            zoom: 3,
            features: new ol.Collection<ol.Feature>(),
            answers: [],
            score: statInfo.score || 0
        }

        document.addEventListener("keypress", (args) => {
            switch (args.key.toUpperCase()) {
                case "H": this.dispatcher.trigger("hint"); break;
                case "S": this.skip(); break;
            }
        });

        this.dispatcher.on("adjust-answers", (args: { answers: string[] }) => {
            // remove most correct answers until less than questionsPerQuiz remain
            let counts: any = {};

            Object.keys(statInfo.stats).forEach(k => counts[statInfo.stats[k].correct] = true);
            let values = Object.keys(counts).map(v => parseInt(v)).sort().reverse();

            let nextAnswers = args.answers;

            while (values.length && nextAnswers.length > questionsPerQuiz) {
                args.answers = nextAnswers;
                let maxCount = values.pop() || 0;
                console.log(`removing where count >= ${maxCount}`);
                nextAnswers = nextAnswers.filter(f => !statInfo.stats[f] || (statInfo.stats[f].correct < maxCount));
            }

            console.log(args.answers);

        });

        this.dispatcher.on("correct", () => {
            console.log("correct");
            this.score(20);

            let stats = this.getStat(data);
            if (stats) {
                stats.correct++;
                statInfo.score = this.state.score;
                storage.setItem(data);
            }

            let feature = this.find();
            if (feature) {
                feature.setStyle(styles.correct(this));
                this.state.features.remove(feature);
                this.state.features.push(feature);

                if (!this.next()) {
                    setTimeout(() => {
                        this.setState(prev => ({
                            mapTrigger: {
                                message: "extent",
                                args: {
                                    extent: scaleExtent(this.props.source.getExtent())
                                }
                            }
                        }));
                        this.init();
                    }, 1000);
                }
            }
        });

        this.dispatcher.on("incorrect", () => {
            console.log("incorrect");
            this.score(-20);

            let stats = this.getStat(data);
            if (stats) {
                stats.incorrect++;
                statInfo.score = this.state.score;
                storage.setItem(data);
            }


            let feature = this.find();
            if (feature) {
                feature.setStyle(styles.incorrect(this));
                this.zoomToFeature(feature);
                this.state.features.remove(feature);
                this.state.features.push(feature);
                this.skip();
            }
        });

        this.dispatcher.on("hint", () => {
            console.log("hint");

            let stats = this.getStat(data);
            if (stats) {
                stats.hint++;
                data[this.props.quizletName].score = this.state.score;
                storage.setItem(data);
            }

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
        });
    }

    private getStat(data: Dictionary<IStorage>) {
        if (this.state.answer) {
            let storage = data[this.props.quizletName] = (data[this.props.quizletName] || {});
            let stats = storage.stats = (storage.stats || {});
            let stat = stats[this.state.answer] = (stats[this.state.answer] || {
                correct: 0,
                incorrect: 0,
                hint: 0
            });
            return stat;
        }
        return null;
    }

    componentDidUpdate(prevProp: QuizletProps, prevState: QuizletStates) {
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
                        let extent = source.getExtent();
                        this.setState(prev => ({
                            mapTrigger: {
                                message: "extent",
                                args: {
                                    extent: scaleExtent(extent)
                                }
                            }
                        }));
                    }, 500));
                }}
                onFeatureClick={(args: {
                    layer: ol.layer.Vector,
                    feature: ol.Feature
                }) => {
                    if (!this.state.answer) {
                        this.init();
                    } else if (this.test(args.feature)) {
                        this.dispatcher.trigger("correct");
                    } else {
                        this.dispatcher.trigger("incorrect");
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
                    onClick={(args: { coordinate: ol.Coordinate, map: ol.Map }) => {
                        this.setState(prev => ({
                            center: args.coordinate,
                            zoom: Math.max(prev.zoom, 5 + args.map.getView().getZoom()),
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
                <button onClick={() => this.dispatcher.trigger("hint")}>Hint</button>
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
    }

    generate(features: ol.Feature[]) {
        let fieldName = this.props.featureNameFieldName;
        let answers = features.map(f => f.get(fieldName));
        {
            let byref = { answers: answers };
            this.dispatcher.trigger("adjust-answers", byref);
            answers = byref.answers;
        }
        console.log(answers);
        shuffle(answers);
        console.log(answers);
        if (answers.length > questionsPerQuiz) {
            answers = answers.splice(0, questionsPerQuiz);
        }
        console.log(answers);
        return answers;
    }

    init() {
        let source = this.props.source;
        let features = source.getFeatures();
        features.forEach(f => f.setStyle(styles.indeterminate(this)));
        let answers = this.generate(features);
        let answer = answers.pop();
        this.state.features.clear();
        this.setState(prev => ({
            answer: answer,
            answers: answers,
        }));
    }

    // return true if the feature matches the correct answer
    test(feature: ol.Feature) {
        let fieldName = this.props.featureNameFieldName;
        let result = feature.get(fieldName) === this.state.answer;
        return result;
    }

    zoomToFeature(feature: ol.Feature, grow = 2) {

        this.setState(prev => ({
            mapTrigger: {
                message: "extent",
                args: {
                    extent: scaleExtent(feature.getGeometry().getExtent(), grow)
                }
            }
        }));
    }

    next() {
        let answers = this.state.answers;
        if (!answers.length) return false;
        this.setState(prev => ({
            answer: answers.pop(),
            hint: 0,
        }));
        return true;
    }

    find() {
        let source = this.props.source;
        if (!source) return;
        let features = source.getFeatures().filter(f => f.get(this.props.featureNameFieldName) === this.state.answer);
        if (features && features.length === 1) {
            let feature = features[0];
            return feature;
        }
        return null;
    }

}
