import { TILE_SIZE } from "../constants";
import terrainSprite from "../images/spritesheet.png";
import mapFile from "../maps/map.json";

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
		const layer = tilemap.createLayer("Terrain", tileset, 0, 0)!;

		layer.cullCallback = () =>
			layer.getTilesWithin(0, 0, tilemap.width, tilemap.height);

		this.input.addListener("wheel", (ev: WheelEvent) => {
			const zoomDir = ev.deltaY > 0 ? -1 : ev.deltaY < 0 ? 1 : 0;

			this.cameras.main.setZoom(
				Math.max(0.1, Math.min(2, this.cameras.main.zoom + zoomDir * 0.1)),
			);
		});

		this.cameras.main
			.setOrigin(0.5, 0.5)
			.setBounds(
				TILE_SIZE / 4,
				TILE_SIZE / 2,
				tilemap.width * (TILE_SIZE * 0.75) - TILE_SIZE,
				tilemap.height * TILE_SIZE - TILE_SIZE / 2,
			);

		const cam = this.cameras.main;

		this.input.on("pointermove", (p: Phaser.Input.Pointer) => {
			if (!p.isDown) return;

			cam.scrollX -= (p.x - p.prevPosition.x) / cam.zoom;
			cam.scrollY -= (p.y - p.prevPosition.y) / cam.zoom;
		});
	}
}
