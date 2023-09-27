import Phaser from "phaser";
import BoardPlugin from "phaser3-rex-plugins/plugins/board-plugin";
import GetHexagonMap from "phaser3-rex-plugins/plugins/board/hexagonmap/GetHexagonMap";
import { TileXYType } from "phaser3-rex-plugins/plugins/board/types/Position";

class Main extends Phaser.Scene {
	rexBoard!: BoardPlugin;

	create() {
		const cellSize = 32;
		const gridOffset = 8;
		const board = this.rexBoard.add.board({
			grid: {
				gridType: "hexagonGrid",
				size: cellSize,
				staggeraxis: "y",
				staggerindex: "odd",
				x: cellSize + gridOffset,
				y: cellSize + gridOffset,
			},
		});

		const tilemap = board.fit(
			GetHexagonMap(board, 4),
		) as unknown as TileXYType[];

		const graphics = this.add.graphics({
			lineStyle: {
				width: 1,
				color: 0x555555,
				alpha: 1,
			},
		});

		for (const tileXY of tilemap) {
			const worldXY = board.tileXYToWorldXY(tileXY.x, tileXY.y);

			graphics.strokePoints(
				board.getGridPoints(tileXY.x, tileXY.y, true),
				true,
			);
			(board.scene as Phaser.Scene).add
				.text(worldXY.x, worldXY.y, `${tileXY.x},${tileXY.y}`, {
					color: "#0c0",
					fontSize: 14,
				})
				.setOrigin(0.5);
		}
	}
}

const config: Phaser.Types.Core.GameConfig = {
	height: 576,
	plugins: {
		scene: [
			{
				key: "rexBoard",
				mapping: "rexBoard",
				plugin: BoardPlugin,
			},
		],
	},
	scale: {
		autoCenter: Phaser.Scale.CENTER_BOTH,
		mode: Phaser.Scale.FIT,
	},
	scene: Main,
	type: Phaser.AUTO,
	width: 1024,
};

new Phaser.Game(config);
