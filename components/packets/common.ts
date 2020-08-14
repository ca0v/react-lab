declare var requirejs;

import * as geom from "@ol/geom";
import * as extent from "@ol/extent";
import type { Polygon } from "@ol/geom";

type Continents = any;

const ol = {
  geom,
  extent,
};

import { BingImagerySet, OtherImagerySet } from "../openlayers";

export interface IGeoJsonFeature<T> {
  type: string;
  properties: T;
  geometry: {
    type: string;
    coordinates: any;
  };
}

export interface IPacket<T> {
  type: string;
  url: string | string[];
  name: string; // primaryFieldName
  style?: (score: number) => BingImagerySet | OtherImagerySet;
  weight?: (d: IGeoJsonFeature<T>) => number;
  filter?: (Promise<(d: IGeoJsonFeature<T>, score: number) => boolean>) | ((d: IGeoJsonFeature<T>, score: number) => boolean);
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

export async function filterByContinent(name: string) {
  let continents: Continents | null = null;

  return new Promise<(g: IGeoJsonFeature<any>) => boolean>(
    async (good, bad) => {
      const data = await fetch("./data/continents.json");
      continents = await data.json();
      let europe = continents.features.filter(
        (f) => f.properties.CONTINENT === name
      )[0];
      if (!europe) return bad("unknown continent");

      const continent: Polygon = asGeom(europe.geometry);
      const filter = (f: IGeoJsonFeature<any>) => {
        const country: Polygon = asGeom(f.geometry);
        const points = country.getFlatCoordinates();
        let count = 0;
        for (let i = 0; i < points.length; i += 2) {
          const [x, y] = [points[i], points[i + 1]];
          count += continent.containsXY(x, y) ? 1 : 0;
        }
        // at least half are within continent
        return count > points.length / 2 / 4;
      };

      good(filter);
    }
  );
}
