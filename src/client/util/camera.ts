import { Cameras } from "phaser";
import { ZOOM_FACTOR, ZOOM_FACTOR_TAP, ZOOM_MAX, ZOOM_MIN } from "../constants";

export const clampZoom = (
	cam: Cameras.Scene2D.Camera,
	zoomDir: -1 | 0 | 1,
	tap = false,
) => {
	const factor = tap ? ZOOM_FACTOR_TAP : ZOOM_FACTOR;
	const dist = zoomDir < 0 ? 1 - factor : 1 + factor;
	cam.setZoom(Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, cam.zoom * dist)));
};
