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
import { styles } from "../common/quizlet-styles";
import { storage } from "../common/storage";

import * as ol from "openlayers";

function scaleExtent(fullExtent: ol.Extent, scale = 1, center = ol.extent.getCenter(fullExtent)) {
    let width = 0.5 * Math.max(ol.extent.getWidth(fullExtent), ol.extent.getHeight(fullExtent)) * scale;
    return [center[0] - width, center[1] - width, center[0] + width, center[1] + width];
}

export interface QuizletStates {
    answer?: string;
    center: [number, number];
    zoom: number;
    features: ol.Collection<ol.Feature>;
    mapTrigger?: { message: string, args: any[] };
    hint?: number;
    answers: string[];
    score: number;
    bingImagerySet: "CanvasDark" | "Aerial" | "AerialWithLabels";
}

export interface QuizletProps {
    quizletName: string;
    source: ol.source.Vector;
    featureNameFieldName: string;
    questionsPerQuiz: number;
}

export class QuizletComponent extends Component<QuizletProps, QuizletStates> {

    private dispatcher = new EventDispatcher<any>();

    constructor(props: QuizletProps) {
        super(props);

        let score = storage.force(props.quizletName).score;

        this.state = {
            center: [0, 0],
            zoom: 3,
            features: new ol.Collection<ol.Feature>(),
            answers: [],
            score: score,
            bingImagerySet: score > 1000 ? "Aerial" : "AerialWithLabels"
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

            let gameStorage = this.getStat();
            let correct = (v: { correct: number; incorrect: number; hint: number }) => v.correct - v.incorrect - v.hint;

            Object.keys(gameStorage.stats).forEach(k => counts[correct(gameStorage.stats[k])] = true);
            let values = Object.keys(counts).map(v => parseInt(v)).sort().reverse();

            let nextAnswers = args.answers;

            while (values.length && nextAnswers.length > this.props.questionsPerQuiz) {
                args.answers = nextAnswers;
                let maxCount = values.pop() || 0;
                console.log(`removing where count >= ${maxCount}`);
                nextAnswers = nextAnswers.filter(f => !gameStorage.stats[f] || (correct(gameStorage.stats[f]) < maxCount));
            }
            console.log(args.answers);

        });

        this.dispatcher.on("correct", (args: { feature: ol.Feature }) => {
            let answer = this.state.answer || "";
            if (!answer) return;

            console.log("correct");
            this.score(20);

            let gameStorage = this.getStat();
            if (gameStorage && gameStorage.stats) {
                gameStorage.stats[answer].correct++;
                gameStorage.score = this.state.score;
                storage.save();
            }

            let feature = args.feature;
            if (feature) {
                feature.setStyle(styles.correct(this));
                this.state.features.remove(feature);
                this.state.features.push(feature);

                if (!this.next()) {
                    setTimeout(() => {
                        let options = ["AerialWithLabels", "Aerial", "CanvasDark", "CanvasLight", "CanvasGray", "Road"];
                        this.setState(prev => ({
                            bingImagerySet: options[Math.floor(prev.score / 1000) % options.length],
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

        this.dispatcher.on("incorrect", (args: { feature: ol.Feature }) => {
            let answer = this.state.answer || "";
            if (!answer) return;

            console.log("incorrect");
            this.score(-20);

            let gameStorage = this.getStat();
            gameStorage.stats[answer].incorrect++;
            gameStorage.score = this.state.score;
            storage.save();

            let feature = args.feature;
            if (feature) {
                feature.setStyle(styles.incorrect(this));
                //this.zoomToFeature(feature);
                this.state.features.remove(feature);
                this.state.features.push(feature);
            }
        });

        this.dispatcher.on("hint", () => {
            let answer = this.state.answer || "";
            if (!answer) return;

            console.log("hint");

            let gameStorage = this.getStat();
            gameStorage.stats[answer].hint++;
            gameStorage.score = this.state.score;
            storage.save();

            let feature = this.find();
            if (!feature) return;

            this.score(-5);

            let center = ol.extent.getCenter(feature.getGeometry().getExtent());
            this.setState(prev => ({
                hint: (prev.hint || 0) + 1,
                mapTrigger: {
                    message: "extent",
                    args: {
                        extent: scaleExtent(this.props.source.getExtent(), 1 / ((prev.hint || 0) + 3), center)
                    }
                }
            }));
        });
    }

    private getStat() {
        let answer = this.state.answer || "";
        let key = this.props.quizletName || "";

        return storage.update(key, data => {
            let stat = data.stats[answer] = (data.stats[answer] || {
                correct: 0,
                incorrect: 0,
                hint: 0
            });
            return data;
        });
    }

    componentDidUpdate(prevProp: QuizletProps, prevState: QuizletStates) {
        this.dispatcher.trigger("update");
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
                bingImagerySet={this.state.bingImagerySet}
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
                        this.init();
                    }, 500));
                }}
                onFeatureClick={(args: {
                    layer: ol.layer.Vector,
                    feature: ol.Feature
                }) => {
                    if (!this.state.answer) {
                        this.init();
                    } else if (this.test(args.feature)) {
                        this.dispatcher.trigger("correct", { feature: args.feature });
                    } else {
                        this.dispatcher.trigger("incorrect", { feature: args.feature });
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
        if (answers.length > this.props.questionsPerQuiz) {
            answers = answers.splice(0, this.props.questionsPerQuiz);
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
