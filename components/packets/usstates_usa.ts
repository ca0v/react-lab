export = {
    type: "geojson",
    url: "./data/us-states.json",
    name: "name",
    filter: (f: any, score: number) =>
        (score < 100 && 0 === f.properties.name.indexOf("A")) ||
        (score < 500 && (-1 === "AlaskaHawaiiPuerto Rico".indexOf(f.properties.name))),
    style: (score: number) =>
        (score < 500 && "AerialWithLabels") ||
        (score < 1000 && "EsriAerial") ||
        (score < 2000 && "Aerial") ||
        (score < 3000 && "Fast") ||
        (score < 4000 && "CanvasDark") ||
        "Black"
};