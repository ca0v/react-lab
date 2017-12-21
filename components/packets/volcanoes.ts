import volcanoesDir = require("../../data/volcanoes/dir");
import { shuffle } from "../../common/common";

let volcanoes = shuffle(volcanoesDir.split("\n").map(v => v.trim()).filter(v => !!v));

export = {
    type: "geojson",
    url: `./data/volcanoes/${volcanoes.pop()}`,
    name: "Name",
    style: () => "Aerial",
};