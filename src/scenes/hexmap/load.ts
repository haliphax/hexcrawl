import { HEX_HEIGHT, TILE_HEIGHT, TILE_WIDTH } from "@/constants";
import HexMap from ".";

/** Load map */
function loadHexMap(this: HexMap) {
	const tilemap = this.make.tilemap({ key: "map" });
	const tileset = tilemap.addTilesetImage(
		"terrain_tiles",
		"terrain",
		TILE_WIDTH,
		TILE_HEIGHT,
	)!;
	this.layer = tilemap.createLayer("Terrain", tileset, 0, 0)!;

	for (const t of this.layer.getTilesWithin()) {
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
			.setOrigin(0.5, 0.5)
			.setVisible(false);

		this.labels.push(t.properties.distText);
	}
}

export default loadHexMap;
