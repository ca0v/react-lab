export = {
    type: "geojson",
    url: "./data/continents.json",
    name: "CONTINENT",
    style: (score: number) => ["Black", "CanvasDark"][Math.floor(score / 100) % 2],
};