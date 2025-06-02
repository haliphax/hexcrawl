import {
	COLORS,
	DOUBLE_TAP_DELAY_MS,
	HEX_HEIGHT,
	LONG_PRESS_DELAY_MS,
} from "@/constants";
import { clampZoom } from "@/util/camera";
import { hexagonalDistance } from "@/util/hex";
import { GameObjects, Input, Tilemaps } from "phaser";
import HexMap from ".";

/** Configure input controls */
function setupControls(this: HexMap) {
	// scroll (zoom)
	this.input.addListener("wheel", (ev: WheelEvent) => {
		const zoomDir = ev.deltaY > 0 ? -1 : ev.deltaY < 0 ? 1 : 0;
		clampZoom(this.cam!, zoomDir);
	});

	let longPressTimer: NodeJS.Timeout;

	// drag (pan)
	this.input.on(Input.Events.POINTER_MOVE, (p: Input.Pointer) => {
		if (!p.isDown) {
			if (!selectedTile) {
				return;
			}

			this.labels.filter((v) => v.visible).forEach((v) => v.setVisible(false));
			const currTile = this.layer!.getTileAtWorldXY(
				p.worldX,
				p.worldY - HEX_HEIGHT / 2,
			);

			if (
				currTile !== selectedTile &&
				hexagonalDistance(
					currTile.x,
					currTile.y,
					selectedTile.x,
					selectedTile.y,
				) <= this.radius
			) {
				currTile.properties.distText.setVisible(true);
			}

			return;
		}

		if (p.getDistance() < 24) {
			return;
		}

		clearTimeout(longPressTimer);
		this.cam!.scrollX -= (p.x - p.prevPosition.x) / this.cam!.zoom;
		this.cam!.scrollY -= (p.y - p.prevPosition.y) / this.cam!.zoom;
	});

	let singleTapTimer: NodeJS.Timeout;
	let wasLongPress = false;

	// long press (zoom out)
	const longPressHandler = () => {
		wasLongPress = true;
		clearTimeout(singleTapTimer);
		clampZoom(this.cam!, -1, true);
	};

	let selectedTile: Tilemaps.Tile | null;

	// tap/click (select map tile)
	const singleTapHandler = (x: number, y: number) => {
		const tiles = this.layer!.getTilesWithin();
		const lastSelectedTile = selectedTile;

		selectedTile = this.layer!.getTileAtWorldXY(x, y - HEX_HEIGHT / 2);

		if (selectedTile === lastSelectedTile) {
			for (const l of this.labels) {
				l.setVisible(false);
			}

			for (const t of tiles) {
				t.tint = 0xffffff;
			}

			selectedTile.clearAlpha();
			selectedTile = null;
			return;
		}

		if (lastSelectedTile) {
			lastSelectedTile.clearAlpha();

			for (const l of this.labels) {
				l.setVisible(false);
			}
		}

		this.radius = Math.floor(Math.random() * 8) + 1;

		for (const t of tiles) {
			if (t === selectedTile) {
				t.setAlpha(0.65);
				t.tint = 0xffffff;
				continue;
			}

			const dist = hexagonalDistance(t.x, t.y, selectedTile.x, selectedTile.y);

			if (dist > this.radius) {
				t.tint = COLORS.TINTED;
			} else {
				t.tint = 0xffffff;
				(t.properties.distText as GameObjects.Text).setText(dist.toString());
			}
		}
	};

	// mouse/tap down; start long press countdown
	this.input.on(Input.Events.POINTER_DOWN, () => {
		wasLongPress = false;
		longPressTimer = setTimeout(longPressHandler, LONG_PRESS_DELAY_MS);
	});

	let tapTime = 0;

	// mouse/tap up; handle single/double/long
	this.input.on(Input.Events.GAMEOBJECT_POINTER_UP, (p: Input.Pointer) => {
		const [x, y] = [p.worldX, p.worldY];

		clearTimeout(longPressTimer);

		// discard move event but allow some "wiggle"
		if (p.getDistance() > 24) {
			return;
		}

		// double tap (zoom in)
		if (tapTime > 0 && p.time - tapTime < DOUBLE_TAP_DELAY_MS) {
			tapTime = 0;
			clearTimeout(singleTapTimer);
			clampZoom(this.cam!, 1, true);
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
	});
}

export default setupControls;
