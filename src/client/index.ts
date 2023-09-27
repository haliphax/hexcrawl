import Phaser from "phaser";
import HexMap from "./scenes/hexmap";

const config: Phaser.Types.Core.GameConfig = {
	antialias: true,
	height: 720,
	scale: {
		autoCenter: Phaser.Scale.CENTER_BOTH,
		mode: Phaser.Scale.FIT,
	},
	scene: [HexMap],
	type: Phaser.AUTO,
	width: 1280,
};

new Phaser.Game(config);
