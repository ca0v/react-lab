import { filterByContinent } from "./common";

export = {
    type: "geojson",
    url: "./data/countries.json",
    name: "name",
    filter: filterByContinent("South America")
};