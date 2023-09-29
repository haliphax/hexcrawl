import {
	DOUBLE_TAP_DELAY_MS,
	HEX_HEIGHT,
	LONG_PRESS_DELAY_MS,
	TILE_HEIGHT,
	TILE_WIDTH,
} from "../constants";
import terrainSprite from "../images/terrain.png";
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
			TILE_WIDTH,
			TILE_HEIGHT,
		)!;
		const layer = tilemap.createLayer("Terrain", tileset, 0, 0)!;

		for (const t of layer.getTilesWithin()) {
			t.updatePixelXY();
		}

		layer.cullCallback = () => cullTiles(layer, cam);

		// --- camera/controls ---

		const boundsLeft = TILE_WIDTH / 2;
		const boundsTop = TILE_HEIGHT - HEX_HEIGHT * 0.75;

		cam.setOrigin(0.5, 0.5).setBounds(
			// account for horizontal hex gap
			boundsLeft,
			// account for vertical hex gap
			boundsTop,
			// account for grid width overlap
			layer.displayWidth - boundsLeft * 2,
			// account for grid height overlap
			layer.displayHeight - HEX_HEIGHT * 8.25,
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
		this.input.on(
			Phaser.Input.Events.POINTER_MOVE,
			(p: Phaser.Input.Pointer) => {
				if (!p.isDown) {
					return;
				}

				if (p.getDistance() < 24) {
					return;
				}

				clearTimeout(longPressTimer);
				cam.scrollX -= (p.x - p.prevPosition.x) / cam.zoom;
				cam.scrollY -= (p.y - p.prevPosition.y) / cam.zoom;
			},
		);

		// long press (start countdown; pointerup clears)
		this.input.on(Phaser.Input.Events.POINTER_DOWN, () => {
			wasLongPress = false;
			longPressTimer = setTimeout(longPressHandler, LONG_PRESS_DELAY_MS);
		});

		// tap/click
		this.input.on(
			Phaser.Input.Events.GAMEOBJECT_POINTER_UP,
			function (this: Phaser.GameObjects.GameObject, p: Phaser.Input.Pointer) {
				clearTimeout(longPressTimer);

				if (p.getDistance() > 24) {
					return;
				}

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
				layer
					.getTileAtWorldXY(p.worldX, p.worldY - HEX_HEIGHT / 2)
					.setVisible(false);
			},
		);
	}
}
