/** calculate distance between 2 points on a hexagonal plane */
export const hexagonalDistance = (
	x1: number,
	y1: number,
	x2: number,
	y2: number,
) => {
	// handle same column with simple formula
	if (x1 === x2) {
		return Math.abs(y1 - y2);
	}

	// handle same row with simple formula
	if (y1 === y2) {
		return Math.abs(x1 - x2);
	}

	let offset = 0;
	const offset1 = y1 % 2;
	const offset2 = y2 % 2;

	// determine offset to match row stagger
	if (offset1 !== offset2) {
		if (!offset2) {
			offset = x2 < x1 ? 1 : 0;
		} else {
			offset = x2 > x1 ? 1 : 0;
		}
	}

	const rise = Math.abs(y1 - y2);
	const run = Math.abs(x1 - x2);
	// diagonal movements are weighted 1.5
	const dist = run + Math.round(rise / 2) - offset;

	// return largest of rise/run/dist to get hexagonal boundary
	return rise > dist ? rise : run > dist ? run : dist;
};
