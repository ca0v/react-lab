import { IPacket } from "./common";
import {  Dictionary } from "../../common/common";

import continentPacket = require("./continents_world");
import europeanCountriesPacket = require("./countries_europe");
import africaCountriesPacket = require("./countries_africa");
import southAmericaCountriesPacket = require("./countries_southamerica");
import worldCountriesPacket = require("./countries_world");
import worldCitiesPacket = require("./cities_world");
import usaGreatLakesPacket = require("./lakes_usa");
import usaStatesPacket = require("./usstates_usa");
import usaCitiesPacket = require("./cities_usa");



const packets: Dictionary<IPacket<any>> = {
    "Continents": continentPacket,
    "European Countries": europeanCountriesPacket,
    "African Countries": africaCountriesPacket,
    "South American Countries": southAmericaCountriesPacket,
    "World Countries": worldCountriesPacket,
    "World Cities": worldCitiesPacket,
    "US Great Lakes": usaGreatLakesPacket,
    "US States": usaStatesPacket,
    "US Cities": usaCitiesPacket,
    "Greenville Active Calls": {
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