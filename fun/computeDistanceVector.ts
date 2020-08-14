import { getCenter } from "@ol/extent";
import Feature from "@ol/Feature";
import Geometry from "@ol/geom/Geometry";

export function computeDistanceVector(
  f1: Feature<Geometry>,
  f2: Feature<Geometry>
) {
  const p1 = getCenter(f1.getGeometry().getExtent());
  const p2 = getCenter(f2.getGeometry().getExtent());
  return [p1[0] - p2[0], p1[1] - p2[1]];
}
