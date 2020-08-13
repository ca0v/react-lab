import Object from "@ol/Object";

/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
export class Media extends Object {

    private media: any;

    /**
    * Abstract base class; normally only used for creating subclasses and not instantiated in apps. 
    * Convenient class to handle HTML5 media
    */
    constructor(public options: {
        loop?: boolean;
        media?: any;
    }) {
        super();

        this.media = options.media;

        if (options.loop) this.setLoop(options.loop);

        // Dispatch media event as ol3 event
        this.media.addEventListener('canplaythrough', () => this.dispatchEvent({ type: 'ready' }), false);
        ["load", "play", "pause", "ended"]
            .forEach(event => this.media.addEventListener(event, (e: any) => this.dispatchEvent({ type: e.type }), false));
    }

    play(start: number) {
        if (start !== undefined) {
            this.media.pause();
            this.media.currentTime = start;
        }
        this.media.play();
    }

    pause() {
        this.media.pause();
    }

    stop() {
        this.media.pause();
        this.media.currentTime = 0;
    }

    setVolume(v: number) {
        this.media.volume = v;
    }

    getVolume() {
        return this.media.volume;
    };

    mute(b?: boolean) {
        this.media.muted = (b === undefined) ? !this.media.muted : b;
    }

    isMuted() {
        return !!this.media.muted;
    }

    setTime(t?: number) {
        this.media.prop("currentTime", t);
    }

    getTime() {
        return this.media.prop("currentTime");
    }

    getDuration() {
        return Math.floor(this.media.prop("duration") / 60) + ":" + Math.floor((this.media.prop("duration") - Math.floor(this.media.prop("duration") / 60) * 60));
    };

    setLoop(b: boolean) {
        this.media.loop = b;
    };

    getLoop() {
        return this.media.loop;
    };

}

export class AudioMedia extends Media {

    constructor(options: {
        loop?: boolean;
        source: any;
    }) {
        
        let media = new Audio(options.source);

        super({
            media: media,
            loop: options.loop
        });

        media.load();
    }

}
