import { HEX_HEIGHT, TILE_HEIGHT, TILE_WIDTH } from "@/constants";
import HexMap from ".";

/** Set up scene camera */
function setupCamera(this: HexMap) {
	const boundsLeft = TILE_WIDTH / 2;
	const boundsTop = TILE_HEIGHT - HEX_HEIGHT * 0.75;

	this.cam = this.cameras.main;
	this.cam.setOrigin(0.5, 0.5).setBounds(
		// account for horizontal hex gap
		boundsLeft,
		// account for vertical hex gap
		boundsTop,
		// account for grid width overlap
		this.layer!.displayWidth - boundsLeft * 2,
		// account for grid height overlap
		this.layer!.displayHeight - HEX_HEIGHT * 8.25,
	);
}

export default setupCamera;
