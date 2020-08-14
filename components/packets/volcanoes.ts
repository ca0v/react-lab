import volcanoesDir = require("../../data/volcanoes/dir");
import { shuffle } from "../../common/common";
import type { IPacket } from "./common";

let volcanoes = shuffle(volcanoesDir.split("\n").map(v => v.trim()).filter(v => !!v));

export = <IPacket<any>>{
    type: "geojson",
    url: `./data/volcanoes/${volcanoes.pop()}`,
    name: "Name",
    style: () => "Aerial",
};