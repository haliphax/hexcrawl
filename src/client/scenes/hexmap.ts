import { Cameras } from "phaser";
import {
	DOUBLE_TAP_DELAY_MS,
	LONG_PRESS_DELAY_MS,
	TILE_SIZE,
	ZOOM_FACTOR,
	ZOOM_FACTOR_TAP,
	ZOOM_MAX,
	ZOOM_MIN,
} from "../constants";
import terrainSprite from "../images/spritesheet.png";
import mapFile from "../maps/map.json";

export default class HexMap extends Phaser.Scene {
	constructor() {
		super("scene-main");
	}

	private clampZoom(
		cam: Cameras.Scene2D.Camera,
		zoomDir: -1 | 0 | 1,
		tap = false,
	) {
		const factor = tap ? ZOOM_FACTOR_TAP : ZOOM_FACTOR;
		const dist = zoomDir < 0 ? 1 - factor : 1 + factor;
		cam.setZoom(Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, cam.zoom * dist)));
	}

	preload() {
		this.load.image("terrain", terrainSprite);
		this.load.tilemapTiledJSON("map", mapFile);
	}

	create() {
		// --- load map ---

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

		// --- camera and controls ---

		const cam = this.cameras.main;

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
			this.clampZoom(cam, zoomDir);
		});

		let tapTime = 0;
		let longPressTimer: NodeJS.Timeout;
		let wasLongPress = false;

		const longPressHandler = () => {
			wasLongPress = true;
			this.clampZoom(cam, -1, true);
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
				this.clampZoom(cam, 1, true);
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
