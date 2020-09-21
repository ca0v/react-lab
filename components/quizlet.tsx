import { player } from "../common/player";
import { GoodJobAssets } from "./AudioAsset";
/**
 * Turns a vector layer into a geography quiz.
 * User is asked to click a feature.
 * If user clicks wrong feature, "incorrect" event is raised
 * If user clicks correct feature, "correct" event is raised
 */
import { OpenLayers, BingImagerySet, OtherImagerySet } from "./openlayers";
import { PureComponent as Component, createElement as create } from "react";
import { debounce, EventDispatcher, shuffle } from "../common/common";
import { styles } from "../common/quizlet-styles";
import { storage } from "../common/storage";
import { explode } from "../effects/explode";
import { AudioMedia } from "../effects/kaplunk";
import { getCenter } from "@ol/extent";
import type Feature from "@ol/Feature";
import type Geometry from "@ol/geom/Geometry";
import type Vector from "@ol/layer/Vector";
import type VectorSource from "@ol/source/Vector";
import Collection from "@ol/Collection";
import type { Coordinate } from "@ol/coordinate";
import type Map from "@ol/Map";
import { computeDistanceHint } from "../fun/computeDistanceHint";
import { computeDirectionHint } from "../fun/computeDirectionHint";
import { scaleExtent } from "../fun/scaleExtent";

interface QuizletStates {
  answer?: string;
  center: [number, number];
  zoom: number;
  features: Collection<Feature<Geometry>>;
  mapTrigger?: { message: string; args: any[] };
  hint?: number;
  answers: string[];
  score: number;
  bingImagerySet: BingImagerySet | OtherImagerySet;
}

interface QuizletProps {
  quizletName: string;
  source: VectorSource<Geometry>;
  featureNameFieldName: string;
  questionsPerQuiz: number;
  getLayerStyle: (score: number) => BingImagerySet | OtherImagerySet;
}

export class QuizletComponent extends Component<QuizletProps, QuizletStates> {
  private dispatcher = new EventDispatcher<any>();

  constructor(props: QuizletProps) {
    super(props);

    {
      let score = storage.force(props.quizletName).score;

      this.state = {
        center: [0, 0],
        zoom: 3,
        features: new Collection<Feature<Geometry>>(),
        answers: [],
        score: score,
        bingImagerySet:
          (props.getLayerStyle && props.getLayerStyle(score)) ||
          (score > 1000 ? "Aerial" : "AerialWithLabels"),
      };
    }

    document.addEventListener("keypress", (args) => {
      switch (args.key.toUpperCase()) {
        case "H":
          this.dispatcher.trigger("hint");
          break;
        case "S":
          this.dispatcher.trigger("skip");
          break;
      }
    });

    this.dispatcher.on("adjust-answers", (args: { answers: string[] }) => {
      // remove most correct answers until less than questionsPerQuiz remain
      let counts: any = {};

      let gameStorage = this.getStat();
      let correct = (v: { correct: number; incorrect: number; hint: number }) =>
        v.correct - v.incorrect - v.hint;

      Object.keys(gameStorage.stats).forEach(
        (k) => (counts[correct(gameStorage.stats[k])] = true)
      );
      let values = Object.keys(counts)
        .map((v) => parseInt(v))
        .sort()
        .reverse();

      let nextAnswers = args.answers;

      while (
        values.length &&
        nextAnswers.length > this.props.questionsPerQuiz
      ) {
        args.answers = nextAnswers;
        let maxCount = values.pop() || 0;
        console.log(`removing where count >= ${maxCount}`);
        nextAnswers = nextAnswers.filter(
          (f) =>
            !gameStorage.stats[f] || correct(gameStorage.stats[f]) < maxCount
        );
      }
      console.log(args.answers);
    });

    this.dispatcher.on(
      "correct",
      async (args: { feature: Feature<Geometry> }) => {
        let answer = this.state.answer || "";
        if (!answer) return;

        let score = this.score(20);

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

          let options = [
            "AerialWithLabels",
            "Aerial",
            "CanvasDark",
            "CanvasLight",
            "CanvasGray",
            "Road",
          ];
          let bingImagerySet =
            (props.getLayerStyle && props.getLayerStyle(score)) ||
            options[Math.floor(this.state.score / 1000) % options.length];
          this.setState(
            () =>
              ({
                bingImagerySet: bingImagerySet,
              } as any)
          );

          if (!this.next()) {
            await GoodJobAssets.playAnyTrack();

            setTimeout(() => {
              this.setState(
                () =>
                  ({
                    mapTrigger: {
                      message: "extent",
                      args: {
                        extent: scaleExtent(this.props.source.getExtent()),
                      },
                    },
                  } as any)
              );
              this.init();
            }, 1000);
          }
        }
      }
    );

    this.dispatcher.on("incorrect", (args: { feature: Feature<Geometry> }) => {
      let answer = this.state.answer || "";
      if (!answer) return;

      console.log("incorrect");
      this.score(-20);

      // new AudioMedia({
      //     source: "data/sound/Bomb-SoundBible.com-891110113.mp3",
      // }).play(0);

      const distanceHint = computeDistanceHint(this.find(), args.feature);
      const directionHint = computeDirectionHint(this.find(), args.feature);
      this.dispatcher.trigger("play", {
        en: `That is ${this.getFeatureName(
          args.feature
        )}, you are looking for ${answer} which is ${distanceHint} away.  Look ${directionHint}.`,
      });

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

    this.dispatcher.on("skip", () => this.skip());

    this.dispatcher.on("hint", () => {
      let answer = this.state.answer || "";
      if (!answer) return;

      this.dispatcher.trigger("play", { en: answer });

      let gameStorage = this.getStat();
      gameStorage.stats[answer].hint++;
      gameStorage.score = this.state.score;
      storage.save();

      let feature = this.find();
      if (!feature) return;

      this.score(-5);

      let center = getCenter(feature.getGeometry().getExtent());
      this.setState(
        (prev) =>
          ({
            hint: (prev.hint || 0) + 1,
            mapTrigger: {
              message: "extent",
              args: {
                extent: scaleExtent(
                  this.props.source.getExtent(),
                  1 / ((prev.hint || 0) + 3),
                  center
                ),
              },
            },
          } as any)
      );
    });

    this.dispatcher.on("reload", () => location.reload());

    this.dispatcher.on("play", (args) => player.play(args));

    this.dispatcher.on("update", () => {});
  }

  private getStat() {
    let answer = this.state.answer || "";
    let key = this.props.quizletName || "";

    return storage.update(key, (data) => {
      let stat = (data.stats[answer] = data.stats[answer] || {
        correct: 0,
        incorrect: 0,
        hint: 0,
      });
      return data;
    });
  }

  componentDidUpdate(prevProp: QuizletProps, prevState: QuizletStates) {
    this.dispatcher.trigger("update");
    if (prevState.answer !== this.state.answer) {
      this.panAnswerIntoView();
      this.dispatcher.trigger("play", { en: this.state.answer });
    }
  }
  panAnswerIntoView() {
    const feature = this.find();
    if (!feature) return;

    const extent = feature.getGeometry().getExtent();
    const panToExtent = scaleExtent(extent, 8);

    this.setState(
      (prev) =>
        ({
          mapTrigger: {
            message: "ensure-extent-visible",
            args: {
              extent: extent,
            },
          },
        } as any)
    );
  }

  componentDidMount() {}

  render() {
    return (
      <div className="quizlet">
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
            source: [this.props.source],
          }}
          setCenter={(center, zoom) => {
            this.setState(() => ({
              center: center,
              zoom: zoom,
            }));
          }}
          onLayerAdd={(args: { layer: Vector }) => {
            let source = args.layer.getSource();
            source.once(
              "addfeature",
              debounce(() => {
                let extent = source.getExtent();
                this.setState(
                  (prev) =>
                    ({
                      mapTrigger: {
                        message: "extent",
                        args: {
                          extent: scaleExtent(extent),
                        },
                      },
                    } as any)
                );
                this.init();
              }, 500)
            );
          }}
          onFeatureClick={(args: {
            layer: Vector;
            feature: Feature<Geometry>;
            coordinate: Coordinate;
          }) => {
            if (!this.state.answer) {
              this.init();
            } else if (this.test(args.feature)) {
              this.dispatcher.trigger("correct", { feature: args.feature });
            } else {
              this.dispatcher.trigger("incorrect", { feature: args.feature });
              explode(args.layer, args.coordinate);
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
            onClick={(args: { coordinate: Coordinate; map: Map }) => {
              this.setState(
                (prev) =>
                  ({
                    center: args.coordinate,
                    zoom: Math.max(prev.zoom, 5 + args.map.getView().getZoom()),
                  } as any)
              );
            }}
            layers={{ geoJson: ["./data/countries.json"] }}
            features={this.state.features}
          ></OpenLayers>
        </OpenLayers>
        <div className="score">
          Score<label>{this.state.score}</label>
        </div>
        <div className="score">
          Find<label>{this.state.answer}</label>
        </div>
        {!!this.state.answers.length && (
          <div className="score">
            Remaining<label>{1 + this.state.answers.length || "?"}</label>
          </div>
        )}
        <br />{" "}
        <div className="score">
          <button onClick={() => this.dispatcher.trigger("skip")}>Skip</button>
          <button onClick={() => this.dispatcher.trigger("hint")}>Hint</button>
          <button onClick={() => this.dispatcher.trigger("reload")}>🗙</button>
        </div>
      </div>
    );
  }

  skip() {
    if (!this.state.answer) return;
    this.score(-1);
    let answers = this.state.answers;
    answers && answers.length && answers.unshift(this.state.answer);
    this.next();
  }

  score(value: number) {
    this.setState((prev) => ({
      score: prev.score + value,
    }));
    return this.state.score;
  }

  generate(features: Feature<Geometry>[]) {
    let fieldName = this.props.featureNameFieldName;
    let answers = features.map((f) => f.get(fieldName));
    {
      let byref = { answers: answers };
      this.dispatcher.trigger("adjust-answers", byref);
      answers = byref.answers;
    }
    shuffle(answers);
    if (answers.length > this.props.questionsPerQuiz) {
      answers = answers.splice(0, this.props.questionsPerQuiz);
    }
    return answers;
  }

  init() {
    let source = this.props.source;
    let features = source.getFeatures();
    features.forEach((f) => f.setStyle(styles.indeterminate(this)));
    let answers = this.generate(features);
    let answer = answers.pop();
    this.state.features.clear();
    this.setState((prev) => ({
      answer: answer,
      answers: answers,
    }));
  }

  // return true if the feature matches the correct answer
  test(feature: Feature<Geometry>) {
    return this.getFeatureName(feature) === this.state.answer;
  }

  // return true if the feature matches the correct answer
  private getFeatureName(feature: Feature<Geometry>) {
    return feature.get(this.props.featureNameFieldName);
  }

  zoomToFeature(feature: Feature<Geometry>, grow = 2) {
    this.setState(
      (prev) =>
        ({
          mapTrigger: {
            message: "extent",
            args: {
              extent: scaleExtent(feature.getGeometry().getExtent(), grow),
            },
          },
        } as any)
    );
  }

  next() {
    let answers = this.state.answers;
    if (!answers.length) return false;
    this.setState((prev) => ({
      answer: answers.pop(),
      hint: 0,
    }));
    return true;
  }

  find() {
    let source = this.props.source;
    if (!source) return;
    let exclude = this.state.features.getArray();
    let features = source
      .getFeatures()
      .filter(
        (f) =>
          f.get(this.props.featureNameFieldName) === this.state.answer &&
          -1 === exclude.indexOf(f)
      );
    if (features && features.length >= 1) {
      let feature = features[0];
      return feature;
    }
    return null;
  }
}
