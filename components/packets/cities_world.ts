import type { IPacket } from "./common";

export = <IPacket<any>>{
    type: "geojson",
    url: "./data/cities.json",
    name: "city",
    weight: (f: any) => f.properties.population / 50000000,
    filter: (f: any) => f.properties.population > 10000000,
};