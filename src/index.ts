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

let game: Phaser.Game;

document.body.addEventListener(
	"click",
	async () => {
		document.querySelector("h1")?.remove();
		await document.body.requestFullscreen();
		game = new Phaser.Game(config());
	},
	{ once: true },
);

// resize game viewport on viewport resize (portrait to landscape, etc.)
const resizeWindow = () =>
	game.scale.resize(window.innerWidth, window.innerHeight);

let resizeWindowTimeout: NodeJS.Timeout | null = null;

window.addEventListener("resize", () => {
	if (resizeWindowTimeout) {
		clearTimeout(resizeWindowTimeout);
	}

	resizeWindowTimeout = setTimeout(resizeWindow, 500);
});
