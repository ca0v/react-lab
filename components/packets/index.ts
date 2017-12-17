import { IPacket } from "./common";
import {  Dictionary, shuffle } from "../../common/common";

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
        filter: (f,score) => -1 < ["Vermont", "New Hampshire", "Maine", "Massachusetts", "Rhode Island", "Connecticut"].indexOf(f.properties[usaStatesPacket.name]),
    },
    "US South East": {
        type: "geojson",
        url: usaStatesPacket.url,
        name: usaStatesPacket.name,
        filter: (f,score) => -1 < ["North Carlina", "South Carolina", "Georgia", "Florida", "Alabama", "Tennessee", "Kentucky"].indexOf(f.properties[usaStatesPacket.name]),
    },
    "US Western States": {
        type: "geojson",
        url: usaStatesPacket.url,
        name: usaStatesPacket.name,
        filter: (f,score) => -1 < ["California", "Oregon", "Washington", "Nevada", "Idaho", "Montana", "Wyoming", "Utah", "Arizona"].indexOf(f.properties[usaStatesPacket.name]),
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
    "Greenville Active Calls (HTTP only)": {
        type: "agsjson",
        url: "http://www.gcgis.org/arcgis/rest/services/GreenvilleJS/Map_Layers_JS/MapServer/1/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=4326&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&returnTrueCurves=false&resultOffset=&resultRecordCount=&f=json",
        name: "ITI_TypeText",
        style: () => "CanvasDark",
    },
    "Greenville Parks": {
        type: "agsjson",
        url: "./data/gsp-parks.json",
        name: "NAME",
        style: () => "CanvasDark",
    },
}

export = packets;