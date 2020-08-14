import { Dictionary } from "../common/common";
import { IPacket } from "../components/packets/common";
import { Loader as JsonLoader } from "../components/packets/loaders/agsjsonloader";
import { Loader as GeoJsonLoader } from "../components/packets/loaders/geojsonloader";
import Vector from "@ol/source/Vector";
import Geometry from "@ol/geom/Geometry";
import Feature from "@ol/Feature";
import Polygon from "@ol/geom/Polygon";
import Point from "@ol/geom/Point";
import * as olGeom from "@ol/geom";

export function populateLayerSource(
  source: Vector<Geometry>,
  packet: IPacket<any>
) {
  switch (packet.type) {
    case "agsjson": {
      let loader = new JsonLoader();
      if (Array.isArray(packet.url)) throw "expecting a single url";
      loader.load(packet.url, (agsjson) => {
        let typeMap: Dictionary<"Polygon" | "Point"> = {
          esriGeometryPolygon: "Polygon",
          esriGeometryPoint: "Point",
        };
        let geoType = typeMap[agsjson.geometryType];
        let features = agsjson.features.map((f) => {
          let feature = new Feature();
          {
            let geom: any;
            switch (geoType) {
              case "Point":
                geom = new Point([f.geometry.x, f.geometry.y], "XY");
                break;
              case "Polygon":
                geom = new Polygon(f.geometry.rings, "XY");
                break;
            }
            geom.transform("EPSG:4326", "EPSG:3857");
            feature.setGeometry(geom);
          }
          feature.setProperties(f.attributes);
          return feature;
        });
        source.addFeatures(features);
      });
      break;
    }
    case "multigeojson":
    case "geojson": {
      let loader = new GeoJsonLoader<any>();
      loader.load(packet, (geojson) => {
        let features = geojson.features.map((f) => {
          let feature = new Feature();
          {
            const hack: any = olGeom;
            const geom = new hack[f.geometry.type](
              f.geometry.coordinates,
              "XY"
            );
            geom.transform("EPSG:4326", "EPSG:3857");
            feature.setGeometry(geom);
          }
          feature.setProperties(f.properties);
          return feature;
        });
        source.addFeatures(features);
      });
      break;
    }
  }
}
