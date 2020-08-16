// import Projection from "@ol/proj/Projection";
import VectorTileSource from "@ol/source/VectorTile";
// import MVT from "@ol/format/MVT";
import { assert } from "chai";

export class PbfLab {

    async run() {
        const response = await fetch('https://basemaps.arcgis.com/v1/arcgis/rest/services/World_Basemap/VectorTileServer/tile/0/0/0.pbf');
        const data = await response.arrayBuffer();
        assert.isTrue(!!data);
        console.log(data);
        const reader = new VectorTileSource({});
        reader.loading
    }
}
