import {
	DOUBLE_TAP_DELAY_MS,
	LONG_PRESS_DELAY_MS,
	TILE_SIZE,
} from "../constants";
import terrainSprite from "../images/spritesheet.png";
import mapFile from "../maps/map.json";
import { clampZoom } from "../util/camera";
import { cullTiles } from "../util/layers";

export default class HexMap extends Phaser.Scene {
	constructor() {
		super("scene-hexmap");
	}

	preload() {
		this.load.setBaseURL(location.toString());
		this.load.image("terrain", terrainSprite);
		this.load.tilemapTiledJSON("map", mapFile);
	}

	create() {
		const cam = this.cameras.main;

		// --- load map ---

		const tilemap = this.make.tilemap({ key: "map" });
		const tileset = tilemap.addTilesetImage(
			"terrain_tiles",
			"terrain",
			TILE_SIZE,
			TILE_SIZE,
		)!;
		const layer = tilemap.createLayer("Terrain", tileset, 0, 0)!;

		layer.cullCallback = () => cullTiles(layer, cam);

		// --- camera/controls ---

		cam.setOrigin(0.5, 0.5).setBounds(
			// account for horizontal hex gap
			TILE_SIZE / 4,
			// account for vertical hex gap
			TILE_SIZE / 2,
			// account for tile width overlap
			tilemap.width * (TILE_SIZE * 0.75) - TILE_SIZE,
			// account for tile height overlap
			tilemap.height * TILE_SIZE - TILE_SIZE / 2,
		);

		// scroll
		this.input.addListener("wheel", (ev: WheelEvent) => {
			const zoomDir = ev.deltaY > 0 ? -1 : ev.deltaY < 0 ? 1 : 0;
			clampZoom(cam, zoomDir);
		});

		let tapTime = 0;
		let longPressTimer: NodeJS.Timeout;
		let wasLongPress = false;

		const longPressHandler = () => {
			wasLongPress = true;
			clampZoom(cam, -1, true);
		};

		// drag
		this.input.on("pointermove", (p: Phaser.Input.Pointer) => {
			if (!p.isDown) {
				return;
			}

			if (p.getDistance() < 24) {
				return;
			}

			clearTimeout(longPressTimer);
			cam.scrollX -= (p.x - p.prevPosition.x) / cam.zoom;
			cam.scrollY -= (p.y - p.prevPosition.y) / cam.zoom;
		});

		// long press (start countdown; pointerup clears)
		this.input.on("pointerdown", () => {
			wasLongPress = false;
			longPressTimer = setTimeout(longPressHandler, LONG_PRESS_DELAY_MS);
		});

		// tap/click
		this.input.on("pointerup", (p: Phaser.Input.Pointer) => {
			clearTimeout(longPressTimer);

			// double tap
			if (tapTime > 0 && p.time - tapTime < DOUBLE_TAP_DELAY_MS) {
				tapTime = 0;
				clampZoom(cam, 1, true);
				return;
			}

			// long press; discard
			if (wasLongPress) {
				tapTime = 0;
				return;
			}

			// single tap
			tapTime = p.time;
		});
	}
}
