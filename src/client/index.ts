import Phaser from "phaser";
import terrainSprite from "./images/spritesheet.png";
import mapFile from "./maps/map.json";

const TILE_SIZE = 72;

// tiles
class Main extends Phaser.Scene {
	constructor() {
		super("scene-main");
	}

	preload() {
		this.load.image("terrain", terrainSprite);
		this.load.tilemapTiledJSON("map", mapFile);
	}

	create() {
		const tilemap = this.make.tilemap({ key: "map" });
		const tileset = tilemap.addTilesetImage(
			"terrain_tiles",
			"terrain",
			TILE_SIZE,
			TILE_SIZE,
		)!;
		const layer = tilemap.createLayer(
			"Terrain",
			tileset,
			-TILE_SIZE,
			-TILE_SIZE,
		)!;

		layer.cullCallback = () =>
			layer.getTilesWithin(0, 0, tilemap.width, tilemap.height);
	}
}

const config: Phaser.Types.Core.GameConfig = {
	height: 720,
	scale: {
		autoCenter: Phaser.Scale.CENTER_BOTH,
		mode: Phaser.Scale.FIT,
	},
	scene: [Main],
	type: Phaser.AUTO,
	width: 1280,
};

new Phaser.Game(config);
