import { filterByContinent } from "./common";

export = {
    title:"Asian Countries",
    type: "geojson",
    url: "./data/countries.json",
    name: "name",
    filter: filterByContinent("Asia")
};