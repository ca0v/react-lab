declare var requirejs;

export class AudioAsset {

    private audio: HTMLAudioElement;

    constructor(public options: {
        src: string;
        frames: Array<number>;
    }) {
        this.audio = document.createElement("audio");
        this.audio.src = options.src;
        document.body.append(this.audio);
    }

    async playAnyTrack() {
        const track = Math.round(Math.random() * (this.options.frames.length - 1));
        return this.playTrack(track);
    }

    async playTrack(index: number) {
        if (0 > index)
            throw "too small";
        if (index >= this.options.frames.length)
            throw "too large";
        const duration = this.options.frames[index + 1] - this.options.frames[index];
        return this.playUntil(this.audio, this.options.frames[index], duration);
    }

    private async playUntil(player: HTMLMediaElement, start: number, duration: number) {
        return new Promise<any>((good, bad) => {
            player.currentTime = start / 1000;
            player.play();
            setTimeout(() => {
                player.pause();
                good();
            }, duration);
        });
    }
}

export const GoodJobAssets = new AudioAsset({
    src: requirejs.toUrl("../assets/familygamesoundsofencouragement.mp3")
    , frames: [0, 2012, 3319, 4921, 7107, 10144, 11799, 15021, 17252, 18444, 19551, 21608, 23723, 26287, 28688, 31163, 34389, 36482, 38591, 43942, 45785, 48108, 52396, 54328, 56022, 57790, 59723, 61999, 64229, 66143, 68007, 70143, 71683, 73280, 75741, 79327, 81563, 84675, 86912, 88806, 91523, 94121, 96239, 98456, 100728, 103843]
});