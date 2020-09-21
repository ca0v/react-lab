import Feature from "@ol/Feature";
import { Point } from "@ol/geom";
import { computeDistanceVector } from "../fun/computeDistanceVector";
import { assert } from "chai";
import { PbfLab } from "./pbfTest";
import { AudioAsset } from "../components/AudioAsset";

export async function slowloop<T>(
  functions: Array<() => T>,
  interval = 1000,
  cycles = 1,
  progress?: (data: { index: number; cycle: number }) => void
) {
  let index = 0;
  let cycle = 0;
  const results: Array<T> = [];

  return new Promise<Array<T>>((good, bad) => {
    if (!functions || 0 >= cycles) {
      good();
    }

    const h = setInterval(() => {
      if (index === functions.length) {
        index = 0;
        if (++cycle === cycles) {
          good(results);
          clearInterval(h);
          return;
        }
      }
      try {
        progress && progress({ index, cycle });
        results[index] = functions[index]();
        index++;
      } catch (ex) {
        clearInterval(h);
        bad(ex);
      }
    }, interval);
  });
}

describe("describe", () => {
  it("computeDistanceVector", () => {
    const f1 = new Feature(new Point([0, 0]));
    const f2 = new Feature(new Point([0, 1]));
    const result = computeDistanceVector(f1, f2);
    assert.equal(0, result[0], "x offset");
    assert.equal(-1, result[1], "y offset");
  });

  it("pbf", () => {
    const lab = new PbfLab();
    lab.run();
  });

  it("audio splits recorder", async () => {
    // open mp3 file in assets
    const audio = document.createElement("audio");
    audio.src = "../assets/familygamesoundsofencouragement.mp3";
    document.body.append(audio);
    await audio.play();
    audio.playbackRate = 0.5;
    const keyframes: number[] = [];
    window.addEventListener("keydown", (e) => {
      switch (e.code) {
        case "Space":
          audio.paused ? audio.play() :
            audio.pause();
      }
      keyframes.push(audio.currentTime);
      console.log(keyframes);
    });

    return;
    const indexes = [1.641965, 3.24797, 5.02473, 7.161817];
    slowloop(indexes.map(v => () => {
      audio.fastSeek(v);
      audio.play();
    }, 2000));

  });

  it("audio splits playback", async () => {
    const keystates = [0, 1.858482, 3.361143, 4.923747, 7.064392, 10.123734, 11.810846, 14.969253, 17.200211, 19.633819, 21.609585, 23.702719, 26.342752].map(i => i * 1000);
    const asset = new AudioAsset({
      src: "../assets/familygamesoundsofencouragement.mp3"
      , frames: keystates
    });

    // open mp3 file in assets
    await asset.playTrack(3);
    await asset.playTrack(2);
    await asset.playTrack(0);
    await asset.playTrack(1);
  }).timeout(10000);


});

