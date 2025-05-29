import HexMap from "@/scenes/hexmap";
import Phaser from "phaser";

const config = (): Phaser.Types.Core.GameConfig => ({
	antialias: true,
	fps: {
		target: 30,
	},
	height: window.innerHeight,
	parent: document.body,
	scale: {
		autoCenter: Phaser.Scale.Center.CENTER_BOTH,
		autoRound: true,
		mode: Phaser.Scale.ScaleModes.NONE,
	},
	scene: [HexMap],
	type: Phaser.AUTO,
	width: window.innerWidth,
});

document.body.addEventListener(
	"click",
	async () => {
		document.querySelector("h1")?.remove();
		await document.body.requestFullscreen();
		new Phaser.Game(config());
	},
	{ once: true },
);
