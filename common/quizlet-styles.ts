import { Dictionary } from "../common/common";
import type { StyleFunction } from "@ol/style/Style";
import Style  from "@ol/style/Style";
import Fill from "@ol/style/Fill";
import Stroke from "@ol/style/Stroke";
import Circle from "@ol/style/Circle";
import Text from "@ol/style/Text";
import type olFeature from "@ol/Feature";
import RenderFeature from "@ol/render/Feature";
import { Geometry } from "@ol/geom";

type Feature = olFeature<Geometry>;

const ol = {
  style: { Circle, Style, Fill, Stroke, Text },
};

function color(color: any) {
  let result: [number, number, number, number] = color;
  return result;
}

const theme = {
  reddotColor: [200, 100, 20, 1],
  textFillColor: [200, 200, 200, 1],
  pointFillColor: [200, 100, 20, 1],
  pointBorderColor: [200, 200, 200, 1],
  textBorderColor: [200, 100, 20, 1],
  correctFillColor: [20, 100, 20, 0.3],
  correctBorderColor: [20, 100, 20, 0.5],
  incorrectFillColor: [200, 20, 20, 0.3],
  incorrectBorderColor: [200, 20, 20, 1],
  borderColor: [200, 100, 20, 1],
  hintBorderColor: [200, 20, 200, 1],
  noColor: [0, 0, 0, 0],
  black: [0, 0, 0, 1],
  translucentBlack: [0, 0, 0, 0.3],
  textScale: 1.8,
  textWidth: 2,
  borderWidth: 2,
  textOffset: 24,
};

/**
 * Styles for the various question states and geometries...any react goodies we can use here?
 */
export let styles: Dictionary<(quizlet: {
  props: {
    featureNameFieldName?: string;
  };
  state: {
    hint?: number;
    answer?: string;
  };
}) => StyleFunction> = {};

styles.correct = (quizlet) => (
  feature: Feature | RenderFeature,
  res: number
) => {
  if (!quizlet.props.featureNameFieldName) return new ol.style.Style();
  return [
    new ol.style.Style({
      fill: new ol.style.Fill({
        color: color(theme.correctFillColor),
      }),
      stroke: new ol.style.Stroke({
        color: color(theme.correctBorderColor),
        width: theme.borderWidth,
      }),
    }),
    new ol.style.Style({
      text: new ol.style.Text({
        text: `${feature.get(quizlet.props.featureNameFieldName)}`,
        scale: theme.textScale,
        fill: new ol.style.Fill({
          color: color(theme.textFillColor),
        }),
        stroke: new ol.style.Stroke({
          color: color(theme.correctBorderColor),
          width: theme.textWidth,
        }),
      }),
    }),
  ];
};

styles.incorrect = (quizlet) => (
  feature: Feature | RenderFeature,
  res: number
) => {
  if (!quizlet.props.featureNameFieldName) return new ol.style.Style();

  let featureName = feature.get(quizlet.props.featureNameFieldName);

  switch (feature.getGeometry().getType()) {
    case "Point":
      return new ol.style.Style({
        image: new ol.style.Circle({
          radius: 10,
          stroke: new ol.style.Stroke({
            color: color(theme.incorrectBorderColor),
            width: theme.borderWidth,
          }),
          fill: new ol.style.Fill({
            color: color(theme.incorrectFillColor),
          }),
        }),
        text: new ol.style.Text({
          text: featureName,
          scale: theme.textScale,
          offsetY: theme.textOffset,
          stroke: new ol.style.Stroke({
            color: color(theme.incorrectBorderColor),
            width: theme.textWidth,
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
            color: color(theme.translucentBlack),
          }),
          stroke: new ol.style.Stroke({
            color: color(theme.incorrectBorderColor),
            width: theme.borderWidth,
          }),
        }),
        new ol.style.Style({
          text: 1
            ? undefined
            : new ol.style.Text({
                text: feature.get(quizlet.props.featureNameFieldName),
                scale: theme.textScale,
                fill: new ol.style.Fill({
                  color: color(theme.textFillColor),
                }),
                stroke: new ol.style.Stroke({
                  color: color(theme.incorrectBorderColor),
                  width: theme.textWidth,
                }),
              }),
        }),
      ];
  }
};

styles.indeterminate = (quizlet) => (
  feature: Feature | RenderFeature,
  res: number
) => {
  if (!quizlet.props.featureNameFieldName) return new ol.style.Style();

  let featureName = feature.get(quizlet.props.featureNameFieldName);

  let hint = quizlet.state.hint || 0;
  let isCurrentFeature = quizlet.state.answer === featureName;
  let showOutline = 1 < hint && isCurrentFeature;
  let weight = feature.get("weight") || 1;
  let borderSize = Math.round(weight * 5);
  let radius = 8;
  if (isCurrentFeature && hint) radius += 1 * hint;

  switch (feature.getGeometry().getType()) {
    case "Point":
      return new ol.style.Style({
        image: new ol.style.Circle({
          radius: radius,
          stroke: new ol.style.Stroke({
            color: color(theme.pointBorderColor),
            width: theme.borderWidth + Math.min(1, hint) * borderSize,
          }),
          fill: new ol.style.Fill({
            color: color(theme.pointFillColor),
          }),
        }),
        text:
          1 > hint && res > 50
            ? undefined
            : new ol.style.Text({
                text: featureName,
                scale: theme.textScale,
                offsetY: theme.textOffset,
                stroke: new ol.style.Stroke({
                  color: color(theme.textBorderColor),
                  width: theme.textWidth,
                }),
                fill: new ol.style.Fill({
                  color: color(theme.textFillColor),
                }),
              }),
      });

    default:
      return new ol.style.Style({
        text:
          1 > hint
            ? undefined
            : new ol.style.Text({
                text: featureName,
                scale: theme.textScale,
                stroke: new ol.style.Stroke({
                  color: color(theme.textBorderColor),
                  width: 1 + borderSize,
                }),
                fill: new ol.style.Fill({
                  color: color(theme.textFillColor),
                }),
              }),
        stroke: new ol.style.Stroke({
          color: color(showOutline ? theme.hintBorderColor : theme.borderColor),
          width: 2 + (isCurrentFeature ? Math.max(0, hint) : 0),
        }),
        fill:new ol.style.Fill({
          color: (isCurrentFeature && hint) ? color(theme.hintBorderColor) : color(theme.black),
        }),
      });
  }
};
