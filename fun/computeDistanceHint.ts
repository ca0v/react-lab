import Feature from "@ol/Feature";
import Geometry from "@ol/geom/Geometry";
import { computeDistanceVector } from "./computeDistanceVector";
export function computeDistanceHint(f1: Feature<Geometry>, f2: Feature<Geometry>) {
    const [dx, dy] = computeDistanceVector(f1, f2);
    const distance = Math.round(Math.sqrt(dx * dx + dy * dy) / 1000).toPrecision(3);
    return `${distance} km`;
}
