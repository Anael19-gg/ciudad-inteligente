import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

type HouseSpec = {
  x: number
  z: number
  rotation: number
  height: number
  frontSetback: number
  bodyTone: number
  roofTone: number
  doorTone: number
  lit: boolean
  chimney: boolean
}

type HouseRowOptions = {
  alongX: boolean
  fixed: number
  centers: number[]
  rotation: number
  frontSetback: number
  toneOffset: number
}

type LaneSpec = {
  x: number
  z: number
  length: number
  width: number
  alongX: boolean
}

type LotSpec = { x: number; z: number; width: number; depth: number; tone: number }

type PaverSpec = {
  x: number
  z: number
  rotation: number
  width: number
  length: number
  tone: number
}

type FenceSegmentSpec = { x1: number; z1: number; x2: number; z2: number }

type FencePostSpec = { x: number; z: number }

type FenceRailSpec = { x: number; z: number; rotation: number; length: number }

type TreeSpec = { x: number; z: number; scale: number; kind: 'round' | 'conifer'; tone: number }

type LampSpec = { x: number; z: number }

type BenchSpec = { x: number; z: number; rotation: number }

const HOUSE_WIDTH = 2.7
const HOUSE_DEPTH = 2.45
const ROOF_RISE = 0.95
const FOUNDATION_HEIGHT = 0.16

const BODY_COLORS_DAY = ['#e5dac5', '#cdd9c8', '#e7d2c2', '#c9d6da', '#ded3bd', '#d8c9b4']
const BODY_COLORS_NIGHT = ['#57574f', '#515a51', '#5a5049', '#4d585c', '#565149', '#534d45']
const ROOF_COLORS_DAY = ['#9a5f47', '#6f5a49', '#7d5f47', '#59666b', '#8a6b52']
const ROOF_COLORS_NIGHT = ['#432f29', '#3a332d', '#433228', '#344043', '#3e332a']
const DOOR_COLORS_DAY = ['#6a4a34', '#4a5c4a', '#73563e', '#45535c', '#7b5a3e']
const DOOR_COLORS_NIGHT = ['#33261d', '#28302a', '#352a1f', '#242d31', '#39291e']
const MAILBOX_COLORS_DAY = ['#7f9aa2', '#a26b58', '#6f8a6a', '#8b8797']
const MAILBOX_COLORS_NIGHT = ['#384246', '#463027', '#303d32', '#3c3a44']
const TREE_TONE_DAY = ['#4c7b4a', '#5c8a55', '#3f6f49', '#6a925d']
const TREE_TONE_NIGHT = ['#1e3a2a', '#254434', '#1b3327', '#2a4a36']
const SHRUB_TONE_DAY = ['#5b8350', '#699259', '#4f7a49', '#739a60']
const SHRUB_TONE_NIGHT = ['#22402f', '#294a38', '#1f3a2b', '#2d503c']
const CONIFER_TONE_DAY = ['#37664e', '#427458', '#2f5d48']
const CONIFER_TONE_NIGHT = ['#173229', '#1b3a2f', '#142c25']
const FLOWER_COLORS_DAY = ['#e3b34f', '#d97b6b', '#f0e4c2', '#b48bc7', '#e09054']
const FLOWER_COLORS_NIGHT = ['#b58b48', '#a9635a', '#c9bd9c', '#826898', '#a96f45']
const LAWN_COLORS_DAY = ['#5c7a4a', '#577447', '#617f4f']
const LAWN_COLORS_NIGHT = ['#24392b', '#213428', '#283f30']
const PAVER_COLORS_DAY = ['#a89d8c', '#9a9182', '#b3a795', '#8e8779']
const PAVER_COLORS_NIGHT = ['#3b4242', '#353c3c', '#434949', '#313839']
const WINDOW_WARM_DAY = ['#f1dfba', '#f5e5c4', '#edd7ad']
const WINDOW_COOL_DAY = ['#b7d0d8', '#c1d9de']
const WINDOW_WARM_NIGHT = ['#ffcd7c', '#ffd89a', '#ffc66f']
const WINDOW_COOL_NIGHT = ['#526d79', '#5f7b84']

function createHouseRow({ alongX, fixed, centers, rotation, frontSetback, toneOffset }: HouseRowOptions): HouseSpec[] {
  return centers.map((center, index) => ({
    x: alongX ? center : fixed,
    z: alongX ? fixed : center,
    rotation,
    height: 2.18 + ((index + toneOffset) % 3) * 0.06,
    frontSetback,
    bodyTone: (index + toneOffset) % BODY_COLORS_DAY.length,
    roofTone: (index * 2 + toneOffset) % ROOF_COLORS_DAY.length,
    doorTone: (index + toneOffset * 2) % DOOR_COLORS_DAY.length,
    lit: (index + toneOffset) % 3 !== 1,
    chimney: (index + toneOffset) % 4 === 0,
  }))
}

// Barrio C1: al oeste del anillo perimetral. Todas las piezas quedan entre
// x=-235.7 y x=-220.3, con el anillo libre al este y la avenida lejos al sur.
const C1_HOUSES = [
  ...createHouseRow({
    alongX: false,
    fixed: -232.225,
    centers: [14.8, 18.2, 21.6, 25.0],
    rotation: Math.PI / 2,
    frontSetback: 1.55,
    toneOffset: 0,
  }),
  ...createHouseRow({
    alongX: false,
    fixed: -223.775,
    centers: [14.8, 18.2, 21.6, 25.0],
    rotation: -Math.PI / 2,
    frontSetback: 1.55,
    toneOffset: 3,
  }),
]

// Barrio C2: al este de la calle x=-100 y al norte de la calle z=-78.
const C2_HOUSES = [
  ...createHouseRow({
    alongX: true,
    fixed: -93.325,
    centers: [-93.2, -89.8, -86.4, -83.0],
    rotation: 0,
    frontSetback: 1.2,
    toneOffset: 1,
  }),
  ...createHouseRow({
    alongX: true,
    fixed: -85.875,
    centers: [-93.2, -89.8, -86.4, -83.0],
    rotation: Math.PI,
    frontSetback: 1.2,
    toneOffset: 4,
  }),
]

// Barrio A1: pequeño conjunto residencial al oeste del centro.
const A1_HOUSES = [
  ...createHouseRow({
    alongX: false,
    fixed: -79.775,
    centers: [85.6, 89.0, 92.4],
    rotation: Math.PI / 2,
    frontSetback: 1.65,
    toneOffset: 2,
  }),
  ...createHouseRow({
    alongX: false,
    fixed: -71.225,
    centers: [85.6, 89.0, 92.4],
    rotation: -Math.PI / 2,
    frontSetback: 1.65,
    toneOffset: 5,
  }),
]

const HOUSES = [...C1_HOUSES, ...C2_HOUSES, ...A1_HOUSES]
const HOUSE_COUNT = HOUSES.length
const CHIMNEY_COUNT = HOUSES.filter((house) => house.chimney).length

const LOTS: LotSpec[] = [
  { x: -228, z: 20, width: 15.2, depth: 15.0, tone: 0 },
  { x: -88, z: -89.5, width: 14.6, depth: 14.0, tone: 1 },
  { x: -75.5, z: 89, width: 14.4, depth: 13.0, tone: 2 },
]

const LANES: LaneSpec[] = [
  { x: -228, z: 20, length: 15.2, width: 2.9, alongX: false },
  { x: -88, z: -89.6, length: 14.8, width: 2.6, alongX: true },
  { x: -75.5, z: 89, length: 13.2, width: 2.8, alongX: false },
]

const FENCE_SEGMENTS: FenceSegmentSpec[] = [
  // C1
  { x1: -235.7, z1: 12.4, x2: -235.7, z2: 27.6 },
  { x1: -220.3, z1: 12.4, x2: -220.3, z2: 27.6 },
  { x1: -235.7, z1: 27.6, x2: -220.3, z2: 27.6 },
  { x1: -235.7, z1: 12.4, x2: -230.1, z2: 12.4 },
  { x1: -225.9, z1: 12.4, x2: -220.3, z2: 12.4 },
  // C2
  { x1: -95.4, z1: -96.8, x2: -80.6, z2: -96.8 },
  { x1: -95.4, z1: -82.2, x2: -80.6, z2: -82.2 },
  { x1: -95.4, z1: -96.8, x2: -95.4, z2: -91.7 },
  { x1: -95.4, z1: -87.5, x2: -95.4, z2: -82.2 },
  { x1: -80.6, z1: -96.8, x2: -80.6, z2: -91.7 },
  { x1: -80.6, z1: -87.5, x2: -80.6, z2: -82.2 },
  // A1
  { x1: -82.8, z1: 82.4, x2: -82.8, z2: 95.6 },
  { x1: -68.2, z1: 82.4, x2: -68.2, z2: 95.6 },
  { x1: -82.8, z1: 82.4, x2: -77.6, z2: 82.4 },
  { x1: -73.4, z1: 82.4, x2: -68.2, z2: 82.4 },
  { x1: -82.8, z1: 95.6, x2: -77.6, z2: 95.6 },
  { x1: -73.4, z1: 95.6, x2: -68.2, z2: 95.6 },
]

const GATE_PILLARS: { x: number; z: number }[] = [
  { x: -230.1, z: 12.4 },
  { x: -225.9, z: 12.4 },
  { x: -95.4, z: -91.7 },
  { x: -95.4, z: -87.5 },
  { x: -80.6, z: -91.7 },
  { x: -80.6, z: -87.5 },
  { x: -77.6, z: 82.4 },
  { x: -73.4, z: 82.4 },
  { x: -77.6, z: 95.6 },
  { x: -73.4, z: 95.6 },
]

const TREES: TreeSpec[] = [
  // C1
  { x: -234.7, z: 15.8, scale: 1.05, kind: 'round', tone: 0 },
  { x: -234.7, z: 24.2, scale: 0.92, kind: 'conifer', tone: 1 },
  { x: -221.1, z: 15.8, scale: 0.95, kind: 'conifer', tone: 0 },
  { x: -221.1, z: 24.2, scale: 1.08, kind: 'round', tone: 2 },
  { x: -230.2, z: 13.15, scale: 0.64, kind: 'round', tone: 1 },
  { x: -226.1, z: 26.95, scale: 0.66, kind: 'conifer', tone: 2 },
  // C2
  { x: -92.8, z: -95.55, scale: 1.0, kind: 'round', tone: 1 },
  { x: -84.6, z: -95.55, scale: 0.9, kind: 'conifer', tone: 0 },
  { x: -92.9, z: -83.45, scale: 0.88, kind: 'conifer', tone: 1 },
  { x: -84.5, z: -83.45, scale: 1.02, kind: 'round', tone: 3 },
  // A1
  { x: -81.75, z: 86.2, scale: 0.98, kind: 'round', tone: 2 },
  { x: -81.75, z: 91.8, scale: 0.84, kind: 'conifer', tone: 1 },
  { x: -69.25, z: 86.2, scale: 0.82, kind: 'conifer', tone: 0 },
  { x: -69.25, z: 91.8, scale: 1.0, kind: 'round', tone: 1 },
]

const LAMPS: LampSpec[] = [
  // C1
  { x: -229.78, z: 15.65 },
  { x: -226.22, z: 17.0 },
  { x: -229.78, z: 23.7 },
  { x: -226.22, z: 26.2 },
  // C2
  { x: -91.5, z: -91.2 },
  { x: -88.1, z: -87.95 },
  { x: -84.7, z: -91.2 },
  { x: -81.95, z: -87.95 },
  // A1
  { x: -77.3, z: 87.3 },
  { x: -73.7, z: 90.7 },
  { x: -77.3, z: 94.25 },
  { x: -73.7, z: 84.15 },
]

const BENCHES: BenchSpec[] = [
  { x: -229.95, z: 20.2, rotation: Math.PI / 2 },
  { x: -226.05, z: 23.1, rotation: -Math.PI / 2 },
  { x: -94.85, z: -89.6, rotation: Math.PI / 2 },
  { x: -81.35, z: -89.6, rotation: -Math.PI / 2 },
  { x: -75.5, z: 82.9, rotation: 0 },
  { x: -75.5, z: 95.1, rotation: Math.PI },
]

const ROUND_TREE_COUNT = TREES.filter((tree) => tree.kind === 'round').length
const CONIFER_TREE_COUNT = TREES.length - ROUND_TREE_COUNT
const SHRUB_COUNT = HOUSE_COUNT * 3
const FOLIAGE_COUNT = ROUND_TREE_COUNT * 2 + SHRUB_COUNT
const FLOWER_COUNT = HOUSE_COUNT * 4
const WINDOW_COUNT = HOUSE_COUNT * 6
const DOOR_COUNT = HOUSE_COUNT * 2
const TRIM_COUNT = HOUSE_COUNT * 4 + WINDOW_COUNT * 4
const SIDEWALK_COUNT = LANES.length * 2
const PATH_TOTAL = HOUSE_COUNT + SIDEWALK_COUNT

function buildPaverLayout(): PaverSpec[] {
  const pavers: PaverSpec[] = []
  for (const lane of LANES) {
    const rows = Math.max(1, Math.round(lane.length / 0.72))
    const columns = 3
    const cellWidth = lane.width / columns
    const rowLength = lane.length / rows
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const along = -lane.length / 2 + (row + 0.5) * rowLength
        const across = -lane.width / 2 + (column + 0.5) * cellWidth
        pavers.push({
          x: lane.x + (lane.alongX ? along : across),
          z: lane.z + (lane.alongX ? across : along),
          rotation: lane.alongX ? Math.PI / 2 : 0,
          width: cellWidth - 0.045,
          length: rowLength - 0.045,
          tone: (row * 3 + column) % PAVER_COLORS_DAY.length,
        })
      }
    }
  }
  return pavers
}

function buildFenceLayout(segments: FenceSegmentSpec[]): { posts: FencePostSpec[]; rails: FenceRailSpec[] } {
  const posts: FencePostSpec[] = []
  const rails: FenceRailSpec[] = []
  for (const segment of segments) {
    const dx = segment.x2 - segment.x1
    const dz = segment.z2 - segment.z1
    const length = Math.hypot(dx, dz)
    const spans = Math.max(1, Math.round(length / 1.15))
    const step = length / spans
    const rotation = Math.atan2(dx, dz)
    for (let index = 0; index <= spans; index += 1) {
      const t = index / spans
      posts.push({ x: segment.x1 + dx * t, z: segment.z1 + dz * t })
    }
    for (let index = 0; index < spans; index += 1) {
      const t = (index + 0.5) / spans
      rails.push({
        x: segment.x1 + dx * t,
        z: segment.z1 + dz * t,
        rotation,
        length: Math.max(0.2, step - 0.06),
      })
    }
  }
  return { posts, rails }
}

const PAVERS = buildPaverLayout()
const FENCE = buildFenceLayout(FENCE_SEGMENTS)
const FENCE_POST_TOTAL = FENCE.posts.length + GATE_PILLARS.length
const FENCE_RAIL_TOTAL = FENCE.rails.length * 2

function createGableRoofGeometry(): THREE.BufferGeometry {
  const positions = new Float32Array([
    // front gable
    -0.5, 0, 0.5, 0.5, 0, 0.5, 0, 1, 0.5,
    // back gable
    -0.5, 0, -0.5, 0, 1, -0.5, 0.5, 0, -0.5,
    // left slope
    -0.5, 0, -0.5, 0, 1, 0.5, 0, 1, -0.5,
    -0.5, 0, -0.5, -0.5, 0, 0.5, 0, 1, 0.5,
    // right slope
    0.5, 0, -0.5, 0, 1, 0.5, 0.5, 0, 0.5,
    0.5, 0, -0.5, 0, 1, -0.5, 0, 1, 0.5,
    // underside
    -0.5, 0, -0.5, 0.5, 0, -0.5, 0.5, 0, 0.5,
    -0.5, 0, -0.5, 0.5, 0, 0.5, -0.5, 0, 0.5,
  ])
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()
  return geometry
}

const GABLE_ROOF_GEOMETRY = createGableRoofGeometry()

const GLOW_GEOMETRY = new THREE.CircleGeometry(1, 20)
GLOW_GEOMETRY.rotateX(-Math.PI / 2)

const PLACE_POSITION = new THREE.Vector3()
const PLACE_QUATERNION = new THREE.Quaternion()
const PLACE_EULER = new THREE.Euler()
const PLACE_SCALE = new THREE.Vector3()
const PLACE_PART = new THREE.Matrix4()
const PLACE_WORLD = new THREE.Matrix4()
const PLACE_COLOR = new THREE.Color()

function placeInstance(
  mesh: THREE.InstancedMesh,
  index: number,
  root: THREE.Matrix4 | null,
  x: number,
  y: number,
  z: number,
  sx: number,
  sy: number,
  sz: number,
  rotationY = 0,
  rotationZ = 0,
): void {
  PLACE_POSITION.set(x, y, z)
  PLACE_EULER.set(0, rotationY, rotationZ)
  PLACE_QUATERNION.setFromEuler(PLACE_EULER)
  PLACE_SCALE.set(sx, sy, sz)
  PLACE_PART.compose(PLACE_POSITION, PLACE_QUATERNION, PLACE_SCALE)
  if (root) {
    PLACE_WORLD.multiplyMatrices(root, PLACE_PART)
    mesh.setMatrixAt(index, PLACE_WORLD)
  } else {
    mesh.setMatrixAt(index, PLACE_PART)
  }
}

function tintInstance(mesh: THREE.InstancedMesh, index: number, color: string): void {
  mesh.setColorAt(index, PLACE_COLOR.set(color))
}

function markInstances(meshes: (THREE.InstancedMesh | null)[]): void {
  for (const mesh of meshes) {
    if (!mesh) continue
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }
}

function createGlowTexture(): THREE.DataTexture {
  const size = 64
  const data = new Uint8Array(size * size * 4)
  const center = (size - 1) / 2
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = (x - center) / center
      const dy = (y - center) / center
      const distance = Math.min(1, Math.hypot(dx, dy))
      const alpha = Math.pow(1 - distance, 2.4)
      const index = (y * size + x) * 4
      data[index] = 255
      data[index + 1] = 236
      data[index + 2] = 201
      data[index + 3] = Math.round(alpha * 255)
    }
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat)
  texture.needsUpdate = true
  texture.colorSpace = THREE.SRGBColorSpace
  texture.magFilter = THREE.LinearFilter
  texture.minFilter = THREE.LinearFilter
  return texture
}

export function Neighborhoods({ day = false }: { day?: boolean }) {
  const lawnRef = useRef<THREE.InstancedMesh>(null)
  const laneBaseRef = useRef<THREE.InstancedMesh>(null)
  const paverRef = useRef<THREE.InstancedMesh>(null)
  const curbRef = useRef<THREE.InstancedMesh>(null)
  const pathRef = useRef<THREE.InstancedMesh>(null)
  const patioRef = useRef<THREE.InstancedMesh>(null)
  const fencePostRef = useRef<THREE.InstancedMesh>(null)
  const fenceRailRef = useRef<THREE.InstancedMesh>(null)
  const bodyRef = useRef<THREE.InstancedMesh>(null)
  const roofRef = useRef<THREE.InstancedMesh>(null)
  const ridgeRef = useRef<THREE.InstancedMesh>(null)
  const foundationRef = useRef<THREE.InstancedMesh>(null)
  const paneRef = useRef<THREE.InstancedMesh>(null)
  const trimRef = useRef<THREE.InstancedMesh>(null)
  const doorRef = useRef<THREE.InstancedMesh>(null)
  const awningRef = useRef<THREE.InstancedMesh>(null)
  const stepRef = useRef<THREE.InstancedMesh>(null)
  const chimneyRef = useRef<THREE.InstancedMesh>(null)
  const mailboxPostRef = useRef<THREE.InstancedMesh>(null)
  const mailboxBoxRef = useRef<THREE.InstancedMesh>(null)
  const trunkRef = useRef<THREE.InstancedMesh>(null)
  const foliageRef = useRef<THREE.InstancedMesh>(null)
  const coniferRef = useRef<THREE.InstancedMesh>(null)
  const flowerRef = useRef<THREE.InstancedMesh>(null)
  const lampPoleRef = useRef<THREE.InstancedMesh>(null)
  const lampHeadRef = useRef<THREE.InstancedMesh>(null)
  const lampBulbRef = useRef<THREE.InstancedMesh>(null)
  const glowRef = useRef<THREE.InstancedMesh>(null)
  const benchSeatRef = useRef<THREE.InstancedMesh>(null)
  const benchBackRef = useRef<THREE.InstancedMesh>(null)
  const benchLegRef = useRef<THREE.InstancedMesh>(null)
  const glowTexture = useMemo(() => createGlowTexture(), [])

  useLayoutEffect(() => {
    const lawns = lawnRef.current
    const laneBases = laneBaseRef.current
    const pavers = paverRef.current
    const curbs = curbRef.current
    const paths = pathRef.current
    const patios = patioRef.current
    const fencePosts = fencePostRef.current
    const fenceRails = fenceRailRef.current
    if (!lawns || !laneBases || !pavers || !curbs || !paths || !patios || !fencePosts || !fenceRails) return

    LOTS.forEach((lot, index) => {
      placeInstance(lawns, index, null, lot.x, 0.0175, lot.z, lot.width, 0.035, lot.depth)
      tintInstance(lawns, index, day ? LAWN_COLORS_DAY[lot.tone] : LAWN_COLORS_NIGHT[lot.tone])
    })

    LANES.forEach((lane, index) => {
      placeInstance(
        laneBases,
        index,
        null,
        lane.x,
        0.03,
        lane.z,
        lane.alongX ? lane.length + 0.08 : lane.width + 0.08,
        0.04,
        lane.alongX ? lane.width + 0.08 : lane.length + 0.08,
      )
      const sideOffset = lane.width / 2 + 0.08
      for (const side of [-1, 1]) {
        placeInstance(
          curbs,
          index * 2 + (side < 0 ? 0 : 1),
          null,
          lane.x + (lane.alongX ? 0 : side * sideOffset),
          0.085,
          lane.z + (lane.alongX ? side * sideOffset : 0),
          lane.alongX ? lane.length + 0.16 : 0.16,
          0.14,
          lane.alongX ? 0.16 : lane.length + 0.16,
        )
      }
    })

    PAVERS.forEach((paver, index) => {
      placeInstance(pavers, index, null, paver.x, 0.075, paver.z, paver.width, 0.05, paver.length, paver.rotation)
      tintInstance(pavers, index, day ? PAVER_COLORS_DAY[paver.tone] : PAVER_COLORS_NIGHT[paver.tone])
    })

    const root = new THREE.Matrix4()
    HOUSES.forEach((house, index) => {
      root.makeRotationY(house.rotation)
      root.setPosition(house.x, 0, house.z)
      const walkLength = Math.max(0.35, house.frontSetback - 0.4)
      placeInstance(
        paths,
        index,
        root,
        0,
        0.045,
        HOUSE_DEPTH / 2 + 0.4 + walkLength / 2,
        0.82,
        0.04,
        walkLength,
      )
      placeInstance(patios, index, root, 0, 0.045, -HOUSE_DEPTH / 2 - 0.52, 1.45, 0.04, 0.85)
    })

    LANES.forEach((lane, laneIndex) => {
      const offset = lane.width / 2 + 0.34
      for (const side of [-1, 1]) {
        placeInstance(
          paths,
          HOUSE_COUNT + laneIndex * 2 + (side < 0 ? 0 : 1),
          null,
          lane.x + (lane.alongX ? 0 : side * offset),
          0.0425,
          lane.z + (lane.alongX ? side * offset : 0),
          lane.alongX ? lane.length + 0.08 : 0.36,
          0.035,
          lane.alongX ? 0.36 : lane.length + 0.08,
        )
      }
    })

    FENCE.posts.forEach((post, index) => {
      placeInstance(fencePosts, index, null, post.x, 0.4, post.z, 0.075, 0.72, 0.075)
      tintInstance(fencePosts, index, day ? '#d8d1bf' : '#565d58')
    })
    GATE_PILLARS.forEach((pillar, index) => {
      const instance = FENCE.posts.length + index
      placeInstance(fencePosts, instance, null, pillar.x, 0.5, pillar.z, 0.24, 0.92, 0.24)
      tintInstance(fencePosts, instance, day ? '#b7ad9b' : '#4b5250')
    })

    FENCE.rails.forEach((rail, index) => {
      for (let level = 0; level < 2; level += 1) {
        placeInstance(
          fenceRails,
          index * 2 + level,
          null,
          rail.x,
          level === 0 ? 0.34 : 0.6,
          rail.z,
          0.06,
          0.055,
          rail.length,
          rail.rotation,
        )
      }
    })

    markInstances([lawns, laneBases, pavers, curbs, paths, patios, fencePosts, fenceRails])
  }, [day])

  useLayoutEffect(() => {
    const bodies = bodyRef.current
    const roofs = roofRef.current
    const ridges = ridgeRef.current
    const foundations = foundationRef.current
    const panes = paneRef.current
    const trims = trimRef.current
    const doors = doorRef.current
    const awnings = awningRef.current
    const steps = stepRef.current
    const chimneys = chimneyRef.current
    const mailboxPosts = mailboxPostRef.current
    const mailboxBoxes = mailboxBoxRef.current
    if (
      !bodies ||
      !roofs ||
      !ridges ||
      !foundations ||
      !panes ||
      !trims ||
      !doors ||
      !awnings ||
      !steps ||
      !chimneys ||
      !mailboxPosts ||
      !mailboxBoxes
    ) {
      return
    }

    const root = new THREE.Matrix4()
    let windowIndex = 0
    let trimIndex = 0
    let chimneyIndex = 0

    HOUSES.forEach((house, houseIndex) => {
      root.makeRotationY(house.rotation)
      root.setPosition(house.x, 0, house.z)

      placeInstance(bodies, houseIndex, root, 0, FOUNDATION_HEIGHT + house.height / 2, 0, HOUSE_WIDTH, house.height, HOUSE_DEPTH)
      tintInstance(bodies, houseIndex, day ? BODY_COLORS_DAY[house.bodyTone] : BODY_COLORS_NIGHT[house.bodyTone])

      placeInstance(
        roofs,
        houseIndex,
        root,
        0,
        FOUNDATION_HEIGHT + house.height,
        0,
        HOUSE_WIDTH + 0.5,
        ROOF_RISE,
        HOUSE_DEPTH + 0.5,
      )
      tintInstance(roofs, houseIndex, day ? ROOF_COLORS_DAY[house.roofTone] : ROOF_COLORS_NIGHT[house.roofTone])

      placeInstance(ridges, houseIndex, root, 0, FOUNDATION_HEIGHT + house.height + ROOF_RISE + 0.035, 0, 0.14, 0.1, HOUSE_DEPTH + 0.46)
      tintInstance(ridges, houseIndex, day ? ROOF_COLORS_DAY[house.roofTone] : ROOF_COLORS_NIGHT[house.roofTone])

      placeInstance(foundations, houseIndex, root, 0, 0.08, 0, HOUSE_WIDTH + 0.14, 0.16, HOUSE_DEPTH + 0.14)

      placeInstance(doors, houseIndex, root, 0, 0.7, HOUSE_DEPTH / 2 + 0.07, 0.64, 1.08, 0.06)
      tintInstance(doors, houseIndex, day ? DOOR_COLORS_DAY[house.doorTone] : DOOR_COLORS_NIGHT[house.doorTone])

      placeInstance(doors, HOUSE_COUNT + houseIndex, root, 0, 0.7, -HOUSE_DEPTH / 2 - 0.07, 0.64, 1.08, 0.06)
      tintInstance(
        doors,
        HOUSE_COUNT + houseIndex,
        day
          ? DOOR_COLORS_DAY[(house.doorTone + 2) % DOOR_COLORS_DAY.length]
          : DOOR_COLORS_NIGHT[(house.doorTone + 2) % DOOR_COLORS_NIGHT.length],
      )

      placeInstance(awnings, houseIndex, root, 0, 1.58, HOUSE_DEPTH / 2 + 0.27, 1.18, 0.08, 0.62)
      placeInstance(steps, houseIndex, root, 0, 0.07, HOUSE_DEPTH / 2 + 0.2, 1.0, 0.14, 0.38)

      // marco de la puerta, marco trasero y mensulas del toldo
      placeInstance(trims, trimIndex, root, 0, 0.78, HOUSE_DEPTH / 2 + 0.035, 0.86, 1.3, 0.05)
      trimIndex += 1
      placeInstance(trims, trimIndex, root, 0, 0.78, -HOUSE_DEPTH / 2 - 0.035, 0.86, 1.3, 0.05)
      trimIndex += 1
      for (const side of [-1, 1]) {
        placeInstance(trims, trimIndex, root, side * 0.45, 1.42, HOUSE_DEPTH / 2 + 0.21, 0.05, 0.28, 0.05)
        trimIndex += 1
      }

      const windows: { x: number; y: number; z: number; rotation: number }[] = [
        { x: -0.77, y: 1.42, z: HOUSE_DEPTH / 2, rotation: 0 },
        { x: 0.77, y: 1.42, z: HOUSE_DEPTH / 2, rotation: 0 },
        { x: HOUSE_WIDTH / 2, y: 1.4, z: 0.25, rotation: Math.PI / 2 },
        { x: -HOUSE_WIDTH / 2, y: 1.4, z: 0.25, rotation: -Math.PI / 2 },
        { x: -0.82, y: 1.42, z: -HOUSE_DEPTH / 2, rotation: Math.PI },
        { x: 0.82, y: 1.42, z: -HOUSE_DEPTH / 2, rotation: Math.PI },
      ]

      windows.forEach((window, windowSlot) => {
        const nx = Math.sin(window.rotation)
        const nz = Math.cos(window.rotation)
        const warm = house.lit && (windowSlot < 2 || windowSlot >= 4)
        const warmColor = WINDOW_WARM_DAY[windowSlot % WINDOW_WARM_DAY.length]
        const coolColor = WINDOW_COOL_DAY[windowSlot % WINDOW_COOL_DAY.length]
        const warmNight = WINDOW_WARM_NIGHT[windowSlot % WINDOW_WARM_NIGHT.length]
        const coolNight = WINDOW_COOL_NIGHT[windowSlot % WINDOW_COOL_NIGHT.length]

        placeInstance(
          panes,
          windowIndex,
          root,
          window.x + nx * 0.07,
          window.y,
          window.z + nz * 0.07,
          0.5,
          0.52,
          0.035,
          window.rotation,
        )
        tintInstance(panes, windowIndex, day ? (warm ? warmColor : coolColor) : warm ? warmNight : coolNight)
        windowIndex += 1

        placeInstance(
          trims,
          trimIndex,
          root,
          window.x + nx * 0.035,
          window.y,
          window.z + nz * 0.035,
          0.66,
          0.68,
          0.06,
          window.rotation,
        )
        trimIndex += 1

        placeInstance(
          trims,
          trimIndex,
          root,
          window.x + nx * 0.1,
          window.y,
          window.z + nz * 0.1,
          0.035,
          0.5,
          0.03,
          window.rotation,
        )
        trimIndex += 1

        placeInstance(
          trims,
          trimIndex,
          root,
          window.x + nx * 0.1,
          window.y,
          window.z + nz * 0.1,
          0.5,
          0.035,
          0.03,
          window.rotation,
        )
        trimIndex += 1

        placeInstance(
          trims,
          trimIndex,
          root,
          window.x + nx * 0.085,
          window.y - 0.37,
          window.z + nz * 0.085,
          0.72,
          0.06,
          0.14,
          window.rotation,
        )
        trimIndex += 1
      })

      if (house.chimney) {
        const chimneyX = house.bodyTone % 2 === 0 ? 1 : -1
        placeInstance(
          chimneys,
          chimneyIndex,
          root,
          chimneyX * HOUSE_WIDTH * 0.28,
          FOUNDATION_HEIGHT + house.height + 0.74,
          -HOUSE_DEPTH * 0.16,
          0.3,
          0.8,
          0.3,
        )
        tintInstance(chimneys, chimneyIndex, day ? '#8c5c46' : '#3a2b25')
        chimneyIndex += 1
      }

      const mailboxDepth = HOUSE_DEPTH / 2 + house.frontSetback - 0.22
      placeInstance(mailboxPosts, houseIndex, root, 0.68, 0.43, mailboxDepth, 0.06, 0.86, 0.06)
      placeInstance(mailboxBoxes, houseIndex, root, 0.68, 0.94, mailboxDepth, 0.3, 0.24, 0.44)
      const mailboxTone = houseIndex % MAILBOX_COLORS_DAY.length
      tintInstance(mailboxBoxes, houseIndex, day ? MAILBOX_COLORS_DAY[mailboxTone] : MAILBOX_COLORS_NIGHT[mailboxTone])
    })

    markInstances([bodies, roofs, ridges, foundations, panes, trims, doors, awnings, steps, chimneys, mailboxPosts, mailboxBoxes])
  }, [day])

  useLayoutEffect(() => {
    const trunks = trunkRef.current
    const foliage = foliageRef.current
    const conifers = coniferRef.current
    const flowers = flowerRef.current
    const lampPoles = lampPoleRef.current
    const lampHeads = lampHeadRef.current
    const lampBulbs = lampBulbRef.current
    const glow = glowRef.current
    const benchSeats = benchSeatRef.current
    const benchBacks = benchBackRef.current
    const benchLegs = benchLegRef.current
    if (
      !trunks ||
      !foliage ||
      !conifers ||
      !flowers ||
      !lampPoles ||
      !lampHeads ||
      !lampBulbs ||
      !benchSeats ||
      !benchBacks ||
      !benchLegs
    ) {
      return
    }

    let foliageIndex = 0
    let coniferIndex = 0
    TREES.forEach((tree, treeIndex) => {
      const scale = tree.scale
      placeInstance(trunks, treeIndex, null, tree.x, 0.04 + 0.75 * scale, tree.z, scale, scale, scale)
      if (tree.kind === 'round') {
        placeInstance(
          foliage,
          foliageIndex,
          null,
          tree.x,
          0.04 + 1.78 * scale,
          tree.z,
          1.02 * scale,
          1.12 * scale,
          1.02 * scale,
          treeIndex * 0.7,
        )
        tintInstance(foliage, foliageIndex, day ? TREE_TONE_DAY[tree.tone] : TREE_TONE_NIGHT[tree.tone])
        foliageIndex += 1
        placeInstance(
          foliage,
          foliageIndex,
          null,
          tree.x + 0.34 * scale,
          0.04 + 1.55 * scale,
          tree.z + 0.18 * scale,
          0.64 * scale,
          0.7 * scale,
          0.64 * scale,
          treeIndex * 1.1,
        )
        tintInstance(
          foliage,
          foliageIndex,
          day ? TREE_TONE_DAY[(tree.tone + 1) % TREE_TONE_DAY.length] : TREE_TONE_NIGHT[(tree.tone + 1) % TREE_TONE_NIGHT.length],
        )
        foliageIndex += 1
      } else {
        placeInstance(
          conifers,
          coniferIndex,
          null,
          tree.x,
          0.04 + 1.28 * scale,
          tree.z,
          0.72 * scale,
          1.2 * scale,
          0.72 * scale,
          treeIndex * 0.5,
        )
        tintInstance(conifers, coniferIndex, day ? CONIFER_TONE_DAY[tree.tone % 3] : CONIFER_TONE_NIGHT[tree.tone % 3])
        coniferIndex += 1
        placeInstance(
          conifers,
          coniferIndex,
          null,
          tree.x,
          0.04 + 1.95 * scale,
          tree.z,
          0.52 * scale,
          0.9 * scale,
          0.52 * scale,
          treeIndex * 0.8,
        )
        tintInstance(
          conifers,
          coniferIndex,
          day ? CONIFER_TONE_DAY[(tree.tone + 1) % 3] : CONIFER_TONE_NIGHT[(tree.tone + 1) % 3],
        )
        coniferIndex += 1
      }
    })

    const root = new THREE.Matrix4()
    let flowerIndex = 0
    HOUSES.forEach((house, houseIndex) => {
      root.makeRotationY(house.rotation)
      root.setPosition(house.x, 0, house.z)
      const shrubTone = houseIndex % SHRUB_TONE_DAY.length
      const frontZ = HOUSE_DEPTH / 2 + house.frontSetback * 0.58
      for (const side of [-1, 1]) {
        placeInstance(
          foliage,
          foliageIndex,
          root,
          side * 1.02,
          0.24,
          frontZ,
          0.34 + (houseIndex % 3) * 0.02,
          0.3,
          0.34 + (houseIndex % 2) * 0.02,
          houseIndex * 0.4 + side,
        )
        tintInstance(
          foliage,
          foliageIndex,
          day ? SHRUB_TONE_DAY[(shrubTone + (side > 0 ? 1 : 0)) % SHRUB_TONE_DAY.length] : SHRUB_TONE_NIGHT[shrubTone],
        )
        foliageIndex += 1
      }
      placeInstance(
        foliage,
        foliageIndex,
        root,
        (house.bodyTone % 2 === 0 ? 1 : -1) * 0.92,
        0.22,
        -HOUSE_DEPTH / 2 - 0.95,
        0.32,
        0.28,
        0.32,
        houseIndex * 0.6,
      )
      tintInstance(foliage, foliageIndex, day ? SHRUB_TONE_DAY[(shrubTone + 2) % SHRUB_TONE_DAY.length] : SHRUB_TONE_NIGHT[shrubTone])
      foliageIndex += 1

      const flowerZ = HOUSE_DEPTH / 2 + house.frontSetback * 0.78
      ;[-0.95, -0.42, 0.42, 0.95].forEach((x, slot) => {
        placeInstance(flowers, flowerIndex, root, x, 0.13, flowerZ + (slot % 2) * 0.08, 1, 1, 1, slot * 0.6)
        tintInstance(flowers, flowerIndex, day ? FLOWER_COLORS_DAY[(houseIndex + slot) % FLOWER_COLORS_DAY.length] : FLOWER_COLORS_NIGHT[(houseIndex + slot) % FLOWER_COLORS_NIGHT.length])
        flowerIndex += 1
      })
    })

    LAMPS.forEach((lamp, index) => {
      placeInstance(lampPoles, index, null, lamp.x, 1.29, lamp.z, 1, 1, 1)
      placeInstance(lampHeads, index, null, lamp.x, 2.74, lamp.z, 1, 1, 1)
      placeInstance(lampBulbs, index, null, lamp.x, 2.62, lamp.z, 1, 1, 1)
      tintInstance(lampBulbs, index, day ? '#eee4cf' : '#ffd18a')
      if (!day && glow) {
        placeInstance(glow, index, null, lamp.x, 0.12, lamp.z, 2.8, 1, 2.8)
      }
    })

    BENCHES.forEach((bench, benchIndex) => {
      root.makeRotationY(bench.rotation)
      root.setPosition(bench.x, 0, bench.z)
      placeInstance(benchSeats, benchIndex, root, 0, 0.47, 0, 1.55, 0.09, 0.5)
      placeInstance(benchBacks, benchIndex, root, 0, 0.82, -0.24, 1.55, 0.42, 0.07)
      for (const side of [-1, 1]) {
        placeInstance(benchLegs, benchIndex * 2 + (side > 0 ? 1 : 0), root, side * 0.62, 0.235, 0, 0.12, 0.45, 0.46)
      }
    })

    markInstances([trunks, foliage, conifers, flowers, lampPoles, lampHeads, lampBulbs, glow, benchSeats, benchBacks, benchLegs])
  }, [day])

  return (
    <group name="neighborhoods">
      <instancedMesh ref={lawnRef} args={[undefined, undefined, LOTS.length]} receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ffffff" roughness={1} metalness={0} />
      </instancedMesh>

      <instancedMesh ref={laneBaseRef} args={[undefined, undefined, LANES.length]} receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={day ? '#6f6a5f' : '#232b2c'} roughness={0.96} metalness={0.02} />
      </instancedMesh>

      <instancedMesh ref={paverRef} args={[undefined, undefined, PAVERS.length]} receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.92} metalness={0.02} />
      </instancedMesh>

      <instancedMesh ref={curbRef} args={[undefined, undefined, LANES.length * 2]} receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={day ? '#c0b4a1' : '#4a514f'} roughness={0.88} metalness={0.03} />
      </instancedMesh>

      <instancedMesh ref={pathRef} args={[undefined, undefined, PATH_TOTAL]} receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={day ? '#c3b7a2' : '#3b4140'} roughness={0.93} metalness={0.02} />
      </instancedMesh>

      <instancedMesh ref={patioRef} args={[undefined, undefined, HOUSE_COUNT]} receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={day ? '#b3a892' : '#353b3a'} roughness={0.94} metalness={0.02} />
      </instancedMesh>

      <instancedMesh ref={fencePostRef} args={[undefined, undefined, FENCE_POST_TOTAL]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.82} metalness={0.02} />
      </instancedMesh>

      <instancedMesh ref={fenceRailRef} args={[undefined, undefined, FENCE_RAIL_TOTAL]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={day ? '#d8d1bf' : '#565d58'} roughness={0.82} metalness={0.02} />
      </instancedMesh>

      <instancedMesh ref={foundationRef} args={[undefined, undefined, HOUSE_COUNT]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={day ? '#a9a092' : '#373e3f'} roughness={0.92} metalness={0.02} />
      </instancedMesh>

      <instancedMesh ref={bodyRef} args={[undefined, undefined, HOUSE_COUNT]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.84} metalness={0.02} />
      </instancedMesh>

      <instancedMesh ref={roofRef} args={[undefined, undefined, HOUSE_COUNT]} castShadow frustumCulled={false}>
        <primitive attach="geometry" object={GABLE_ROOF_GEOMETRY} />
        <meshStandardMaterial color="#ffffff" roughness={0.72} metalness={0.06} flatShading />
      </instancedMesh>

      <instancedMesh ref={ridgeRef} args={[undefined, undefined, HOUSE_COUNT]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.68} metalness={0.08} />
      </instancedMesh>

      <instancedMesh ref={paneRef} args={[undefined, undefined, WINDOW_COUNT]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </instancedMesh>

      <instancedMesh ref={trimRef} args={[undefined, undefined, TRIM_COUNT]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={day ? '#ece6d8' : '#737973'} roughness={0.62} metalness={0.03} />
      </instancedMesh>

      <instancedMesh ref={doorRef} args={[undefined, undefined, DOOR_COUNT]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.72} metalness={0.03} />
      </instancedMesh>

      <instancedMesh ref={awningRef} args={[undefined, undefined, HOUSE_COUNT]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={day ? '#5f735f' : '#26332d'} roughness={0.82} metalness={0.02} />
      </instancedMesh>

      <instancedMesh ref={stepRef} args={[undefined, undefined, HOUSE_COUNT]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={day ? '#b9ae9b' : '#3a4140'} roughness={0.94} metalness={0.02} />
      </instancedMesh>

      <instancedMesh ref={chimneyRef} args={[undefined, undefined, CHIMNEY_COUNT]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} metalness={0.02} />
      </instancedMesh>

      <instancedMesh ref={mailboxPostRef} args={[undefined, undefined, HOUSE_COUNT]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={day ? '#5a5f5b' : '#2c3434'} roughness={0.62} metalness={0.42} />
      </instancedMesh>

      <instancedMesh ref={mailboxBoxRef} args={[undefined, undefined, HOUSE_COUNT]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.58} metalness={0.24} />
      </instancedMesh>

      <instancedMesh ref={trunkRef} args={[undefined, undefined, TREES.length]} castShadow>
        <cylinderGeometry args={[0.09, 0.14, 1.5, 6]} />
        <meshStandardMaterial color={day ? '#6a5540' : '#2c2821'} roughness={0.92} metalness={0} />
      </instancedMesh>

      <instancedMesh ref={foliageRef} args={[undefined, undefined, FOLIAGE_COUNT]} castShadow>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} metalness={0} flatShading />
      </instancedMesh>

      <instancedMesh ref={coniferRef} args={[undefined, undefined, CONIFER_TREE_COUNT * 2]} castShadow>
        <coneGeometry args={[1, 1, 7]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} metalness={0} flatShading />
      </instancedMesh>

      <instancedMesh ref={flowerRef} args={[undefined, undefined, FLOWER_COUNT]}>
        <icosahedronGeometry args={[0.09, 0]} />
        <meshStandardMaterial color="#ffffff" roughness={0.7} metalness={0} flatShading />
      </instancedMesh>

      <instancedMesh ref={lampPoleRef} args={[undefined, undefined, LAMPS.length]} castShadow>
        <cylinderGeometry args={[0.05, 0.075, 2.5, 6]} />
        <meshStandardMaterial color={day ? '#59625f' : '#2b3436'} roughness={0.55} metalness={0.5} />
      </instancedMesh>

      <instancedMesh ref={lampHeadRef} args={[undefined, undefined, LAMPS.length]} castShadow>
        <boxGeometry args={[0.3, 0.08, 0.3]} />
        <meshStandardMaterial color={day ? '#48524f' : '#20292c'} roughness={0.46} metalness={0.58} />
      </instancedMesh>

      <instancedMesh ref={lampBulbRef} args={[undefined, undefined, LAMPS.length]}>
        <sphereGeometry args={[0.085, 8, 8]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </instancedMesh>

      {!day && (
        <instancedMesh ref={glowRef} args={[undefined, undefined, LAMPS.length]}>
          <primitive attach="geometry" object={GLOW_GEOMETRY} />
          <meshBasicMaterial
            map={glowTexture}
            color="#ffd6a0"
            transparent
            opacity={0.5}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </instancedMesh>
      )}

      <instancedMesh ref={benchSeatRef} args={[undefined, undefined, BENCHES.length]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={day ? '#8c6d4c' : '#47382a'} roughness={0.78} metalness={0.04} />
      </instancedMesh>

      <instancedMesh ref={benchBackRef} args={[undefined, undefined, BENCHES.length]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={day ? '#8c6d4c' : '#47382a'} roughness={0.78} metalness={0.04} />
      </instancedMesh>

      <instancedMesh ref={benchLegRef} args={[undefined, undefined, BENCHES.length * 2]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={day ? '#586265' : '#293335'} roughness={0.56} metalness={0.5} />
      </instancedMesh>
    </group>
  )
}
