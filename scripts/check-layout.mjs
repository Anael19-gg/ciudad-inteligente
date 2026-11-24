/**
 * Guard de colocación para la presentación.
 * Comprueba las huellas principales contra la malla vial y el anillo.
 * No sustituye la revisión visual, pero evita los solapes más costosos.
 */
const FOOTPRINTS = [
  ['escuela', -94.6, -77.4, 55.7, 68.3],
  ['banco', 34.8, 51.2, 53.4, 66.6],
  ['clínica', 78.5, 93.5, 91, 105],
  ['mercado', -52.5, -34.5, -70.5, -57.5],
  ['biblioteca', -53, -37, 87, 103],
  ['bomberos', -85, -67, -36, -20],
  ['barrio C1', -235.7, -220.3, 12, 28],
  ['barrio C2', -95.4, -80.6, -96.8, -82.2],
  ['barrio A1', -82.8, -68.2, 82.4, 95.6],
  ['bosque', -23.8, 23.8, -104.5, -83.5],
  ['plaza central', -23, 23, 53, 73],
  ['hub de movilidad', -22, 22, -73, -53],
  ['estación de metro', -23.5, -14.5, 84, 92],
  ['torre de vidrio', -11.2, 11.2, 82.8, 105.2],
  ['zigurat', 33.5, 56.5, -105, -85],
  ['domo de operaciones', 146, 174, 86, 98],
  ['torres gemelas', 217.5, 238.5, 85, 101],
  ['terrazas verdes', -175, -145, 24, 42],
  ['parque -48/67', -57.5, -38.5, 61.75, 72.25],
  ['parque 48/-67', 38.5, 57.5, -72.25, -61.75],
  ['parque -45/-95', -54.5, -35.5, -100.25, -89.75],
  ['parque -165/100', -174.5, -155.5, 94.75, 105.25],
  ['parque -225/-62', -234.5, -215.5, -67.25, -56.75],
  ['parque 226/68', 216.5, 235.5, 62.75, 73.25],
  ['jardín -112/60', -116.25, -107.75, 57, 63],
  ['jardín -120/117', -124.25, -115.75, 114, 120],
  ['biogás', -198.5, -189.5, 56.5, 63.5],
  ['solar -228/118', -233.1, -222.9, 115.4, 120.6],
  ['solar -190/-69', -196.5, -185.5, -100.5, -91.5],
  ['bomba de agua', -154.1, -149.9, 114.9, 119.1],
  ['tanque de agua', -134.6, -129.4, 114.4, 119.6],
  ['granja vertical', -92.8, -83.2, 26.3, 33.7],
  ['industria A', -131.25, -115.75, -32.75, -21.25],
  ['industria B', -113.3, -104.7, -32.2, -22.8],
  ['EV hub oeste', -77, -67, 57, 67],
  ['EV hub este', 67, 77, -67, -57],
  ['EV hub banco', 70, 80, 33.5, 43.5],
  ['torre datos 127/66', 118.8, 135.2, 57.6, 74.4],
  ['torre datos -128/66', -136.1, -119.9, 57.9, 74.1],
  ['torre datos 128/-66', 120.6, 135.4, -73.4, -58.6],
  ['torre datos -127/-66', -135.3, -118.7, -74.3, -57.7],
  ['torre datos 88/67', 81.5, 94.5, 60.5, 73.5],
  ['torre datos -73/-99', -79.5, -66.5, -105.9, -92.1],
  ['torre datos 160/34', 153.1, 166.9, 27.1, 40.9],
  ['torre datos -160/-20', -166.6, -153.4, -26.6, -13.4],
]

const VERTICAL_ROADS = [-180, -140, -100, -62, -28, 28, 62, 100, 140, 180]
const HORIZONTAL_ROADS = [-144, -110, -78, -48, 48, 78, 110, 144]
const AVENUE_HALF = 6.25
const ROAD_HALF = 3.5
const RING = { x: 208, z: 128, width: 14 }

const overlaps = (a, b) => a[1] < b[2] && a[2] > b[1] && a[3] < b[4] && a[4] > b[3]
const onRoad = (x1, x2, z1, z2) =>
  (x1 < AVENUE_HALF && x2 > -AVENUE_HALF && z1 < 7.8 && z2 > -7.8) ||
  VERTICAL_ROADS.some((x) => x1 < x + ROAD_HALF + 0.25 && x2 > x - ROAD_HALF - 0.25 && z1 < 148 && z2 > -148) ||
  HORIZONTAL_ROADS.some((z) => z1 < z + ROAD_HALF && z2 > z - ROAD_HALF && x1 < 238 && x2 > -238)

const band = RING.width / 2
const onRing = (x1, x2, z1, z2) =>
  (x1 < RING.x + band && x2 > RING.x - band && z1 < 148 && z2 > -148) ||
  (x1 < -RING.x + band && x2 > -RING.x - band && z1 < 148 && z2 > -148) ||
  (z1 < RING.z + band && z2 > RING.z - band && x1 < 238 && x2 > -238) ||
  (z1 < -RING.z + band && z2 > -RING.z - band && x1 < 238 && x2 > -238)

let failures = 0
for (let i = 0; i < FOOTPRINTS.length; i += 1) {
  const a = FOOTPRINTS[i]
  if (onRoad(a[1], a[2], a[3], a[4])) {
    console.error(`✗ ${a[0]} invade una calzada`)
    failures += 1
  }
  if (onRing(a[1], a[2], a[3], a[4])) {
    console.error(`✗ ${a[0]} invade el anillo`)
    failures += 1
  }
  for (let j = i + 1; j < FOOTPRINTS.length; j += 1) {
    const b = FOOTPRINTS[j]
    if (overlaps(a, b)) {
      console.error(`✗ ${a[0]} se solapa con ${b[0]}`)
      failures += 1
    }
  }
}

if (failures > 0) {
  console.error(`\n${failures} problema(s) de colocación.`)
  process.exitCode = 1
} else {
  console.log(`✓ ${FOOTPRINTS.length} huellas revisadas: sin solapes con calzadas, anillo o entre sí.`)
}
