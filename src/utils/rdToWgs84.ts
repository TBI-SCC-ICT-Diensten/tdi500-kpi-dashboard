/**
 * Converts RD New (EPSG:28992) coordinates to WGS84 (lat/lon).
 *
 * Uses the standard Dutch geodetic polynomial approximation.
 * Accurate to ~1m across the Netherlands.
 *
 * Reference: Benelux geodetic transformation formulas
 *
 * @param x - RD New easting (e.g. 92294.3)
 * @param y - RD New northing (e.g. 436830.56)
 * @returns [latitude, longitude] in decimal degrees WGS84
 */
export function rdToWgs84(x: number, y: number): [number, number] {
  const dX = (x - 155000) * 1e-5;
  const dY = (y - 463000) * 1e-5;

  const sumN =
    3235.65389 * dY +
    -32.58297 * dX * dX +
    -0.24750 * dY * dY +
    -0.84978 * dX * dX * dY +
    -0.06550 * dY * dY * dY +
    -0.01709 * dX * dX * dY * dY +
    -0.00738 * dX +
    0.00530 * Math.pow(dX, 4) +
    -0.00039 * dX * dX * Math.pow(dY, 3) +
    0.00033 * Math.pow(dX, 4) * dY +
    -0.00012 * dX * dY;

  const sumE =
    5260.52916 * dX +
    105.94684 * dX * dY +
    2.45656 * dX * dY * dY +
    -0.81885 * dX * dX * dX +
    0.05594 * dX * Math.pow(dY, 3) +
    -0.05607 * Math.pow(dX, 3) * dY +
    0.01199 * dY +
    -0.00256 * Math.pow(dX, 3) * dY * dY +
    0.00128 * dX * Math.pow(dY, 4) +
    0.00022 * dY * dY +
    -0.00022 * dX * dX +
    0.00026 * Math.pow(dX, 5);

  const lat = 52.15517440 + sumN / 3600;
  const lon = 5.38720621 + sumE / 3600;

  return [lat, lon];
}
