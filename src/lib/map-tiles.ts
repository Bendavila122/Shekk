/**
 * Real satellite / terrain imagery under the "Been There" map.
 *
 * The map's own SVG space is a simple equirectangular projection, while raster
 * tiles are Web Mercator. Rather than reprojecting the imagery, each tile is
 * placed with its own rectangle: the tile's lon/lat corners are pushed through
 * the map projection, so every tile lands where it belongs and the tiny vertical
 * stretch inside one 256px tile is invisible at any usable zoom.
 */

import { LAT_MAX, LON_MIN, LON_SCALE, PROJ_K } from "@/lib/israel-geo";

const TILE = 256;
export const MIN_TILE_Z = 6;
export const MAX_TILE_Z = 18;

const DEG_PER_UNIT_X = 1 / (LON_SCALE * PROJ_K);
const DEG_PER_UNIT_Y = 1 / PROJ_K;

export const mapToLon = (mx: number) => LON_MIN + mx * DEG_PER_UNIT_X;
export const mapToLat = (my: number) => LAT_MAX - my * DEG_PER_UNIT_Y;
export const lonToMap = (lon: number) => (lon - LON_MIN) * LON_SCALE * PROJ_K;
export const latToMap = (lat: number) => (LAT_MAX - lat) * PROJ_K;

const lonToTx = (lon: number, z: number) => ((lon + 180) / 360) * 2 ** z;
const latToTy = (lat: number, z: number) => {
  const s = Math.sin((lat * Math.PI) / 180);
  return ((0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * 2 ** z);
};
const txToLon = (tx: number, z: number) => (tx / 2 ** z) * 360 - 180;
const tyToLat = (ty: number, z: number) => {
  const n = Math.PI * (1 - (2 * ty) / 2 ** z);
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
};

export type Tile = {
  key: string;
  url: string;
  /** Rectangle in map (SVG) units. */
  left: number;
  top: number;
  width: number;
  height: number;
};

/** Zoom level whose native pixel density matches the current on-screen scale. */
export function tileZoom(k: number) {
  const pxPerDeg = k * LON_SCALE * PROJ_K;
  const z = Math.round(Math.log2((pxPerDeg * 360) / TILE));
  return Math.max(MIN_TILE_Z, Math.min(MAX_TILE_Z, z));
}

/** Esri World Imagery — high-resolution aerial photography, free for map use. */
const imagery = (z: number, x: number, y: number) =>
  `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`;

/**
 * The imagery tiles covering a map-space rectangle, capped so a wild zoom-out
 * can never ask the browser for hundreds of requests.
 */
export function tilesForRect(
  rect: { x0: number; y0: number; x1: number; y1: number },
  z: number,
  max = 60,
): Tile[] {
  const lonW = mapToLon(rect.x0);
  const lonE = mapToLon(rect.x1);
  const latN = mapToLat(rect.y0);
  const latS = mapToLat(rect.y1);

  const x0 = Math.floor(lonToTx(lonW, z));
  const x1 = Math.floor(lonToTx(lonE, z));
  const y0 = Math.floor(latToTy(latN, z));
  const y1 = Math.floor(latToTy(latS, z));
  const span = 2 ** z;

  const out: Tile[] = [];
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      if (x < 0 || y < 0 || x >= span || y >= span) continue;
      if (out.length >= max) return out;
      const left = lonToMap(txToLon(x, z));
      const right = lonToMap(txToLon(x + 1, z));
      const top = latToMap(tyToLat(y, z));
      const bottom = latToMap(tyToLat(y + 1, z));
      out.push({
        key: `${z}/${x}/${y}`,
        url: imagery(z, x, y),
        left,
        top,
        // a hair of overlap hides sub-pixel seams between neighbours
        width: right - left + 0.35,
        height: bottom - top + 0.35,
      });
    }
  }
  return out;
}
