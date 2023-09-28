import { Cameras } from "phaser";
import { TILE_SIZE } from "../constants";

/** cull tiles outside of camera bounds (with additional margin) */
export const cullTiles = (
	layer: Phaser.Tilemaps.TilemapLayer,
	cam: Cameras.Scene2D.Camera,
) => {
	const bounds = cam.getBounds();
	const heightOffset = (TILE_SIZE / 2) * 3;
	const widthOffset = TILE_SIZE * 0.75 * 3;
	return layer.getTilesWithin(
		bounds.left - widthOffset,
		bounds.top - heightOffset,
		bounds.width + widthOffset * 2,
		bounds.height + heightOffset * 2,
	);
};
