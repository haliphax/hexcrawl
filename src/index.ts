import Phaser from "phaser";
import HexMap from "./scenes/hexmap";

const config: Phaser.Types.Core.GameConfig = {
	antialias: true,
	fps: {
		target: 30,
	},
	height: 720,
	scale: {
		autoCenter: Phaser.Scale.CENTER_BOTH,
		autoRound: true,
		mode: Phaser.Scale.FIT,
	},
	scene: [HexMap],
	type: Phaser.AUTO,
	width: 1280,
};

new Phaser.Game(config);
