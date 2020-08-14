import Feature from "@ol/Feature";
import Geometry from "@ol/geom/Geometry";
import { computeDistanceVector } from "./computeDistanceVector";
export function computeDistanceHint(
  f1: Feature<Geometry>,
  f2: Feature<Geometry>
) {
  const [dx, dy] = computeDistanceVector(f1, f2);
  const km = Math.round(Math.sqrt(dx * dx + dy * dy) / 1000);
  const length = Math.ceil(Math.log10(km));
  let answer = km;
  const sigDig = 2;
  if (length > sigDig) {
    const multi = Math.pow(10, length - sigDig);
    answer = Math.round(km / multi) * multi;
  }
  return `${answer} km`;
}
