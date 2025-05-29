import HexMap from "@/scenes/hexmap";
import { AUTO, Game, Scale, Types } from "phaser";

const config = (): Types.Core.GameConfig => ({
	antialias: true,
	fps: {
		target: 30,
	},
	height: window.innerHeight,
	parent: document.body,
	scale: {
		autoCenter: Scale.Center.CENTER_BOTH,
		autoRound: true,
		mode: Scale.ScaleModes.NONE,
	},
	scene: [HexMap],
	type: AUTO,
	width: window.innerWidth,
});

let game: Game;

document.body.addEventListener(
	"click",
	async () => {
		document.querySelector("h1")?.remove();
		await document.body.requestFullscreen();
		game = new Game(config());
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
