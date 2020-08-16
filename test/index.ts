import Feature from "@ol/Feature";
import { Point } from "@ol/geom";
import { computeDistanceVector } from "../fun/computeDistanceVector";
import { assert } from "chai";
import {PbfLab} from "./pbfTest";

describe("describe", () => {
  it("computeDistanceVector", () => {
    const f1 = new Feature(new Point([0, 0]));
    const f2 = new Feature(new Point([0, 1]));
    const result = computeDistanceVector(f1, f2);
    assert.equal(0, result[0], "x offset");
    assert.equal(-1, result[1], "y offset");
  });

  it("pbf", () => {
    const lab =new PbfLab();
    lab.run();
  });
  
});
