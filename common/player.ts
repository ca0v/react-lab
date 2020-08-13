const avitars = {
	default: {
		rate: 1,
		pitch: 1
	},
	sara: {
		rate: 1.14,
		pitch: 0.81
	},
	pati: {
		rate: 0.9,
		pitch: 0.4
	},
	rita: {
		rate: 1.1,
		pitch: 0.45
	},
	cielo: {
		rate: 0.9,
		pitch: 0.8
	},
	clara: {
		rate: 1.1,
		pitch: 1.1
	}
};

class Player {
	private audio = new Audio();
	private synth = new SpeechSynthesisUtterance();
	private rate: number;
	private pitch: number;

	constructor() {
		this.rate = 1;
		this.pitch = 1;
	}
	stop(): any {
		window.speechSynthesis.cancel();
	}

	play(text: { en?: string; es?: string; avitar?: "rita" | "clara" }) {
		this.synth.volume = 1;
		if (text.avitar) {
			let avitar = avitars[text.avitar] || avitars.default;
			this.synth.rate = avitar.rate;
			this.synth.pitch = avitar.pitch;
		} else {
			this.rate = 1.5 - 0.5 * Math.random();
			this.pitch = 1.2 - 1.0 * Math.random();
			this.synth.rate = this.rate;
			this.synth.pitch = this.pitch;
		}
		//log(`pitch: ${this.synth.pitch}, rate: ${this.synth.rate}`);
		if (text.en) {
			this.synth.lang = "en-US";
			this.synth.text = text.en;
			window.speechSynthesis.speak(this.synth);
		} else if (text.es) {
			this.synth.lang = "es-US";
			this.synth.text = text.es;
			window.speechSynthesis.speak(this.synth);
		}
	}
}

export let player = new Player();
