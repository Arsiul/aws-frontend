import { geoEqualEarth, geoPath } from 'd3-geo'

// Must mirror the <ComposableMap projection="geoEqualEarth" projectionConfig={{ scale: MAP_SCALE }}
// width={MAP_WIDTH} height={MAP_HEIGHT} /> props in RegionMap so the generated path matches
// exactly what <Line> renders internally — react-simple-maps gives no way to read it back out.
export const MAP_WIDTH = 800
export const MAP_HEIGHT = 600
export const MAP_SCALE = 145

const projection = geoEqualEarth().translate([MAP_WIDTH / 2, MAP_HEIGHT / 2]).scale(MAP_SCALE)
const pathGenerator = geoPath(projection)

/** SVG path `d` string for the great-circle-ish line between two [lon, lat] points,
 *  in the same coordinate space as the map's <svg viewBox>. */
export function connectionPathD(from: [number, number], to: [number, number]): string {
  return pathGenerator({ type: 'LineString', coordinates: [from, to] }) ?? ''
}
