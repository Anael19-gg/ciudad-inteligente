import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { createGlowTexture } from '../../lib/textures'

const PARK_Z = -93
const GROUND_Y = 0.055
const PATH_Y = 0.07
const PLAZA_RADIUS = 4.2

type Vec2 = [number, number]
type Seed = [number, number, number]

type TreeSpec = {
  x: number
  z: number
  trunkHeight: number
  crownRadius: number
  rotation: number
  tiltX: number
  tiltZ: number
  shade: number
  palette: number
}

type ConiferSpec = {
  x: number
  z: number
  height: number
  radius: number
  rotation: number
  palette: number
}

type BenchSpec = {
  x: number
  z: number
  rotation: number
}

// Franjas de arbolado: dos bosques laterales, filas al norte y al sur,
// y cuatro ejemplares sueltos en las esquinas del claro central.
const DECIDUOUS_SEEDS: Seed[] = [
  // Bosque oeste
  [-21.6, -8.8, 1.08],
  [-21.1, -4.4, 0.96],
  [-21.6, 0.2, 1.14],
  [-21.0, 4.8, 1.0],
  [-21.5, 9.0, 0.92],
  [-18.2, -7.4, 1.05],
  [-17.8, -2.8, 0.9],
  [-18.4, 2.0, 1.12],
  [-17.9, 6.8, 0.98],
  [-14.9, -8.7, 0.94],
  [-15.3, -4.0, 1.1],
  [-14.6, 1.4, 0.88],
  [-15.1, 6.0, 1.06],
  // Bosque este
  [21.5, -8.9, 0.98],
  [21.0, -4.2, 1.1],
  [21.6, 0.4, 0.9],
  [21.1, 5.0, 1.06],
  [21.4, 9.1, 1.0],
  [18.0, -7.2, 1.12],
  [18.5, -2.6, 0.94],
  [17.9, 2.3, 1.04],
  [18.4, 6.6, 0.88],
  [14.8, -8.8, 1.0],
  [15.2, -3.8, 1.13],
  [14.7, 1.6, 0.92],
  [15.0, 6.2, 1.05],
  // Franja norte
  [-11.8, 9.1, 0.96],
  [-8.4, 9.3, 1.08],
  [-4.9, 9.0, 0.9],
  [-1.3, 9.3, 1.02],
  [2.1, 8.9, 0.94],
  [4.4, 9.2, 1.05],
  // Franja sur
  [-11.4, -9.0, 0.95],
  [-8.2, -9.2, 1.07],
  [0.4, -9.1, 1.0],
  [7.0, -9.0, 0.92],
  [10.4, -9.3, 1.04],
  // Acentos junto al claro
  [-11.9, 4.9, 0.82],
  [11.7, -4.7, 0.84],
  [-11.7, -5.1, 0.8],
  [11.9, 5.1, 0.86],
]

const CONIFER_SEEDS: Seed[] = [
  [-12.7, 6.4, 1.0],
  [12.7, 6.5, 0.92],
  [-13.9, -6.8, 1.05],
  [14.2, -6.6, 0.96],
  [6.9, 9.0, 0.86],
]

const BENCHES: BenchSpec[] = [
  { x: -8.0, z: 0.5, rotation: Math.PI / 2 },
  { x: 8.05, z: -0.7, rotation: -Math.PI / 2 },
  { x: -13.2, z: 4.4, rotation: Math.PI / 2 },
  { x: 13.2, z: -4.4, rotation: -Math.PI / 2 },
  { x: 4.0, z: -8.5, rotation: 0 },
]

const LAMPS: Vec2[] = [
  [-6.7, 2.7],
  [6.7, -2.7],
  [-5.9, -9.3],
  [12.9, 4.0],
]

const PLANTERS: Vec2[] = [
  [-1.5, -9.8],
  [-5.2, 3.1],
  [5.2, -3.1],
]

const SHRUBS: Seed[] = [
  // Borde norte
  [-21.0, 10.0, 0.5],
  [-17.2, 10.1, 0.44],
  [-13.4, 10.0, 0.52],
  [-9.8, 10.1, 0.46],
  [-6.2, 10.0, 0.5],
  [-2.4, 10.1, 0.42],
  [0.8, 10.0, 0.48],
  [3.4, 10.1, 0.44],
  [6.4, 10.0, 0.5],
  [11.4, 10.1, 0.46],
  [15.2, 10.0, 0.52],
  [18.8, 10.1, 0.44],
  [22.0, 10.0, 0.5],
  // Borde sur
  [-21.2, -10.0, 0.48],
  [-17.4, -10.1, 0.52],
  [-13.6, -10.0, 0.44],
  [-10.2, -10.1, 0.5],
  [-6.8, -10.0, 0.42],
  [1.4, -10.1, 0.5],
  [4.6, -10.0, 0.46],
  [8.0, -10.1, 0.52],
  [11.8, -10.0, 0.44],
  [15.4, -10.1, 0.5],
  [19.2, -10.0, 0.46],
  [22.2, -10.1, 0.42],
  // Bordes laterales
  [-22.9, -7.2, 0.44],
  [-22.9, -2.2, 0.5],
  [-22.9, 2.8, 0.42],
  [-22.9, 7.4, 0.48],
  [22.9, -7.6, 0.46],
  [22.9, -2.8, 0.4],
  [22.9, 2.4, 0.5],
  [22.9, 7.8, 0.44],
  // Grupos junto al sendero
  [-10.6, 6.9, 0.4],
  [10.8, -6.9, 0.42],
  [-10.9, -6.6, 0.4],
  [11.0, 6.7, 0.44],
]

const ROCKS: Seed[] = [
  [-20.4, -9.9, 0.34],
  [-10.4, 10.0, 0.3],
  [3.2, -10.0, 0.28],
  [16.8, 10.0, 0.3],
  [-23.0, 4.2, 0.26],
  [23.0, -4.6, 0.28],
  [-9.6, 6.9, 0.24],
  [9.8, -6.4, 0.25],
  [11.0, 6.4, 0.22],
  [-11.4, -6.2, 0.3],
  [19.0, -9.9, 0.26],
  [-17.8, 10.0, 0.22],
  [9.9, 9.8, 0.24],
  [-14.8, -10.0, 0.24],
]

const SOUTH_PATH: Vec2[] = [
  [-3.2, -10.35],
  [-3.6, -9.2],
  [-4.6, -7.6],
  [-5.7, -6.4],
  [-6.2, -5.6],
]

const NORTH_PATH: Vec2[] = [
  [8.4, 10.35],
  [9.0, 9.2],
  [8.2, 7.8],
  [6.4, 6.6],
  [5.4, 6.0],
]

const LEAF_DAY = ['#3f6538', '#4b7341', '#567e48', '#365a35', '#628a51', '#476b3b']
const LEAF_NIGHT = ['#2a5141', '#305a48', '#37634e', '#24483b', '#3e6c54', '#2c5342']
const LEAF_TIP_DAY = ['#5b834b', '#678f55', '#72975d', '#4f7744', '#7da268', '#587f49']
const LEAF_TIP_NIGHT = ['#356349', '#3b6b51', '#43775b', '#2e5945', '#4a7f62', '#376750']
const CONIFER_DAY = ['#3a5c3d', '#446745', '#345339', '#4e6b48']
const CONIFER_NIGHT = ['#1f4034', '#264a3b', '#1b392f', '#2b5040']
const TRUNK_DAY = ['#6b5945', '#5f4f3d', '#725e47', '#574735']
const TRUNK_NIGHT = ['#2b2a24', '#26251f', '#302d26', '#22221d']
const SHRUB_DAY = ['#4a7043', '#577f4c', '#42653c', '#648a56', '#3d5f37']
const SHRUB_NIGHT = ['#2a4f40', '#305748', '#244738', '#37604d', '#203f33']
const ROCK_DAY = ['#8a8f88', '#7d847e', '#949a92', '#737b75']
const ROCK_NIGHT = ['#3f4b4a', '#364240', '#485452', '#303b3a']

function hash(value: number) {
  const result = Math.sin(value * 127.1 + 311.7) * 43758.5453
  return result - Math.floor(result)
}

function makeOrganicEllipse(rx: number, rz: number, phase: number, clockwise = false) {
  const shape = new THREE.Shape()
  const segments = 72

  for (let index = 0; index <= segments; index += 1) {
    const step = clockwise ? segments - index : index
    const angle = (step / segments) * Math.PI * 2
    const wobble = 1 + Math.sin(angle * 3 + phase) * 0.012 + Math.cos(angle * 5 - phase) * 0.006
    const x = Math.cos(angle) * rx * wobble
    const y = Math.sin(angle) * rz * wobble

    if (index === 0) shape.moveTo(x, y)
    else shape.lineTo(x, y)
  }

  shape.closePath()
  return shape
}

function makeLoopPath() {
  const shape = makeOrganicEllipse(12.6, 7.4, 0.7)
  shape.holes.push(makeOrganicEllipse(10.6, 5.4, 1.8, true))
  return shape
}

function makeBlobShape(cx: number, cy: number, rx: number, rz: number, phase: number) {
  const shape = new THREE.Shape()
  const segments = 40

  for (let index = 0; index <= segments; index += 1) {
    const angle = (index / segments) * Math.PI * 2
    const wobble = 1 + Math.sin(angle * 3 + phase) * 0.14 + Math.cos(angle * 5 - phase) * 0.07
    const x = cx + Math.cos(angle) * rx * wobble
    const y = cy + Math.sin(angle) * rz * wobble

    if (index === 0) shape.moveTo(x, y)
    else shape.lineTo(x, y)
  }

  shape.closePath()
  return shape
}

function makeLawnPatches() {
  return [
    makeBlobShape(-16.6, -0.2, 5.4, 3.0, 0.4),
    makeBlobShape(16.9, -2.6, 5.0, 2.6, 1.8),
    makeBlobShape(2.8, 6.6, 3.6, 1.5, 3.1),
  ]
}

function makeRoundedRectShape(width: number, depth: number, radius: number) {
  const shape = new THREE.Shape()
  const x = -width / 2
  const y = -depth / 2

  shape.moveTo(x + radius, y)
  shape.lineTo(x + width - radius, y)
  shape.quadraticCurveTo(x + width, y, x + width, y + radius)
  shape.lineTo(x + width, y + depth - radius)
  shape.quadraticCurveTo(x + width, y + depth, x + width - radius, y + depth)
  shape.lineTo(x + radius, y + depth)
  shape.quadraticCurveTo(x, y + depth, x, y + depth - radius)
  shape.lineTo(x, y + radius)
  shape.quadraticCurveTo(x, y, x + radius, y)
  shape.closePath()
  return shape
}

function makeRibbonPath(points: Vec2[], width: number) {
  const curve = new THREE.CatmullRomCurve3(
    points.map(([x, z]) => new THREE.Vector3(x, 0, z)),
    false,
    'catmullrom',
    0.5,
  )
  const samples = curve.getPoints(40)
  const half = width / 2
  const positions: number[] = []
  const indices: number[] = []

  samples.forEach((sample, index) => {
    const previous = samples[Math.max(0, index - 1)]
    const next = samples[Math.min(samples.length - 1, index + 1)]
    const dx = next.x - previous.x
    const dz = next.z - previous.z
    const length = Math.hypot(dx, dz) || 1
    const normalX = -dz / length
    const normalZ = dx / length

    positions.push(sample.x + normalX * half, 0, sample.z + normalZ * half)
    positions.push(sample.x - normalX * half, 0, sample.z - normalZ * half)

    if (index < samples.length - 1) {
      const offset = index * 2
      indices.push(offset, offset + 2, offset + 1)
      indices.push(offset + 1, offset + 2, offset + 3)
    }
  })

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

function makeDeciduousTrees(): TreeSpec[] {
  return DECIDUOUS_SEEDS.map(([x, z, size], index) => {
    const shapedSize = size * (0.92 + hash(index + 19.3) * 0.16)

    return {
      x: x + (hash(index + 3.1) - 0.5) * 0.42,
      z: z + (hash(index + 7.7) - 0.5) * 0.42,
      trunkHeight: 2.0 + shapedSize * 0.8,
      crownRadius: 1.35 + shapedSize * 0.8,
      rotation: hash(index + 11.2) * Math.PI * 2,
      tiltX: (hash(index + 15.9) - 0.5) * 0.1,
      tiltZ: (hash(index + 23.4) - 0.5) * 0.1,
      shade: 0.88 + hash(index + 27.8) * 0.22,
      palette: Math.floor(hash(index + 33.5) * LEAF_DAY.length),
    }
  })
}

function makeConifers(): ConiferSpec[] {
  return CONIFER_SEEDS.map(([x, z, size], index) => ({
    x,
    z,
    height: 6.2 + size * 1.5 + hash(index + 41.2) * 0.5,
    radius: 1.25 + size * 0.35,
    rotation: hash(index + 47.1) * Math.PI * 2,
    palette: Math.floor(hash(index + 53.6) * CONIFER_DAY.length),
  }))
}

const DECIDUOUS_TREES = makeDeciduousTrees()
const CONIFERS = makeConifers()

function Trees({ day }: { day: boolean }) {
  const trunkRef = useRef<THREE.InstancedMesh>(null)
  const canopyRef = useRef<THREE.InstancedMesh>(null)
  const crownRef = useRef<THREE.InstancedMesh>(null)
  const coniferRef = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    const trunks = trunkRef.current
    const canopies = canopyRef.current
    const crowns = crownRef.current
    const cones = coniferRef.current
    if (!trunks || !canopies || !crowns || !cones) return

    const matrix = new THREE.Matrix4()
    const position = new THREE.Vector3()
    const quaternion = new THREE.Quaternion()
    const scale = new THREE.Vector3()
    const euler = new THREE.Euler()
    const color = new THREE.Color()
    const tipColor = new THREE.Color()
    const leafPalette = day ? LEAF_DAY : LEAF_NIGHT
    const tipPalette = day ? LEAF_TIP_DAY : LEAF_TIP_NIGHT
    const coniferPalette = day ? CONIFER_DAY : CONIFER_NIGHT
    const trunkPalette = day ? TRUNK_DAY : TRUNK_NIGHT

    DECIDUOUS_TREES.forEach((tree, index) => {
      const trunkGirth = 0.86 + tree.palette * 0.055
      position.set(tree.x, GROUND_Y + tree.trunkHeight * 0.5, tree.z)
      quaternion.setFromEuler(euler.set(tree.tiltX, tree.rotation, tree.tiltZ))
      scale.set(trunkGirth, tree.trunkHeight, trunkGirth)
      matrix.compose(position, quaternion, scale)
      trunks.setMatrixAt(index, matrix)
      trunks.setColorAt(index, color.set(trunkPalette[(index + tree.palette) % trunkPalette.length]))

      position.set(tree.x, GROUND_Y + tree.trunkHeight + tree.crownRadius * 0.58, tree.z)
      quaternion.setFromEuler(euler.set(tree.tiltX * 0.35, tree.rotation, tree.tiltZ * 0.35))
      scale.set(tree.crownRadius * 1.12, tree.crownRadius * 0.92, tree.crownRadius * 1.04)
      matrix.compose(position, quaternion, scale)
      canopies.setMatrixAt(index, matrix)
      canopies.setColorAt(
        index,
        color.set(leafPalette[(index + tree.palette) % leafPalette.length]).multiplyScalar(tree.shade),
      )

      position.set(
        tree.x + Math.cos(tree.rotation + 1.2) * tree.crownRadius * 0.42,
        GROUND_Y + tree.trunkHeight + tree.crownRadius * 1.14,
        tree.z + Math.sin(tree.rotation + 1.2) * tree.crownRadius * 0.42,
      )
      quaternion.setFromEuler(euler.set(tree.tiltZ * 0.2, tree.rotation + 0.7, tree.tiltX * 0.2))
      scale.set(tree.crownRadius * 0.64, tree.crownRadius * 0.54, tree.crownRadius * 0.62)
      matrix.compose(position, quaternion, scale)
      crowns.setMatrixAt(index, matrix)
      crowns.setColorAt(
        index,
        tipColor
          .set(tipPalette[(index + tree.palette + 2) % tipPalette.length])
          .lerp(color.set(leafPalette[(index + tree.palette) % leafPalette.length]), 0.22)
          .multiplyScalar(tree.shade),
      )
    })

    CONIFERS.forEach((tree, index) => {
      const trunkIndex = DECIDUOUS_TREES.length + index
      position.set(tree.x, GROUND_Y + 0.65, tree.z)
      quaternion.setFromEuler(euler.set(0, tree.rotation, 0))
      scale.set(0.8, 1.3, 0.8)
      matrix.compose(position, quaternion, scale)
      trunks.setMatrixAt(trunkIndex, matrix)
      trunks.setColorAt(trunkIndex, color.set(trunkPalette[(trunkIndex + tree.palette) % trunkPalette.length]))

      const baseY = GROUND_Y + 0.8
      const lowerHeight = tree.height * 0.62
      const upperHeight = tree.height * 0.5
      const upperBase = baseY + tree.height * 0.34

      position.set(tree.x, baseY + lowerHeight * 0.5, tree.z)
      quaternion.setFromEuler(euler.set(0, tree.rotation, 0))
      scale.set(tree.radius, lowerHeight, tree.radius)
      matrix.compose(position, quaternion, scale)
      cones.setMatrixAt(index * 2, matrix)
      cones.setColorAt(
        index * 2,
        color.set(coniferPalette[tree.palette]).multiplyScalar(0.9 + hash(index + 61.4) * 0.16),
      )

      position.set(tree.x, upperBase + upperHeight * 0.5, tree.z)
      quaternion.setFromEuler(euler.set(0, tree.rotation + 0.3, 0))
      scale.set(tree.radius * 0.72, upperHeight, tree.radius * 0.72)
      matrix.compose(position, quaternion, scale)
      cones.setMatrixAt(index * 2 + 1, matrix)
      cones.setColorAt(
        index * 2 + 1,
        tipColor.set(coniferPalette[(tree.palette + 1) % coniferPalette.length]),
      )
    })

    trunks.instanceMatrix.needsUpdate = true
    canopies.instanceMatrix.needsUpdate = true
    crowns.instanceMatrix.needsUpdate = true
    cones.instanceMatrix.needsUpdate = true
    if (trunks.instanceColor) trunks.instanceColor.needsUpdate = true
    if (canopies.instanceColor) canopies.instanceColor.needsUpdate = true
    if (crowns.instanceColor) crowns.instanceColor.needsUpdate = true
    if (cones.instanceColor) cones.instanceColor.needsUpdate = true
  }, [day])

  return (
    <group>
      <instancedMesh
        ref={trunkRef}
        args={[undefined, undefined, DECIDUOUS_TREES.length + CONIFERS.length]}
        castShadow
      >
        <cylinderGeometry args={[0.13, 0.18, 1, 6]} />
        <meshStandardMaterial color="#ffffff" roughness={0.92} flatShading />
      </instancedMesh>
      <instancedMesh ref={canopyRef} args={[undefined, undefined, DECIDUOUS_TREES.length]} castShadow>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} flatShading />
      </instancedMesh>
      <instancedMesh ref={crownRef} args={[undefined, undefined, DECIDUOUS_TREES.length]} castShadow>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.88} flatShading />
      </instancedMesh>
      <instancedMesh ref={coniferRef} args={[undefined, undefined, CONIFERS.length * 2]} castShadow>
        <coneGeometry args={[1, 1, 8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.94} flatShading />
      </instancedMesh>
    </group>
  )
}

function Shrubs({ day }: { day: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return

    const matrix = new THREE.Matrix4()
    const position = new THREE.Vector3()
    const quaternion = new THREE.Quaternion()
    const scale = new THREE.Vector3()
    const euler = new THREE.Euler()
    const color = new THREE.Color()
    const palette = day ? SHRUB_DAY : SHRUB_NIGHT

    SHRUBS.forEach(([x, z, size], index) => {
      position.set(x, GROUND_Y + size * 0.32, z)
      quaternion.setFromEuler(euler.set(0, hash(index + 5.4) * Math.PI * 2, 0))
      scale.set(size * 1.2, size * 0.68, size * 0.95)
      matrix.compose(position, quaternion, scale)
      mesh.setMatrixAt(index, matrix)
      mesh.setColorAt(
        index,
        color.set(palette[index % palette.length]).multiplyScalar(0.9 + hash(index + 9.2) * 0.2),
      )
    })

    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [day])

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, SHRUBS.length]} castShadow receiveShadow>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#ffffff" roughness={0.9} flatShading />
    </instancedMesh>
  )
}

function Rocks({ day }: { day: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return

    const matrix = new THREE.Matrix4()
    const position = new THREE.Vector3()
    const quaternion = new THREE.Quaternion()
    const scale = new THREE.Vector3()
    const euler = new THREE.Euler()
    const color = new THREE.Color()
    const palette = day ? ROCK_DAY : ROCK_NIGHT

    ROCKS.forEach(([x, z, size], index) => {
      position.set(x, GROUND_Y + size * 0.24, z)
      quaternion.setFromEuler(euler.set(index * 0.4, index * 1.13, index * 0.2))
      scale.set(size * 1.1, size * 0.66, size * 0.9)
      matrix.compose(position, quaternion, scale)
      mesh.setMatrixAt(index, matrix)
      mesh.setColorAt(index, color.set(palette[index % palette.length]))
    })

    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [day])

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, ROCKS.length]} castShadow receiveShadow>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#ffffff" roughness={0.96} flatShading />
    </instancedMesh>
  )
}

function Benches({ day }: { day: boolean }) {
  const seatRef = useRef<THREE.InstancedMesh>(null)
  const backRef = useRef<THREE.InstancedMesh>(null)
  const legRef = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    const seats = seatRef.current
    const backs = backRef.current
    const legs = legRef.current
    if (!seats || !backs || !legs) return

    const root = new THREE.Matrix4()
    const result = new THREE.Matrix4()
    const position = new THREE.Vector3()
    const quaternion = new THREE.Quaternion()
    const one = new THREE.Vector3(1, 1, 1)
    const backTilt = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.12, 0, 0))
    const backLocal = new THREE.Matrix4().compose(new THREE.Vector3(0, 0.77, -0.22), backTilt, one)
    const seatLocal = new THREE.Matrix4().makeTranslation(0, 0.45, 0)
    const leftLegLocal = new THREE.Matrix4().makeTranslation(-0.66, 0.2, 0)
    const rightLegLocal = new THREE.Matrix4().makeTranslation(0.66, 0.2, 0)

    BENCHES.forEach((bench, index) => {
      position.set(bench.x, GROUND_Y, bench.z)
      quaternion.setFromEuler(new THREE.Euler(0, bench.rotation, 0))
      root.compose(position, quaternion, one)

      result.multiplyMatrices(root, seatLocal)
      seats.setMatrixAt(index, result)

      result.multiplyMatrices(root, backLocal)
      backs.setMatrixAt(index, result)

      result.multiplyMatrices(root, leftLegLocal)
      legs.setMatrixAt(index * 2, result)

      result.multiplyMatrices(root, rightLegLocal)
      legs.setMatrixAt(index * 2 + 1, result)
    })

    seats.instanceMatrix.needsUpdate = true
    backs.instanceMatrix.needsUpdate = true
    legs.instanceMatrix.needsUpdate = true
  }, [])

  const wood = day ? '#87684a' : '#48382b'
  const metal = day ? '#5c6868' : '#2c393b'

  return (
    <group>
      <instancedMesh ref={seatRef} args={[undefined, undefined, BENCHES.length]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.08, 0.52]} />
        <meshStandardMaterial color={wood} roughness={0.82} metalness={0.06} />
      </instancedMesh>
      <instancedMesh ref={backRef} args={[undefined, undefined, BENCHES.length]} castShadow>
        <boxGeometry args={[1.8, 0.4, 0.07]} />
        <meshStandardMaterial color={wood} roughness={0.82} metalness={0.06} />
      </instancedMesh>
      <instancedMesh ref={legRef} args={[undefined, undefined, BENCHES.length * 2]} castShadow>
        <boxGeometry args={[0.1, 0.4, 0.45]} />
        <meshStandardMaterial color={metal} roughness={0.55} metalness={0.55} />
      </instancedMesh>
    </group>
  )
}

function Lamps({ day }: { day: boolean }) {
  const poleRef = useRef<THREE.InstancedMesh>(null)
  const headRef = useRef<THREE.InstancedMesh>(null)
  const bulbRef = useRef<THREE.InstancedMesh>(null)
  const glowRef = useRef<THREE.InstancedMesh>(null)
  const glowTexture = useMemo(() => createGlowTexture(), [])

  useLayoutEffect(() => {
    const poles = poleRef.current
    const heads = headRef.current
    const bulbs = bulbRef.current
    const glows = glowRef.current
    if (!poles || !heads || !bulbs || !glows) return

    const matrix = new THREE.Matrix4()
    const position = new THREE.Vector3()
    const quaternion = new THREE.Quaternion()
    const one = new THREE.Vector3(1, 1, 1)
    const flat = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0))
    const color = new THREE.Color()

    LAMPS.forEach(([x, z], index) => {
      position.set(x, GROUND_Y + 1.35, z)
      matrix.compose(position, quaternion, one)
      poles.setMatrixAt(index, matrix)

      position.set(x, GROUND_Y + 2.82, z)
      matrix.compose(position, quaternion, one)
      heads.setMatrixAt(index, matrix)

      position.set(x, GROUND_Y + 2.67, z)
      matrix.compose(position, quaternion, one)
      bulbs.setMatrixAt(index, matrix)
      bulbs.setColorAt(index, color.set(day ? '#f2e7d1' : '#ffdca6'))

      position.set(x, GROUND_Y + 0.008, z)
      matrix.compose(position, flat, one)
      glows.setMatrixAt(index, matrix)
    })

    poles.instanceMatrix.needsUpdate = true
    heads.instanceMatrix.needsUpdate = true
    bulbs.instanceMatrix.needsUpdate = true
    glows.instanceMatrix.needsUpdate = true
    if (bulbs.instanceColor) bulbs.instanceColor.needsUpdate = true
  }, [day])

  const metal = day ? '#677275' : '#354247'

  return (
    <group>
      <instancedMesh ref={poleRef} args={[undefined, undefined, LAMPS.length]} castShadow>
        <cylinderGeometry args={[0.055, 0.09, 2.7, 8]} />
        <meshStandardMaterial color={metal} roughness={0.5} metalness={0.55} />
      </instancedMesh>
      <instancedMesh ref={headRef} args={[undefined, undefined, LAMPS.length]} castShadow>
        <cylinderGeometry args={[0.1, 0.24, 0.28, 6]} />
        <meshStandardMaterial color={metal} roughness={0.42} metalness={0.6} />
      </instancedMesh>
      <instancedMesh ref={bulbRef} args={[undefined, undefined, LAMPS.length]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={glowRef} args={[undefined, undefined, LAMPS.length]}>
        <planeGeometry args={[3.4, 3.4]} />
        <meshBasicMaterial
          map={glowTexture}
          color={day ? '#ffe8c2' : '#ffcf8a'}
          transparent
          opacity={day ? 0.05 : 0.4}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </instancedMesh>
    </group>
  )
}

function Planters({ day }: { day: boolean }) {
  const potRef = useRef<THREE.InstancedMesh>(null)
  const foliageRef = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    const pots = potRef.current
    const foliage = foliageRef.current
    if (!pots || !foliage) return

    const matrix = new THREE.Matrix4()
    const position = new THREE.Vector3()
    const quaternion = new THREE.Quaternion()
    const scale = new THREE.Vector3()
    const euler = new THREE.Euler()
    const color = new THREE.Color()
    const palette = day ? LEAF_TIP_DAY : LEAF_TIP_NIGHT

    PLANTERS.forEach(([x, z], index) => {
      position.set(x, GROUND_Y + 0.275, z)
      quaternion.identity()
      scale.set(1, 1, 1)
      matrix.compose(position, quaternion, scale)
      pots.setMatrixAt(index, matrix)

      position.set(x, GROUND_Y + 0.83, z)
      quaternion.setFromEuler(euler.set(0, hash(index + 13.7) * Math.PI * 2, 0))
      scale.set(0.38, 0.34, 0.38)
      matrix.compose(position, quaternion, scale)
      foliage.setMatrixAt(index * 3, matrix)
      foliage.setColorAt(index * 3, color.set(palette[index % palette.length]))

      position.set(x + 0.27, GROUND_Y + 0.72, z - 0.12)
      quaternion.setFromEuler(euler.set(0, hash(index + 17.9) * Math.PI * 2, 0))
      scale.set(0.25, 0.22, 0.25)
      matrix.compose(position, quaternion, scale)
      foliage.setMatrixAt(index * 3 + 1, matrix)
      foliage.setColorAt(index * 3 + 1, color.set(palette[(index + 2) % palette.length]))

      position.set(x - 0.22, GROUND_Y + 0.67, z + 0.18)
      quaternion.setFromEuler(euler.set(0, hash(index + 21.4) * Math.PI * 2, 0))
      scale.set(0.21, 0.19, 0.21)
      matrix.compose(position, quaternion, scale)
      foliage.setMatrixAt(index * 3 + 2, matrix)
      foliage.setColorAt(index * 3 + 2, color.set(palette[(index + 4) % palette.length]))
    })

    pots.instanceMatrix.needsUpdate = true
    foliage.instanceMatrix.needsUpdate = true
    if (foliage.instanceColor) foliage.instanceColor.needsUpdate = true
  }, [day])

  return (
    <group>
      <instancedMesh ref={potRef} args={[undefined, undefined, PLANTERS.length]} castShadow receiveShadow>
        <cylinderGeometry args={[0.45, 0.34, 0.55, 12]} />
        <meshStandardMaterial color={day ? '#9c7257' : '#533d31'} roughness={0.84} />
      </instancedMesh>
      <instancedMesh ref={foliageRef} args={[undefined, undefined, PLANTERS.length * 3]} castShadow>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.86} flatShading />
      </instancedMesh>
    </group>
  )
}

function Fountain({ day }: { day: boolean }) {
  const stone = day ? '#b5afa0' : '#4b5653'
  const darkStone = day ? '#827c6f' : '#323d3c'
  const water = day ? '#86d3cf' : '#245d69'
  const emissive = day ? '#1e6b74' : '#2b7f8c'

  return (
    <group position={[0, PATH_Y, 0]}>
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.78, 1.86, 0.4, 20]} />
        <meshStandardMaterial color={darkStone} roughness={0.78} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[1.5, 1.5, 0.05, 20]} />
        <meshStandardMaterial
          color={water}
          roughness={0.14}
          metalness={0.2}
          emissive={emissive}
          emissiveIntensity={day ? 0.08 : 0.34}
          transparent
          opacity={0.9}
        />
      </mesh>
      <mesh position={[0, 0.85, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.24, 0.9, 10]} />
        <meshStandardMaterial color={stone} roughness={0.72} metalness={0.06} />
      </mesh>
      <mesh position={[0, 1.39, 0]} castShadow>
        <cylinderGeometry args={[0.62, 0.18, 0.18, 18]} />
        <meshStandardMaterial color={stone} roughness={0.7} metalness={0.06} />
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.52, 0.52, 0.04, 18]} />
        <meshStandardMaterial
          color={water}
          roughness={0.14}
          metalness={0.2}
          emissive={emissive}
          emissiveIntensity={day ? 0.08 : 0.34}
          transparent
          opacity={0.88}
        />
      </mesh>
      <mesh position={[0, 1.76, 0]}>
        <cylinderGeometry args={[0.025, 0.05, 0.52, 8]} />
        <meshStandardMaterial
          color={water}
          roughness={0.12}
          metalness={0.15}
          emissive={emissive}
          emissiveIntensity={day ? 0.1 : 0.4}
          transparent
          opacity={0.72}
        />
      </mesh>
    </group>
  )
}

export function ForestPark({ day = false }: { day?: boolean }) {
  const baseShape = useMemo(() => makeRoundedRectShape(47.6, 21, 1.1), [])
  const lawnShape = useMemo(() => makeRoundedRectShape(46.4, 19.8, 0.9), [])
  const loopShape = useMemo(() => makeLoopPath(), [])
  const lawnPatches = useMemo(() => makeLawnPatches(), [])
  const southPath = useMemo(() => makeRibbonPath(SOUTH_PATH, 1.8), [])
  const northPath = useMemo(() => makeRibbonPath(NORTH_PATH, 1.8), [])

  return (
    <group position={[0, 0, PARK_Z]}>
      {/* Borde de piedra y césped */}
      <mesh position={[0, 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <shapeGeometry args={[baseShape, 24]} />
        <meshStandardMaterial color={day ? '#a8a394' : '#46504d'} roughness={0.9} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.055, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <shapeGeometry args={[lawnShape, 24]} />
        <meshStandardMaterial color={day ? '#5c7d52' : '#233f36'} roughness={0.96} metalness={0.02} />
      </mesh>
      <mesh position={[0, 0.061, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <shapeGeometry args={[lawnPatches, 24]} />
        <meshStandardMaterial color={day ? '#6f9261' : '#294739'} roughness={0.97} metalness={0.01} />
      </mesh>

      {/* Sendero en bucle y accesos al norte y al sur */}
      <mesh position={[0, PATH_Y, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <shapeGeometry args={[loopShape, 48]} />
        <meshStandardMaterial color={day ? '#c8bda3' : '#66655a'} roughness={0.95} metalness={0.03} />
      </mesh>
      <mesh geometry={southPath} position={[0, PATH_Y + 0.0008, 0]} receiveShadow>
        <meshStandardMaterial color={day ? '#c8bda3' : '#66655a'} roughness={0.95} metalness={0.03} />
      </mesh>
      <mesh geometry={northPath} position={[0, PATH_Y + 0.0008, 0]} receiveShadow>
        <meshStandardMaterial color={day ? '#c8bda3' : '#66655a'} roughness={0.95} metalness={0.03} />
      </mesh>

      {/* Claro central */}
      <mesh position={[0, PATH_Y, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[PLAZA_RADIUS, 28]} />
        <meshStandardMaterial color={day ? '#b7b2a3' : '#5f6561'} roughness={0.9} metalness={0.05} />
      </mesh>
      <mesh position={[0, PATH_Y + 0.0015, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[PLAZA_RADIUS, PLAZA_RADIUS + 0.32, 32]} />
        <meshStandardMaterial color={day ? '#928c7e' : '#46504d'} roughness={0.88} metalness={0.08} />
      </mesh>
      <Fountain day={day} />

      <Trees day={day} />
      <Shrubs day={day} />
      <Rocks day={day} />
      <Benches day={day} />
      <Lamps day={day} />
      <Planters day={day} />
    </group>
  )
}
