import { getCenter, getHeight, getWidth } from "@ol/extent";
import { Extent } from "@ol/extent";

export function scaleExtent(
  fullExtent: Extent,
  scale = 1,
  center = getCenter(fullExtent)
) {
  let width =
    0.5 * Math.max(getWidth(fullExtent), getHeight(fullExtent)) * scale;
  return [
    center[0] - width,
    center[1] - width,
    center[0] + width,
    center[1] + width,
  ];
}
