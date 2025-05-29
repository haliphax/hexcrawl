import {
	COLORS,
	DOUBLE_TAP_DELAY_MS,
	HEX_HEIGHT,
	LONG_PRESS_DELAY_MS,
	TILE_HEIGHT,
	TILE_WIDTH,
} from "@/constants";
import terrainSprite from "@/images/terrain.png";
import mapFile from "@/maps/map.json";
import { clampZoom } from "@/util/camera";
import { hexagonalDistance } from "@/util/hex";
import { Scene, Tilemaps } from "phaser";

export default class HexMap extends Scene {
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
		const labels: Array<Phaser.GameObjects.Text> = [];

		for (const t of layer.getTilesWithin()) {
			t.properties.distText = this.add
				.text(
					t.pixelX + TILE_WIDTH / 2,
					t.pixelY + TILE_HEIGHT - HEX_HEIGHT / 2,
					"X",
					{
						backgroundColor: "#000",
						color: "#fff",
						fontSize: 14,
						padding: {
							bottom: 2,
							left: 2,
							right: 2,
							top: 2,
						},
					},
				)
				.setAlpha(0.9)
				.setOrigin(0.5, 0.5)
				.setVisible(false);

			labels.push(t.properties.distText);
		}

		let radius = 4;

		//layer.cullCallback = () =>
		//	tilesWithinRadius(radius, selectedTile, cullTiles(layer, cam));

		// --- camera ---

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

		// --- controls ---

		// scroll
		this.input.addListener("wheel", (ev: WheelEvent) => {
			const zoomDir = ev.deltaY > 0 ? -1 : ev.deltaY < 0 ? 1 : 0;
			clampZoom(cam, zoomDir);
		});

		let longPressTimer: NodeJS.Timeout;

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

		let singleTapTimer: NodeJS.Timeout;
		let wasLongPress = false;

		// long press (zoom out)
		const longPressHandler = () => {
			wasLongPress = true;
			clearTimeout(singleTapTimer);
			clampZoom(cam, -1, true);
		};

		let selectedTile: Tilemaps.Tile | null;

		// tap/click (select map tile)
		const singleTapHandler = (x: number, y: number) => {
			const tiles = layer.getTilesWithin();
			const lastSelectedTile = selectedTile;

			selectedTile = layer.getTileAtWorldXY(x, y - HEX_HEIGHT / 2);

			if (selectedTile === lastSelectedTile) {
				for (const l of labels) {
					l.setVisible(false);
				}

				for (const t of tiles) {
					t.tint = 0xffffff;
				}

				selectedTile = null;
				return;
			}

			if (lastSelectedTile) {
				for (const l of labels) {
					l.setVisible(false);
				}
			}

			radius = Math.floor(Math.random() * 8) + 1;

			for (const t of tiles) {
				if (t === selectedTile) {
					continue;
				}

				const dist = hexagonalDistance(
					t.x,
					t.y,
					selectedTile.x,
					selectedTile.y,
				);

				if (dist > radius) {
					t.tint = COLORS.TINTED;
				} else {
					t.tint = 0xffffff;
					(t.properties.distText as Phaser.GameObjects.Text)
						.setVisible(true)
						.setText(
							hexagonalDistance(
								selectedTile.x,
								selectedTile.y,
								t.x,
								t.y,
							).toString(),
						);
				}
			}
		};

		// mouse/tap down; start long press countdown
		this.input.on(Phaser.Input.Events.POINTER_DOWN, () => {
			wasLongPress = false;
			longPressTimer = setTimeout(longPressHandler, LONG_PRESS_DELAY_MS);
		});

		let tapTime = 0;

		// mouse/tap up; handle single/double/long
		this.input.on(
			Phaser.Input.Events.GAMEOBJECT_POINTER_UP,
			function (this: Phaser.GameObjects.GameObject, p: Phaser.Input.Pointer) {
				const [x, y] = [p.worldX, p.worldY];

				clearTimeout(longPressTimer);

				// ignore "wiggle"
				if (p.getDistance() > 24) {
					return;
				}

				// double tap (zoom in)
				if (tapTime > 0 && p.time - tapTime < DOUBLE_TAP_DELAY_MS) {
					tapTime = 0;
					clearTimeout(singleTapTimer);
					clampZoom(cam, 1, true);
					return;
				}

				// long press; discard pointerup event
				if (wasLongPress) {
					tapTime = 0;
					return;
				}

				// first tap; start single tap countdown
				tapTime = p.time;
				singleTapTimer = setTimeout(
					() => singleTapHandler(x, y),
					DOUBLE_TAP_DELAY_MS,
				);
			},
		);
	}
}
