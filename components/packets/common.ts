import * as ol from "openlayers";
import continents = require("../../data/continents");

import { BingImagerySet, OtherImagerySet } from "../openlayers";

export interface IGeoJsonFeature<T> {
    type: string;
    properties: T;
    geometry: {
        type: string;
        coordinates: any;
    }
}

export interface IPacket<T> {
    type: string;
    url: string;
    name: string; // primaryFieldName
    style?: (score: number) => BingImagerySet | OtherImagerySet;
    weight?: (d: IGeoJsonFeature<T>) => number;
    filter?: (d: IGeoJsonFeature<T>, score: number) => boolean;
    score?: number;
}

export interface IGeoJson<T> {
    type: "FeatureCollection";
    features: Array<IGeoJsonFeature<T>>;
}

function asGeom(geometry: { type: string; coordinates: any }) {
    let hack: any = ol.geom;
    let geom = new hack[geometry.type](geometry.coordinates, "XY");
    return geom;
}

export function filterByContinent(name: string) {
    let europe = continents.features.filter(f => f.properties.CONTINENT === name)[0];
    if (!europe) return null;
    let geom: ol.geom.Polygon = asGeom(europe.geometry);
    let bbox = geom.getExtent();
    return (f: IGeoJsonFeature<any>) => {
        let countryGeom: ol.geom.Polygon = asGeom(f.geometry);
        let country = countryGeom.getExtent();
        return ol.extent.intersects(bbox, country) && geom.intersectsExtent(country);
    };
}

