export = {
    type: "geojson",
    url: "./data/us-cities.json",
    name: "name",
    weight: (f: any) => (f.properties.pop / 8405837),
    filter: (f: any, score: number) => f.properties.pop > 400000 - score * 10,
    style: (score: number) => score < 1000 ? "AerialWithLabels" : "Aerial"
};