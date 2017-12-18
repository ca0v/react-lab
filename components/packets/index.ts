declare var globals: any;

import { IPacket } from "./common";
import { Dictionary, shuffle } from "../../common/common";

import continentPacket = require("./continents_world");
import europeanCountriesPacket = require("./countries_europe");
import africaCountriesPacket = require("./countries_africa");
import southAmericaCountriesPacket = require("./countries_southamerica");
import worldCountriesPacket = require("./countries_world");
import worldCitiesPacket = require("./cities_world");
import usaGreatLakesPacket = require("./lakes_usa");
import usaStatesPacket = require("./usstates_usa");
import usaCitiesPacket = require("./cities_usa");
import volcanoesDir = require("../../data/volcanoes/dir");

let volcanoes = shuffle(volcanoesDir.split("\n").map(v => v.trim()).filter(v => !!v));

const packets: Dictionary<IPacket<any>> = {
    "Continents": continentPacket,
    "European Countries": europeanCountriesPacket,
    "African Countries": africaCountriesPacket,
    "South American Countries": southAmericaCountriesPacket,
    "World Countries": worldCountriesPacket,
    "World Cities": worldCitiesPacket,
    "US Great Lakes": usaGreatLakesPacket,
    "US States": usaStatesPacket,
    "US North East": {
        type: "geojson",
        url: usaStatesPacket.url,
        name: usaStatesPacket.name,
        filter: (f, score) => f.properties.region === "NE",
        style: usaStatesPacket.style,
    },
    "US South East": {
        type: "geojson",
        url: usaStatesPacket.url,
        name: usaStatesPacket.name,
        filter: (f, score) => f.properties.region === "SE",
        style: usaStatesPacket.style,
    },
    "US Mid-Western States": {
        type: "geojson",
        url: usaStatesPacket.url,
        name: usaStatesPacket.name,
        filter: (f, score) => f.properties.region === "MW",
        style: usaStatesPacket.style,
    },
    "US North West States": {
        type: "geojson",
        url: usaStatesPacket.url,
        name: usaStatesPacket.name,
        filter: (f, score) => f.properties.region === "NW",
        style: usaStatesPacket.style,
    },
    "US South West States": {
        type: "geojson",
        url: usaStatesPacket.url,
        name: usaStatesPacket.name,
        filter: (f, score) => f.properties.region === "SW",
        style: usaStatesPacket.style,
    },
    "US Western States": {
        type: "geojson",
        url: usaStatesPacket.url,
        name: usaStatesPacket.name,
        filter: (f, score) => f.properties.region === "W",
        style: usaStatesPacket.style,
    },
    "US Cities": usaCitiesPacket,
    "Volcanoes": {
        type: "geojson",
        url: `./data/volcanoes/${volcanoes.pop()}`,
        name: "Name",
        style: () => "Aerial",
    },
    "Holy Sites": {
        type: "geojson",
        url: "./data/holysites.json",
        name: "name",
        style: () => "EsriAerial",
    },
    "Greenville Parks": {
        type: "agsjson",
        url: "./data/gsp-parks.json",
        name: "NAME",
        style: () => "CanvasDark",
    },
};

if (globals.debug) {
    packets["Greenville Active Calls (HTTP only)"] = {
        type: "agsjson",
        url: "http://www.gcgis.org/arcgis/rest/services/GreenvilleJS/Map_Layers_JS/MapServer/1/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=4326&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&returnTrueCurves=false&resultOffset=&resultRecordCount=&f=json",
        name: "ITI_TypeText",
        style: () => "CanvasDark",
    };
}

export = packets;