import Feature from "@ol/Feature";
import Geometry from "@ol/geom/Geometry";
import { computeDistanceVector } from "./computeDistanceVector";

export function computeDirectionHint(
  f1: Feature<Geometry>,
  f2: Feature<Geometry>
) {
  const [dx, dy] = computeDistanceVector(f1, f2);
  const direction =
    (360 + Math.round((180 / Math.PI) * Math.atan2(dy, dx))) % 360;
  const quadrant = Math.round(direction / 22.5);
  switch (quadrant) {
    case 16:
    case 0:
      return "east";
    case 1:
    case 3:
    case 2:
      return "north-east";
    case 4:
      return "north";
    case 5:
    case 7:
    case 6:
      return "north-west";
    case 8:
      return "west";
    case 9:
    case 11:
    case 10:
      return "south-west";
    case 12:
      return "south";
    case 13:
    case 15:
    case 14:
      return "south-east";
    default:
      return "some place else";
  }
}
