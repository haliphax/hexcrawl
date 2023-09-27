import terrainSprite from "../images/spritesheet.png";
import mapFile from "../maps/map.json";

const TILE_SIZE = 72;

export default class HexMap extends Phaser.Scene {
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
			-TILE_SIZE / 2,
			-TILE_SIZE / 2,
		)!;

		layer.cullCallback = () =>
			layer.getTilesWithin(0, 0, tilemap.width, tilemap.height);
	}
}
