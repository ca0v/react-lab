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
    src: "../assets/familygamesoundsofencouragement.mp3"
    , frames: [0, 1.858482, 3.361143, 4.923747, 7.064392, 10.123734, 11.810846, 14.969253, 17.200211, 19.633819, 21.609585, 23.702719, 26.342752].map(i => i * 1000)
});