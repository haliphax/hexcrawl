import { Cameras } from "phaser";
import { HEX_HEIGHT, HEX_WIDTH } from "../constants";

/** cull tiles outside of camera bounds (with additional margin) */
export const cullTiles = (
	layer: Phaser.Tilemaps.TilemapLayer,
	cam: Cameras.Scene2D.Camera,
) => {
	const bounds = cam.getBounds();
	const heightOffset = HEX_HEIGHT * 0.75 * 3;
	const widthOffset = (HEX_WIDTH / 2) * 3;

	return layer
		.getTilesWithin(
			bounds.left - widthOffset,
			bounds.top - heightOffset,
			bounds.width + widthOffset * 2,
			bounds.height + heightOffset * 2,
		)
		.filter((tile) => tile.visible);
};
