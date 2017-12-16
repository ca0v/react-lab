import { Dictionary } from "../common/common";
import * as ol from "openlayers";

function color(color: any) {
    let result: [number, number, number, number] = color;
    return result;
}

const theme = {
    reddotColor: [200, 100, 20, 1],
    textFillColor: [200, 200, 200, 1],
    pointFillColor: [200, 100, 20, 0.5],
    pointBorderColor: [200, 200, 200, 1],
    textBorderColor: [200, 100, 20, 1],
    correctFillColor: [20, 100, 20, 0.3],
    correctBorderColor: [20, 100, 20, 1],
    incorrectFillColor: [200, 20, 20, 0.3],
    incorrectBorderColor: [200, 20, 20, 1],
    borderColor: [200, 100, 20, 1],
    hintBorderColor: [200, 20, 200, 1],
    noColor: [0, 0, 0, 0],
};

/**
 * Styles for the various question states and geometries...any react goodies we can use here?
 */
export let styles: Dictionary<(quizlet: {
    props: {
        featureNameFieldName?: string;
    },
    state: {
        hint?: number;
        answer?: string;
    }
}) => ol.StyleFunction> = {};

styles.correct = quizlet => (feature: ol.Feature | ol.render.Feature, res: number) => {
    if (!quizlet.props.featureNameFieldName) return new ol.style.Style();
    return [
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
    ];
};

styles.incorrect = quizlet => (feature: ol.Feature | ol.render.Feature, res: number) => {

    if (!quizlet.props.featureNameFieldName) return new ol.style.Style();

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
                    text: featureName,
                    scale: 1.5,
                    offsetY: 16,
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
};

styles.indeterminate = quizlet => (feature: ol.Feature | ol.render.Feature, res: number) => {
    if (!quizlet.props.featureNameFieldName) return new ol.style.Style();

    let featureName = feature.get(quizlet.props.featureNameFieldName);

    let hint = quizlet.state.hint || 0;
    let showText = 1 < hint;
    let isCurrentFeature = (quizlet.state.answer === featureName);
    let showOutline = (1 < hint) && isCurrentFeature;
    let weight = feature.get("weight") || 1;
    let borderSize = Math.round(weight * 5);
    let radius = 5;
    if (isCurrentFeature && hint) radius += 1 * hint;

    switch (feature.getGeometry().getType()) {
        case "Point":
            return new ol.style.Style({
                image: new ol.style.Circle({
                    radius: radius,
                    stroke: new ol.style.Stroke({
                        color: color(theme.pointBorderColor),
                        width: 1 + borderSize
                    }),
                    fill: new ol.style.Fill({
                        color: color(theme.pointFillColor),
                    }),
                }),
                text: (!hint && res > 50) ? undefined : new ol.style.Text({
                    text: featureName,
                    scale: 1.5,
                    offsetY: 16,
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
};

