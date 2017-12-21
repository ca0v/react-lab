import parksDir = require("../../data/national_parks/dir");
import { shuffle } from "../../common/common";

let parks = shuffle(parksDir.split("\n").map(v => v.trim()).filter(v => !!v));//.map(v => v.substring(0, v.length - 4) + "simple.json");

export = {
    type: "multigeojson",
    url: parks.map(p => `./data/national_parks/${p}`),
    name: "UNIT_NAME",
    filter: (feature: { properties: { UNIT_TYPE: string } }, score: number) => {
        return feature.properties.UNIT_TYPE === "National Park";
    }
};