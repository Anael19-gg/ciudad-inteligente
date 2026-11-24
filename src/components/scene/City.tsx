import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Edges, Line, RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { createAsphaltTexture, createFacadeTexture, createGlowTexture, createSolarTexture, createWindowTexture } from '../../lib/textures'
import { TrafficVehicles } from './TrafficVehicles'
import { Pedestrians } from './Pedestrians'
import { AirTraffic } from './AirTraffic'
import { SignatureBuildings } from './SignatureBuildings'
import { Decorations } from './Decorations'
import type { Vec3 } from '../../data/project'

function makeRng(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface BuildingSpec {
  x: number
  z: number
  w: number
  d: number
  h: number
  zone: 'a' | 'b' | 'c'
  tint: string
  outer?: boolean
}

const ZONE_TINTS = {
  a: ['#1d2b37', '#243440', '#182531', '#2a3843', '#20303a'],
  b: ['#292c40', '#313450', '#232638', '#363a55', '#2c3046'],
  c: ['#2b2822', '#332e27', '#211f1a', '#363028', '#28251f'],
}

export const CITY_WIDTH = 480
export const CITY_DEPTH = 300
const VERTICAL_ROADS = [-180, -140, -100, -62, -28, 28, 62, 100, 140, 180]
const HORIZONTAL_ROADS = [-144, -110, -78, -48, 0, 48, 78, 110, 144]

const RING_RX = 208
const RING_RZ = 128
const RING_WIDTH = 14

const ROUNDABOUTS = [
  { x: RING_RX, z: 0 },
  { x: -RING_RX, z: 0 },
  { x: 0, z: RING_RZ },
  { x: 0, z: -RING_RZ },
]

const RING_INNER_X = 196.6
const RING_INNER_Z = 121
const RING_OUTER_X = 219.4
const RING_OUTER_Z = 135

function isOnTransport(x: number, z: number) {
  if (Math.abs(z) < 7.8) return true
  if (VERTICAL_ROADS.some((road) => Math.abs(x - road) < 5.2)) return true
  if (HORIZONTAL_ROADS.some((road) => road !== 0 && Math.abs(z - road) < 5)) return true
  const inner = (x / RING_INNER_X) ** 2 + (z / RING_INNER_Z) ** 2
  const outer = (x / RING_OUTER_X) ** 2 + (z / RING_OUTER_Z) ** 2
  if (inner >= 1 && outer <= 1) return true
  if (ROUNDABOUTS.some((roundabout) => Math.hypot(x - roundabout.x, z - roundabout.z) < 24)) return true
  return false
}

const TREE_BLOCKERS = [
  { x: -156, z: 68, r: 8 },
  { x: -165, z: 100, r: 10 },
  { x: -160, z: 35, r: 14 },
  { x: 45, z: 101, r: 8 },
  { x: 92, z: 30, r: 7 },
  { x: -48, z: 67, r: 4.5 },
  { x: 48, z: -67, r: 4.5 },
  { x: -45, z: -95, r: 4.5 },
  { x: 200, z: 120, r: 4.5 },
  { x: -214, z: -60, r: 5 },
  { x: 0, z: 94, r: 18 },
  { x: 45, z: -95, r: 15 },
  { x: 158, z: 92, r: 15 },
  { x: 205, z: 93, r: 20 },
  { x: -160, z: 57, r: 9 },
  { x: -154, z: -64, r: 9 },
  { x: -205, z: 118, r: 9 },
  { x: -112, z: 92, r: 9 },
  { x: -198, z: -70, r: 9 },
  { x: 7, z: 12.7, r: 3.5 },
  { x: -8, z: -12.7, r: 3.5 },
  { x: -68, z: 12.7, r: 3.5 },
  { x: -40, z: -12.7, r: 3.5 },
  { x: 40, z: 12.7, r: 3.5 },
  { x: 68, z: -12.7, r: 3.5 },
  { x: -120, z: -12.7, r: 3.5 },
  { x: -160, z: 12.7, r: 3.5 },
  { x: -80, z: -12.7, r: 3.5 },
  { x: 80, z: 12.7, r: 3.5 },
  { x: 120, z: -12.7, r: 3.5 },
  { x: 160, z: -12.7, r: 3.5 },
]

const SPECIAL_TOWERS = [
  { x: 128, z: 66, h: 44, r: 4.4 },
  { x: -128, z: 66, h: 38, r: 4.1 },
  { x: 128, z: -66, h: 40, r: 3.9 },
  { x: -128, z: -66, h: 34, r: 4.3 },
  { x: 70, z: 100, h: 30, r: 3.5 },
  { x: -70, z: -100, h: 32, r: 3.7 },
  { x: 160, z: 20, h: 36, r: 3.6 },
  { x: -160, z: -20, h: 28, r: 3.4 },
]

const OUTER_CLEARINGS = [
  { x: -215, z: 92, r: 34 },
  { x: -200, z: -112, r: 28 },
  { x: -140, z: 126, r: 22 },
  { x: -118, z: -28, r: 26 },
  { x: -118, z: 26, r: 25 },
  { x: -118, z: 70, r: 16 },
  { x: -165, z: -95, r: 17 },
  { x: -190, z: 35, r: 20 },
  { x: -158, z: 90, r: 15 },
  { x: 120, z: -36, r: 18 },
  { x: 160, z: -30, r: 22 },
  { x: 150, z: 62, r: 15 },
  { x: -70, z: 62, r: 9 },
  { x: 70, z: -62, r: 9 },
  { x: -20, z: 56, r: 7 },
  { x: 20, z: -56, r: 7 },
  { x: -45, z: 87, r: 7 },
  { x: 45, z: 87, r: 7 },
  { x: -45, z: -87, r: 7 },
  { x: 45, z: -87, r: 7 },
  { x: -48, z: 67, r: 12 },
  { x: 48, z: -67, r: 12 },  { x: 112, z: 60, r: 9 },
  { x: 150, z: 60, r: 9 },
  { x: 165, z: 60, r: 9 },
  { x: 150, z: -60, r: 9 },
  { x: 165, z: -60, r: 9 },
  { x: 112, z: -72, r: 9 },
  { x: 210, z: 68, r: 9 },
  { x: 205, z: -68, r: 9 },
  { x: 220, z: 25, r: 9 },
  { x: 98, z: 92, r: 9 },
  { x: 106, z: -100, r: 9 },
  { x: -160, z: 57, r: 16 },
  { x: -154, z: -64, r: 14 },
  { x: -205, z: 118, r: 15 },
  { x: -222, z: 42, r: 14 },
  { x: -175, z: 120, r: 14 },
  { x: -150, z: 40, r: 12 },
  { x: -120, z: 126, r: 12 },
  { x: -198, z: 70, r: 12 },
  { x: -132, z: 124, r: 9 },
  { x: 0, z: 94, r: 18 },
  { x: 45, z: -95, r: 15 },
  { x: 158, z: 92, r: 15 },
  { x: 205, z: 93, r: 20 },
  { x: -160, z: 35, r: 17 },
  { x: -156, z: 68, r: 11 },
  { x: 45, z: 101, r: 11 },
  { x: 92, z: 30, r: 10 },
  { x: 110, z: 80, r: 10 },
  { x: 160, z: 55, r: 10 },
  { x: -45, z: -95, r: 12 },
  { x: 200, z: 120, r: 12 },
  { x: -214, z: -60, r: 12 },
  { x: 90, z: 60, r: 9 },
  { x: 225, z: 22, r: 9 },
  { x: 228, z: -32, r: 9 },
  { x: 75, z: 42, r: 8 },
  { x: 10, z: 68, r: 7 },
  { x: -18, z: -68, r: 7 },
  { x: -8, z: 52, r: 6 },
  { x: -112, z: 92, r: 12 },
  { x: -165, z: 100, r: 12 },
  { x: -222, z: 34, r: 14 },
  { x: -198, z: -70, r: 15 },
  { x: -155, z: 15, r: 11 },
  { x: -225, z: 60, r: 12 },
  { x: -88, z: 55, r: 9 },
  { x: -88, z: 30, r: 9 },
]

const OUTER_HOUSE_POSITIONS: Vec3[] = [
  [-224, 0, 88],
  [-216, 0, 88],
  [-208, 0, 88],
  [-200, 0, 88],
  [-224, 0, 96],
  [-216, 0, 96],
  [-208, 0, 96],
  [-200, 0, 96],
  [-226, 0, 30],
  [-218, 0, 30],
  [-226, 0, 38],
  [-218, 0, 38],
]

function buildOuterBlocks(): BuildingSpec[] {
  const rng = makeRng(118)
  const outer: BuildingSpec[] = []
  const third = CITY_WIDTH / 6

  for (let x = -(CITY_WIDTH / 2 - 8); x <= CITY_WIDTH / 2 - 8; x += 9.5) {
    for (let z = -(CITY_DEPTH / 2 - 8); z <= CITY_DEPTH / 2 - 8; z += 9.5) {
      if (Math.abs(x) <= 66 && Math.abs(z) <= 44) continue
      if (Math.abs(z) < 12) continue
      if (VERTICAL_ROADS.some((road) => Math.abs(x - road) < 8)) continue
      if (HORIZONTAL_ROADS.some((road) => Math.abs(z - road) < 7.5)) continue
      if (Math.hypot(x / RING_RX, z / RING_RZ) > 0.9 && Math.hypot(x / RING_RX, z / RING_RZ) < 1.1) continue
      if (ROUNDABOUTS.some((roundabout) => Math.hypot(x - roundabout.x, z - roundabout.z) < 24)) continue
      if (SPECIAL_TOWERS.some((tower) => Math.hypot(x - tower.x, z - tower.z) < 13)) continue
      if (OUTER_CLEARINGS.some((clearing) => Math.hypot(x - clearing.x, z - clearing.z) < clearing.r)) continue
      if (rng() > 0.84) continue

      const zone: 'a' | 'b' | 'c' = x < -third ? 'c' : x > third ? 'b' : 'a'
      const core = 1 - Math.min(1, Math.hypot(x / (CITY_WIDTH / 2), z / (CITY_DEPTH / 2)))
      let h: number
      if (zone === 'b') {
        h = 7 + rng() * 22 + core * rng() * 12
      } else if (zone === 'a') {
        h = 6 + rng() * 18 + core * rng() * 11
      } else {
        h = 3.8 + rng() * 11 + core * rng() * 6
      }
      if (rng() < 0.09) h += 8

      outer.push({
        x,
        z,
        w: 5 + rng() * 2.1,
        d: 5.2 + rng() * 2.2,
        h,
        zone,
        outer: true,
        tint: ZONE_TINTS[zone][Math.floor(rng() * ZONE_TINTS[zone].length)],
      })
    }
  }

  return outer
}

function buildCityBlocks(): BuildingSpec[] {
  const rng = makeRng(42)
  const buildings: BuildingSpec[] = []
  const colsA = [-21, -14, -7, 0, 7, 14, 21]
  const rowsA = [
    { z: -38.5, skip: [] as number[] },
    { z: -27.5, skip: [-21, -14, -7] },
    { z: -17.5, skip: [-21, -14, -7] },
    { z: 17.5, skip: [] as number[] },
    { z: 27.5, skip: [] as number[] },
    { z: 38.5, skip: [] as number[] },
  ]

  for (const row of rowsA) {
    for (const x of colsA) {
      if (row.skip.includes(x)) continue
      const h = 8 + rng() * 16 + (Math.abs(x) < 10 && Math.abs(row.z) < 33 ? rng() * 8 : 0)
      const w = 5 + rng() * 1.5
      const d = 5.6 + rng() * 1.3
      buildings.push({
        x,
        z: row.z,
        w,
        d,
        h,
        zone: 'a',
        tint: ZONE_TINTS.a[Math.floor(rng() * ZONE_TINTS.a.length)],
      })
    }
  }

  const colsB = [108, 115.5, 123, 130.5]
  const rowsB = [
    { z: -40, skip: [] as number[] },
    { z: -29, skip: [] as number[] },
    { z: -18, skip: [] as number[] },
    { z: 17, skip: [] as number[] },
    { z: 28, skip: [] as number[] },
    { z: 40, skip: [] as number[] },
  ]

  for (const row of rowsB) {
    for (const x of colsB) {
      if (row.skip.includes(x)) continue
      const h = 11 + rng() * 23 + (row.z > 0 ? rng() * 7 : 0)
      const w = 4.8 + rng() * 1.5
      const d = 5.4 + rng() * 1.6
      buildings.push({
        x,
        z: row.z,
        w,
        d,
        h,
        zone: 'b',
        tint: ZONE_TINTS.b[Math.floor(rng() * ZONE_TINTS.b.length)],
      })
    }
  }

  return [...buildings, ...buildOuterBlocks()]
}

function InstancedBuildings({
  buildings,
  emissive,
  texture,
  facade,
  accent,
  emissiveIntensity = 0.5,
  day = false,
  dayTint = '#c9d4d8',
  roofSolar = false,
}: {
  buildings: BuildingSpec[]
  emissive: string
  texture: THREE.CanvasTexture
  facade: THREE.CanvasTexture
  accent: string
  emissiveIntensity?: number
  day?: boolean
  dayTint?: string
  roofSolar?: boolean
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const roofRef = useRef<THREE.InstancedMesh>(null)
  const unitRef = useRef<THREE.InstancedMesh>(null)
  const antennaRef = useRef<THREE.InstancedMesh>(null)
  const crownRef = useRef<THREE.InstancedMesh>(null)
  const baseRef = useRef<THREE.InstancedMesh>(null)
  const neonRef = useRef<THREE.InstancedMesh>(null)
  const padRef = useRef<THREE.InstancedMesh>(null)
  const signRef = useRef<THREE.InstancedMesh>(null)
  const solarRef = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    if (
      !meshRef.current ||
      !roofRef.current ||
      !unitRef.current ||
      !antennaRef.current ||
      !crownRef.current ||
      !baseRef.current ||
      !neonRef.current ||
      !padRef.current ||
      !signRef.current ||
      !solarRef.current
    ) {
      return
    }
    const matrix = new THREE.Matrix4()
    const position = new THREE.Vector3()
    const quaternion = new THREE.Quaternion()
    const scale = new THREE.Vector3()
    const color = new THREE.Color()
    const dayColor = new THREE.Color(dayTint)
    const roofColor = new THREE.Color()
    const solarQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.34, 0.22, 0))

    buildings.forEach((b, i) => {
      position.set(b.x, b.h / 2, b.z)
      scale.set(b.w, b.h, b.d)
      matrix.compose(position, quaternion, scale)
      meshRef.current!.setMatrixAt(i, matrix)
      meshRef.current!.setColorAt(i, day ? color.set(b.tint).lerp(dayColor, 0.7) : color.set(b.tint))

      position.set(b.x, b.h + 0.14, b.z)
      scale.set(b.w + 0.24, 0.3, b.d + 0.24)
      matrix.compose(position, quaternion, scale)
      roofRef.current!.setMatrixAt(i, matrix)
      roofRef.current!.setColorAt(i, roofColor.set(day ? '#8d999e' : '#15222a').lerp(color.set(b.tint), day ? 0.12 : 0.35))

      const crown = b.h > 19 && i % 2 === 0
      const crownH = crown ? 1.4 + (i % 4) * 0.8 : 0.0001
      position.set(b.x, b.h + 0.3 + crownH / 2, b.z)
      scale.set(crown ? b.w * 0.56 : 0.0001, crownH, crown ? b.d * 0.56 : 0.0001)
      matrix.compose(position, quaternion, scale)
      crownRef.current!.setMatrixAt(i, matrix)

      const offsetX = Math.cos(i * 1.73) * b.w * 0.18
      const offsetZ = Math.sin(i * 2.11) * b.d * 0.18
      position.set(b.x + offsetX, b.h + 0.4 + (crown ? crownH : 0), b.z + offsetZ)
      scale.set(b.w * (0.2 + (i % 3) * 0.04), 0.34 + (i % 4) * 0.11, b.d * 0.2)
      matrix.compose(position, quaternion, scale)
      unitRef.current!.setMatrixAt(i, matrix)

      const hasAntenna = b.h > 18 && i % 3 === 0
      const antennaH = hasAntenna ? 2.2 + (i % 5) * 0.45 : 0.0001
      position.set(b.x - b.w * 0.18, b.h + 0.3 + (crown ? crownH : 0) + antennaH / 2, b.z - b.d * 0.14)
      scale.set(hasAntenna ? 0.06 : 0.0001, antennaH, hasAntenna ? 0.06 : 0.0001)
      matrix.compose(position, quaternion, scale)
      antennaRef.current!.setMatrixAt(i, matrix)

      position.set(b.x, 0.42, b.z)
      scale.set(b.w + 0.14, 0.84, b.d + 0.14)
      matrix.compose(position, quaternion, scale)
      baseRef.current!.setMatrixAt(i, matrix)
      baseRef.current!.setColorAt(i, color.set(b.tint).lerp(dayColor, day ? 0.6 : 0.1))

      const neon = b.h > 13 && i % 3 !== 1
      position.set(b.x - b.w * 0.46, b.h * 0.56, b.z + b.d / 2 + 0.035)
      scale.set(neon ? 0.07 : 0.0001, neon ? b.h * 0.66 : 0.0001, 0.035)
      matrix.compose(position, quaternion, scale)
      neonRef.current!.setMatrixAt(i, matrix)

      const pad = b.h > 24 && i % 5 === 0
      position.set(b.x, b.h + 0.34, b.z)
      scale.set(pad ? b.w * 0.24 : 0.0001, pad ? 0.08 : 0.0001, pad ? b.w * 0.24 : 0.0001)
      matrix.compose(position, quaternion, scale)
      padRef.current!.setMatrixAt(i, matrix)

      const sign = b.h > 10 && i % 5 === 0
      position.set(b.x + b.w * 0.16, b.h * 0.63, b.z + b.d / 2 + 0.045)
      scale.set(sign ? b.w * 0.36 : 0.0001, sign ? 0.72 + (i % 3) * 0.22 : 0.0001, 0.055)
      matrix.compose(position, quaternion, scale)
      signRef.current!.setMatrixAt(i, matrix)

      const hasSolar = roofSolar && b.h > 4 && i % 2 === 0
      position.set(b.x - b.w * 0.1, b.h + 0.56, b.z + b.d * 0.06)
      scale.set(hasSolar ? b.w * 0.42 : 0.0001, hasSolar ? 0.06 : 0.0001, hasSolar ? b.d * 0.25 : 0.0001)
      matrix.compose(position, solarQuat, scale)
      solarRef.current!.setMatrixAt(i, matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
    roofRef.current.instanceMatrix.needsUpdate = true
    unitRef.current.instanceMatrix.needsUpdate = true
    antennaRef.current.instanceMatrix.needsUpdate = true
    crownRef.current.instanceMatrix.needsUpdate = true
    baseRef.current.instanceMatrix.needsUpdate = true
    neonRef.current.instanceMatrix.needsUpdate = true
    padRef.current.instanceMatrix.needsUpdate = true
    signRef.current.instanceMatrix.needsUpdate = true
    solarRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
    if (roofRef.current.instanceColor) roofRef.current.instanceColor.needsUpdate = true
    if (baseRef.current.instanceColor) baseRef.current.instanceColor.needsUpdate = true
  }, [buildings, day, dayTint])

  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, buildings.length]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          map={facade}
          roughness={day ? 0.82 : 0.48}
          metalness={day ? 0.05 : 0.38}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
          emissiveMap={texture}
          color="#ffffff"
        />
      </instancedMesh>

      <instancedMesh ref={baseRef} args={[undefined, undefined, buildings.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={day ? 0.8 : 0.35}
          metalness={day ? 0.05 : 0.5}
          emissive={accent}
          emissiveIntensity={day ? 0.05 : 0.46}
        />
      </instancedMesh>

      <instancedMesh ref={roofRef} args={[undefined, undefined, buildings.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.78} metalness={day ? 0.1 : 0.3} />
      </instancedMesh>

      <instancedMesh ref={crownRef} args={[undefined, undefined, buildings.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={day ? '#aeb8bc' : '#18262e'} roughness={0.55} metalness={day ? 0.12 : 0.45} />
      </instancedMesh>

      <instancedMesh ref={unitRef} args={[undefined, undefined, buildings.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={day ? '#8f9a9f' : '#24323a'} roughness={0.62} metalness={0.35} />
      </instancedMesh>

      <instancedMesh ref={antennaRef} args={[undefined, undefined, buildings.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={day ? '#798489' : '#586a72'} metalness={0.7} roughness={0.4} />
      </instancedMesh>

      <instancedMesh ref={neonRef} args={[undefined, undefined, buildings.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color={accent} toneMapped={false} transparent opacity={0.62} />
      </instancedMesh>

      <instancedMesh ref={signRef} args={[undefined, undefined, buildings.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={day ? '#c8d2d6' : '#111b22'} emissive={accent} emissiveIntensity={day ? 0.22 : 1.35} roughness={0.35} metalness={0.3} />
      </instancedMesh>

      <instancedMesh ref={solarRef} args={[undefined, undefined, buildings.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#0d2741" emissive="#2f7fa8" emissiveIntensity={day ? 0.22 : 0.8} roughness={0.45} metalness={0.35} />
      </instancedMesh>

      <instancedMesh ref={padRef} args={[undefined, undefined, buildings.length]}>
        <cylinderGeometry args={[1, 1, 1, 18]} />
        <meshStandardMaterial color={day ? '#9aa5aa' : '#1e2c34'} emissive={accent} emissiveIntensity={day ? 0.08 : 0.8} />
      </instancedMesh>
    </group>
  )
}

function InstancedTrees({ positions, day = false }: { positions: Vec3[]; day?: boolean }) {
  const trunkRef = useRef<THREE.InstancedMesh>(null)
  const canopyRef = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    if (!trunkRef.current || !canopyRef.current) return
    const matrix = new THREE.Matrix4()
    const position = new THREE.Vector3()
    const quaternion = new THREE.Quaternion()
    const scale = new THREE.Vector3()
    const color = new THREE.Color()
    positions.forEach(([x, y, z], index) => {
      const size = 0.82 + (index % 5) * 0.11
      position.set(x, y + 0.65 * size, z)
      scale.set(size, size, size)
      matrix.compose(position, quaternion, scale)
      trunkRef.current!.setMatrixAt(index, matrix)

      position.set(x, y + 1.75 * size, z)
      scale.set(size * 1.06, size * 1.15, size * 1.06)
      matrix.compose(position, quaternion, scale)
      canopyRef.current!.setMatrixAt(index, matrix)
      const palette = day
        ? ['#3f7c5a', '#4d8a62', '#356e51', '#568f66']
        : ['#1c463f', '#245248', '#2a5b4d', '#1b403a']
      canopyRef.current!.setColorAt(index, color.set(palette[index % palette.length]))
    })
    trunkRef.current.instanceMatrix.needsUpdate = true
    canopyRef.current.instanceMatrix.needsUpdate = true
    if (canopyRef.current.instanceColor) canopyRef.current.instanceColor.needsUpdate = true
  }, [positions, day])

  return (
    <group>
      <instancedMesh ref={trunkRef} args={[undefined, undefined, positions.length]} castShadow>
        <cylinderGeometry args={[0.09, 0.14, 1.3, 6]} />
        <meshStandardMaterial color={day ? '#5f4d3a' : '#2b2a23'} roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={canopyRef} args={[undefined, undefined, positions.length]} castShadow>
        <icosahedronGeometry args={[0.82, 0]} />
        <meshStandardMaterial color="#ffffff" roughness={0.88} flatShading />
      </instancedMesh>
    </group>
  )
}

function StreetLights({ lights, day = false }: { lights: { position: Vec3; facing?: number }[]; day?: boolean }) {
  const poleRef = useRef<THREE.InstancedMesh>(null)
  const armRef = useRef<THREE.InstancedMesh>(null)
  const bulbRef = useRef<THREE.InstancedMesh>(null)
  const poolRef = useRef<THREE.InstancedMesh>(null)
  const glow = useMemo(() => createGlowTexture(), [])

  const glowPositions = useMemo(() => {
    const array = new Float32Array(lights.length * 3)
    lights.forEach((light, index) => {
      array[index * 3] = light.position[0]
      array[index * 3 + 1] = 4.32
      array[index * 3 + 2] = light.position[2] + (light.facing ?? 1) * 0.8
    })
    return array
  }, [lights])

  useLayoutEffect(() => {
    if (!poleRef.current || !armRef.current || !bulbRef.current || !poolRef.current) return
    const matrix = new THREE.Matrix4()
    const position = new THREE.Vector3()
    const quaternion = new THREE.Quaternion()
    const flat = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0))
    const scale = new THREE.Vector3()

    lights.forEach((light, index) => {
      const facing = light.facing ?? 1
      const [x, y, z] = light.position

      position.set(x, y + 2.2, z)
      scale.set(1, 1, 1)
      matrix.compose(position, quaternion, scale)
      poleRef.current!.setMatrixAt(index, matrix)

      position.set(x, y + 4.36, z + 0.4 * facing)
      scale.set(1, 1, 1)
      matrix.compose(position, quaternion, scale)
      armRef.current!.setMatrixAt(index, matrix)

      position.set(x, y + 4.3, z + 0.8 * facing)
      matrix.compose(position, quaternion, scale)
      bulbRef.current!.setMatrixAt(index, matrix)

      position.set(x, y + 0.07, z + 0.55 * facing)
      scale.set(4.6, 4.6, 4.6)
      matrix.compose(position, flat, scale)
      poolRef.current!.setMatrixAt(index, matrix)
    })
    poleRef.current.instanceMatrix.needsUpdate = true
    armRef.current.instanceMatrix.needsUpdate = true
    bulbRef.current.instanceMatrix.needsUpdate = true
    poolRef.current.instanceMatrix.needsUpdate = true
  }, [lights])

  return (
    <group>
      <instancedMesh ref={poleRef} args={[undefined, undefined, lights.length]}>
        <cylinderGeometry args={[0.05, 0.075, 4.4, 6]} />
        <meshStandardMaterial color={day ? '#79858a' : '#3b4a52'} metalness={0.6} roughness={0.5} />
      </instancedMesh>
      <instancedMesh ref={armRef} args={[undefined, undefined, lights.length]}>
        <boxGeometry args={[0.07, 0.07, 0.86]} />
        <meshStandardMaterial color={day ? '#79858a' : '#3b4a52'} metalness={0.6} roughness={0.5} />
      </instancedMesh>
      <instancedMesh ref={bulbRef} args={[undefined, undefined, lights.length]}>
        <sphereGeometry args={[0.13, 8, 8]} />
        <meshBasicMaterial color={day ? '#e4ded0' : '#ffe0ac'} toneMapped={false} />
      </instancedMesh>
      {!day && (
        <>
          <points>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[glowPositions, 3]} />
            </bufferGeometry>
            <pointsMaterial
              map={glow}
              color="#ffd9a0"
              size={3.4}
              sizeAttenuation
              transparent
              opacity={0.7}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </points>
          <instancedMesh ref={poolRef} args={[undefined, undefined, lights.length]}>
            <circleGeometry args={[1, 18]} />
            <meshBasicMaterial
              map={glow}
              color="#ffc98a"
              transparent
              opacity={0.17}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </instancedMesh>
        </>
      )}
    </group>
  )
}

function Crosswalk({ x }: { x: number }) {
  return (
    <group position={[x, 0.045, 0]}>
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={i} position={[i * 1.12 - 3.36, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.55, 9.6]} />
          <meshBasicMaterial color="#d7e4e8" transparent opacity={0.34} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

function InstancedHouses({ positions, day = false }: { positions: Vec3[]; day?: boolean }) {
  const bodyRef = useRef<THREE.InstancedMesh>(null)
  const roofRef = useRef<THREE.InstancedMesh>(null)
  const doorRef = useRef<THREE.InstancedMesh>(null)
  const sideRef = useRef<THREE.InstancedMesh>(null)
  const meterRef = useRef<THREE.InstancedMesh>(null)
  const groundRef = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    if (!bodyRef.current || !roofRef.current || !doorRef.current || !sideRef.current || !meterRef.current || !groundRef.current) return
    const matrix = new THREE.Matrix4()
    const position = new THREE.Vector3()
    const quaternion = new THREE.Quaternion()
    const roofQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 4, 0))
    const sideQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 2, 0))
    const scale = new THREE.Vector3(1, 1, 1)
    const color = new THREE.Color()
    const cool = new THREE.Color('#132b38')
    const warm = new THREE.Color('#ffce8f')

    positions.forEach(([x, y, z], index) => {
      const lit = Math.sin(x * 1.73 + z * 2.11) > -0.15

      position.set(x, y + 1.25, z)
      matrix.compose(position, quaternion, scale)
      bodyRef.current!.setMatrixAt(index, matrix)

      position.set(x, y + 3.35, z)
      matrix.compose(position, roofQuat, scale)
      roofRef.current!.setMatrixAt(index, matrix)

      position.set(x, y + 1.35, z + 1.92)
      matrix.compose(position, quaternion, scale)
      doorRef.current!.setMatrixAt(index, matrix)
      doorRef.current!.setColorAt(index, color.copy(lit ? warm : cool))

      position.set(x - 1.72, y + 1.35, z + 0.4)
      matrix.compose(position, sideQuat, scale)
      sideRef.current!.setMatrixAt(index, matrix)
      sideRef.current!.setColorAt(index, color.copy(lit ? cool : warm))

      position.set(x + 1.72, y + 0.9, z - 0.4)
      matrix.compose(position, sideQuat, scale)
      meterRef.current!.setMatrixAt(index, matrix)

      position.set(x, y + 0.04, z)
      const groundQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0))
      matrix.compose(position, groundQuat, scale)
      groundRef.current!.setMatrixAt(index, matrix)
    })
    bodyRef.current.instanceMatrix.needsUpdate = true
    roofRef.current.instanceMatrix.needsUpdate = true
    doorRef.current.instanceMatrix.needsUpdate = true
    sideRef.current.instanceMatrix.needsUpdate = true
    meterRef.current.instanceMatrix.needsUpdate = true
    groundRef.current.instanceMatrix.needsUpdate = true
    if (doorRef.current.instanceColor) doorRef.current.instanceColor.needsUpdate = true
    if (sideRef.current.instanceColor) sideRef.current.instanceColor.needsUpdate = true
  }, [positions])

  return (
    <group>
      <instancedMesh ref={bodyRef} args={[undefined, undefined, positions.length]} castShadow>
        <boxGeometry args={[3.4, 2.5, 3.8]} />
        <meshStandardMaterial color={day ? '#4b463f' : '#2b2b2c'} roughness={0.85} />
      </instancedMesh>
      <instancedMesh ref={roofRef} args={[undefined, undefined, positions.length]} castShadow frustumCulled={false}>
        <coneGeometry args={[2.9, 2.5, 4]} />
        <meshStandardMaterial color={day ? '#8b6b4f' : '#352a23'} roughness={0.8} flatShading />
      </instancedMesh>
      <instancedMesh ref={doorRef} args={[undefined, undefined, positions.length]}>
        <planeGeometry args={[0.7, 0.85]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} transparent opacity={0.8} />
      </instancedMesh>
      <instancedMesh ref={sideRef} args={[undefined, undefined, positions.length]}>
        <planeGeometry args={[0.55, 0.7]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} transparent opacity={0.65} />
      </instancedMesh>
      <instancedMesh ref={meterRef} args={[undefined, undefined, positions.length]}>
        <boxGeometry args={[0.38, 0.5, 0.22]} />
        <meshStandardMaterial color="#0c1820" emissive="#5fd8ff" emissiveIntensity={2.2} />
      </instancedMesh>
      <instancedMesh ref={groundRef} args={[undefined, undefined, positions.length]}>
        <circleGeometry args={[2.9, 16]} />
        <meshBasicMaterial color="#1a2b25" transparent opacity={0.5} depthWrite={false} />
      </instancedMesh>
    </group>
  )
}

function WindTurbine({ position, speed = 0.4 }: { position: Vec3; speed?: number }) {
  const blades = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (!blades.current) return
    blades.current.rotation.z = state.clock.elapsedTime * speed
  })

  return (
    <group position={position}>
      <mesh position={[0, 8.2, 0]}>
        <cylinderGeometry args={[0.16, 0.44, 16.4, 8]} />
        <meshStandardMaterial color="#b9c7cd" roughness={0.45} metalness={0.6} />
      </mesh>
      <mesh position={[0, 16.5, 0]}>
        <boxGeometry args={[0.55, 0.5, 1.15]} />
        <meshStandardMaterial color="#cfdbe0" roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[1.1, 1.3, 0.16, 12]} />
        <meshStandardMaterial color="#202a2f" roughness={0.8} />
      </mesh>
      <group ref={blades} position={[0, 16.5, 0.65]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI * 2) / 3]} position={[0, 0, 0]}>
            <boxGeometry args={[0.16, 6.4, 0.055]} />
            <meshStandardMaterial color="#d6e2e6" roughness={0.35} metalness={0.4} />
          </mesh>
        ))}
        <mesh>
          <sphereGeometry args={[0.28, 10, 10]} />
          <meshStandardMaterial color="#e4edf0" roughness={0.3} metalness={0.5} />
        </mesh>
      </group>
    </group>
  )
}

function IndustryAndResidential({ day = false }: { day?: boolean }) {
  const solar = useMemo(() => createSolarTexture(), [])
  const housePositions: Vec3[] = useMemo(() => {
    const positions: Vec3[] = []
    for (const z of [13.5, 21.5, 29.5, 37.5]) {
      for (const x of [-128.5, -121.5, -114.5, -107.5]) {
        positions.push([x, 0, z])
      }
    }
    return positions
  }, [])
  const allHouses = useMemo(() => [...housePositions, ...OUTER_HOUSE_POSITIONS], [housePositions])

  return (
    <group>
      <InstancedHouses positions={allHouses} day={day} />

      {/* Residential extension in Zona C */}
      <mesh position={[-212, 0.04, 92]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[36, 2.4]} />
        <meshStandardMaterial color="#11181d" roughness={0.9} />
      </mesh>
      <mesh position={[-228, 0.04, 92]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.2, 20]} />
        <meshStandardMaterial color="#11181d" roughness={0.9} />
      </mesh>

      {/* Outer wind and solar in Zona C */}
      <WindTurbine position={[-208, 0, -125]} speed={0.28} />
      <WindTurbine position={[-190, 0, -126]} speed={0.36} />
      <WindTurbine position={[-132, 0, -16]} speed={0.33} />
      <group position={[-206, 0, -96]}>
        <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[13, 9]} />
          <meshStandardMaterial color="#161e23" roughness={0.9} />
        </mesh>
        {[-3.6, 0, 3.6].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            {[-2.6, 0, 2.6].map((z) => (
              <mesh key={z} position={[0, 0.55, z]} rotation={[-0.42, 0, 0]}>
                <planeGeometry args={[2.4, 1.5]} />
                <meshStandardMaterial map={solar} emissive="#255472" emissiveIntensity={0.25} roughness={0.55} side={THREE.DoubleSide} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* Segundo parque solar de la Zona C */}
      <group position={[-165, 0, -95]}>
        <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[16, 10]} />
          <meshStandardMaterial color="#161e23" roughness={0.9} />
        </mesh>
        {[-4.6, 0, 4.6].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            {[-3, 0, 3].map((z) => (
              <mesh key={z} position={[0, 0.55, z]} rotation={[-0.42, 0, 0]}>
                <planeGeometry args={[2.8, 1.7]} />
                <meshStandardMaterial map={solar} emissive="#2c6280" emissiveIntensity={0.28} roughness={0.5} side={THREE.DoubleSide} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* Torre de agua de la Zona C */}
      <group position={[-118, 0, 70]}>
        {[-1.5, 1.5].map((x) =>
          [-1.5, 1.5].map((z) => (
            <mesh key={`${x}-${z}`} position={[x, 2.6, z]}>
              <cylinderGeometry args={[0.16, 0.22, 5.2, 6]} />
              <meshStandardMaterial color="#667a82" metalness={0.6} roughness={0.45} />
            </mesh>
          )),
        )}
        <mesh position={[0, 5.5, 0]}>
          <cylinderGeometry args={[2.3, 2.5, 2.4, 18]} />
          <meshStandardMaterial color="#8fa3aa" roughness={0.45} metalness={0.45} />
        </mesh>
        <mesh position={[0, 6.8, 0]}>
          <coneGeometry args={[2.45, 1.1, 18]} />
          <meshStandardMaterial color="#a9bcc1" roughness={0.4} metalness={0.5} />
        </mesh>
        <mesh position={[0, 7.45, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="#ff9a82" toneMapped={false} />
        </mesh>
      </group>

      {/* Outer water facility in Zona C */}
      <group position={[-152, 0, 126]}>
        {[-2.1, 2.1].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <mesh position={[0, 1.9, 0]}>
              <cylinderGeometry args={[1.8, 1.9, 3.8, 16]} />
              <meshStandardMaterial color="#8fa4ac" roughness={0.45} metalness={0.5} />
            </mesh>
            <mesh position={[0, 3.8, 0]}>
              <sphereGeometry args={[1.8, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color="#a9bcc2" roughness={0.4} metalness={0.55} />
            </mesh>
            <mesh position={[0, 1.1, 0]}>
              <torusGeometry args={[1.9, 0.03, 5, 28]} />
              <meshBasicMaterial color="#6bcddd" toneMapped={false} transparent opacity={0.6} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[1.9, 1.0, 2.2]} />
          <meshStandardMaterial color="#1a252b" roughness={0.6} metalness={0.3} />
        </mesh>
      </group>


      {/* Residential streets */}
      {[17.5, 25.5, 33.5].map((z) => (
        <mesh key={z} position={[-118, 0.034, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[27, 2.3]} />
          <meshStandardMaterial color="#0c1217" roughness={0.92} />
        </mesh>
      ))}
      <mesh position={[-103.8, 0.034, 25]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.2, 27]} />
        <meshStandardMaterial color="#0c1217" roughness={0.92} />
      </mesh>

      {/* Industrial campus */}
      <group position={[-123.5, 0, -27]}>
        <mesh position={[0, 3.6, 0]}>
          <boxGeometry args={[15.5, 7.2, 11.5]} />
          <meshStandardMaterial color="#25282a" roughness={0.7} metalness={0.25} />
          <Edges color="#42606e" threshold={15} />
        </mesh>
        <mesh position={[0, 7.35, 0]}>
          <boxGeometry args={[15.7, 0.35, 11.7]} />
          <meshStandardMaterial color="#131a1e" roughness={0.8} />
        </mesh>
        {[-4.2, 0, 4.2].map((x) => (
          <mesh key={x} position={[x, 7.62, -1.2]} rotation={[-0.32, 0, 0]}>
            <planeGeometry args={[3.6, 6.2]} />
            <meshStandardMaterial map={solar} emissive="#2f6b9c" emissiveIntensity={0.35} roughness={0.5} side={THREE.DoubleSide} />
          </mesh>
        ))}
        <mesh position={[0, 1.7, 5.79]}>
          <planeGeometry args={[9.5, 1.6]} />
          <meshBasicMaterial color="#123242" transparent opacity={0.8} />
        </mesh>
      </group>

      <group position={[-107.6, 0, -27.5]}>
        <mesh position={[0, 3.2, 0]}>
          <boxGeometry args={[8.6, 6.4, 9.4]} />
          <meshStandardMaterial color="#2b2e30" roughness={0.7} metalness={0.3} />
          <Edges color="#42606e" threshold={15} />
        </mesh>
        <mesh position={[0, 6.55, 0]}>
          <boxGeometry args={[8.8, 0.3, 9.6]} />
          <meshStandardMaterial color="#11181b" roughness={0.85} />
        </mesh>
        <mesh position={[0, 6.76, 0]} rotation={[-0.3, 0, 0]}>
          <planeGeometry args={[6.5, 5.2]} />
          <meshStandardMaterial map={solar} emissive="#2f6b9c" emissiveIntensity={0.35} roughness={0.5} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Water operations */}
      <group position={[-114, 0, -15.5]}>
        {[-2.3, 2.3].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <mesh position={[0, 2.1, 0]}>
              <cylinderGeometry args={[1.85, 1.95, 4.2, 20]} />
              <meshStandardMaterial color="#8ea4ac" roughness={0.4} metalness={0.55} />
            </mesh>
            <mesh position={[0, 4.2, 0]}>
              <sphereGeometry args={[1.85, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color="#a9bcc2" roughness={0.35} metalness={0.6} />
            </mesh>
            <mesh position={[0, 1.2, 0]}>
              <torusGeometry args={[1.96, 0.035, 6, 32]} />
              <meshBasicMaterial color="#5fd8ff" toneMapped={false} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 0.7, 0]}>
          <boxGeometry args={[2.2, 1.1, 2.6]} />
          <meshStandardMaterial color="#1a252b" roughness={0.6} metalness={0.3} />
        </mesh>
        <mesh position={[0, 1.55, 0.4]}>
          <boxGeometry args={[2.5, 0.7, 2.9]} />
          <meshStandardMaterial color="#17242b" roughness={0.7} emissive="#2f8fae" emissiveIntensity={0.2} />
        </mesh>
        <mesh position={[-2.4, 1.2, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.12, 0.12, 2.2, 8]} />
          <meshStandardMaterial color="#51636b" metalness={0.7} roughness={0.4} />
        </mesh>
      </group>

      {/* Smart grid substation */}
      <group position={[-125.5, 0, -14.5]}>
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[9.6, 0.2, 6.6]} />
          <meshStandardMaterial color="#101a20" roughness={0.9} />
        </mesh>
        {[-2.2, 2.2].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <mesh position={[0, 1.25, 0]}>
              <boxGeometry args={[1.7, 2.2, 1.3]} />
              <meshStandardMaterial color="#334047" metalness={0.5} roughness={0.6} />
            </mesh>
            <mesh position={[0, 2.45, 0]}>
              <boxGeometry args={[0.18, 0.7, 0.18]} />
              <meshStandardMaterial color="#1b262c" />
            </mesh>
            <mesh position={[0, 2.86, 0]}>
              <sphereGeometry args={[0.11, 8, 8]} />
              <meshBasicMaterial color="#ffb26b" toneMapped={false} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 2.9, -2.6]}>
          <boxGeometry args={[0.09, 5.2, 0.09]} />
          <meshStandardMaterial color="#73878e" metalness={0.7} roughness={0.5} />
        </mesh>
        <mesh position={[0, 5.35, -2.6]}>
          <boxGeometry args={[3.4, 0.07, 0.07]} />
          <meshStandardMaterial color="#73878e" metalness={0.7} roughness={0.5} />
        </mesh>
      </group>

      <WindTurbine position={[-130, 0, -34]} speed={0.32} />
      <WindTurbine position={[-105.5, 0, -34]} speed={0.44} />
    </group>
  )
}

function SolarFarm({
  position,
  solar,
  cols = 4,
  rows = 3,
  spacingX = 3.4,
  spacingZ = 2.6,
}: {
  position: Vec3
  solar: THREE.CanvasTexture
  cols?: number
  rows?: number
  spacingX?: number
  spacingZ?: number
}) {
  const panelRef = useRef<THREE.InstancedMesh>(null)
  const supportRef = useRef<THREE.InstancedMesh>(null)
  const count = cols * rows

  useLayoutEffect(() => {
    if (!panelRef.current || !supportRef.current) return
    const matrix = new THREE.Matrix4()
    const positionVec = new THREE.Vector3()
    const quaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.48, 0, 0))
    const identity = new THREE.Quaternion()
    const scale = new THREE.Vector3(1, 1, 1)
    let index = 0
    for (let col = 0; col < cols; col += 1) {
      for (let row = 0; row < rows; row += 1) {
        const x = (col - (cols - 1) / 2) * spacingX
        const z = (row - (rows - 1) / 2) * spacingZ
        positionVec.set(x, 0.5, z)
        matrix.compose(positionVec, quaternion, scale)
        panelRef.current!.setMatrixAt(index, matrix)
        positionVec.set(x, 0.3, z)
        matrix.compose(positionVec, identity, scale)
        supportRef.current!.setMatrixAt(index, matrix)
        index += 1
      }
    }
    panelRef.current.instanceMatrix.needsUpdate = true
    supportRef.current.instanceMatrix.needsUpdate = true
  }, [cols, rows, spacingX, spacingZ])

  return (
    <group position={position}>
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[cols * spacingX + 2.4, rows * spacingZ + 1.6]} />
        <meshStandardMaterial color="#161e23" roughness={0.9} />
      </mesh>
      <instancedMesh ref={panelRef} args={[undefined, undefined, count]} frustumCulled={false}>
        <boxGeometry args={[2.5, 0.04, 1.55]} />
        <meshStandardMaterial map={solar} emissive="#2c6280" emissiveIntensity={0.35} roughness={0.5} />
      </instancedMesh>
      <instancedMesh ref={supportRef} args={[undefined, undefined, count]} frustumCulled={false}>
        <boxGeometry args={[0.1, 0.3, 0.1]} />
        <meshStandardMaterial color="#4a5a61" metalness={0.6} roughness={0.5} />
      </instancedMesh>
    </group>
  )
}

function EvHub({ position, rotation = 0 }: { position: Vec3; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[5.2, 0.16, 4]} />
        <meshStandardMaterial color="#141d23" roughness={0.8} metalness={0.3} />
      </mesh>
      {[-2.3, 2.3].map((x) =>
        [-1.6, 1.6].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 1.55, z]}>
            <boxGeometry args={[0.12, 3.1, 0.12]} />
            <meshStandardMaterial color="#596b74" metalness={0.7} roughness={0.4} />
          </mesh>
        )),
      )}
      <mesh position={[0, 3.15, 0]}>
        <boxGeometry args={[5.3, 0.18, 4.1]} />
        <meshStandardMaterial color="#1c2b33" roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[0, 3.05, 0]}>
        <boxGeometry args={[4.6, 0.05, 3.4]} />
        <meshBasicMaterial color="#8cf1ff" toneMapped={false} />
      </mesh>
      {[-1.2, 1.2].map((x) => (
        <group key={x} position={[x, 1.15, 1.2]}>
          <mesh>
            <boxGeometry args={[0.8, 1.5, 0.42]} />
            <meshStandardMaterial color="#c4d0d4" roughness={0.4} metalness={0.4} />
          </mesh>
          <mesh position={[0, 0.38, 0.23]}>
            <boxGeometry args={[0.5, 0.42, 0.04]} />
            <meshBasicMaterial color="#6fe6f7" toneMapped={false} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.72, 0.9, 4]} />
        <meshBasicMaterial color="#79e3f2" toneMapped={false} transparent opacity={0.75} />
      </mesh>
    </group>
  )
}

function WifiPylon({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <mesh position={[0, 3.2, 0]}>
        <cylinderGeometry args={[0.12, 0.24, 6.4, 8]} />
        <meshStandardMaterial color="#6d7e86" metalness={0.7} roughness={0.4} />
      </mesh>
      {[5.7, 6.3].map((y, index) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.92 - index * 0.16, 0.035, 5, 24]} />
          <meshBasicMaterial color="#79e3f2" toneMapped={false} transparent opacity={0.75} />
        </mesh>
      ))}
      <mesh position={[0, 6.7, 0]}>
        <sphereGeometry args={[0.14, 8, 8]} />
        <meshBasicMaterial color="#bdf7ff" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.55, 0.7, 0.32, 10]} />
        <meshStandardMaterial color="#1a262c" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.6, 0.55]}>
        <boxGeometry args={[0.75, 0.8, 0.2]} />
        <meshStandardMaterial color="#1d2b33" emissive="#2f8fae" emissiveIntensity={0.4} />
      </mesh>
    </group>
  )
}

function MobilityKiosk({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.15, 0]}>
        <boxGeometry args={[1.45, 2.3, 0.7]} />
        <meshStandardMaterial color="#24343d" roughness={0.5} metalness={0.45} />
      </mesh>
      <mesh position={[0, 1.35, 0.37]}>
        <boxGeometry args={[1.05, 1.15, 0.04]} />
        <meshBasicMaterial color="#85edff" toneMapped={false} transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, 2.38, 0]}>
        <boxGeometry args={[1.75, 0.16, 0.95]} />
        <meshStandardMaterial color="#101920" roughness={0.6} metalness={0.4} />
      </mesh>
      <mesh position={[0, 2.29, 0]}>
        <boxGeometry args={[1.5, 0.04, 0.75]} />
        <meshBasicMaterial color="#79e3f2" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[1.7, 0.16, 1]} />
        <meshStandardMaterial color="#121b20" roughness={0.9} />
      </mesh>
    </group>
  )
}

function SecurityCheckpoint({ position, rotation = 0 }: { position: Vec3; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {[-4.4, 4.4].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 2.1, 0]}>
            <boxGeometry args={[0.55, 4.2, 0.55]} />
            <meshStandardMaterial color="#232c3c" metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[0, 3.5, 0.29]}>
            <boxGeometry args={[0.3, 1.3, 0.04]} />
            <meshBasicMaterial color="#b0a0ff" toneMapped={false} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 4.3, 0]}>
        <boxGeometry args={[9.4, 0.32, 0.6]} />
        <meshStandardMaterial color="#1a2230" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 4.1, 0.32]}>
        <boxGeometry args={[8.4, 0.06, 0.06]} />
        <meshBasicMaterial color="#b0a0ff" toneMapped={false} />
      </mesh>
      <mesh position={[0, 2.05, 0]}>
        <planeGeometry args={[8.6, 3.9]} />
        <meshBasicMaterial color="#8d7dff" transparent opacity={0.07} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[9.2, 1.4]} />
        <meshBasicMaterial color="#b0a0ff" transparent opacity={0.18} depthWrite={false} />
      </mesh>
    </group>
  )
}

function DronePad({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.7, 24]} />
        <meshStandardMaterial color="#151e29" roughness={0.8} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.075, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.3, 2.5, 24]} />
        <meshBasicMaterial color="#b0a0ff" toneMapped={false} transparent opacity={0.65} />
      </mesh>
      <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.5, 0.22]} />
        <meshBasicMaterial color="#e4ddff" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[1.5, 0.22]} />
        <meshBasicMaterial color="#e4ddff" toneMapped={false} />
      </mesh>
      {[0, 1, 2, 3].map((index) => {
        const angle = (index / 4) * Math.PI * 2 + Math.PI / 4
        return (
          <mesh key={index} position={[Math.cos(angle) * 2.55, 0.1, Math.sin(angle) * 2.55]}>
            <sphereGeometry args={[0.08, 6, 6]} />
            <meshBasicMaterial color="#d9d1ff" toneMapped={false} />
          </mesh>
        )
      })}
    </group>
  )
}

function SpotlightTower({ position, rotation = 0 }: { position: Vec3; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 4.8, 0]}>
        <cylinderGeometry args={[0.14, 0.3, 9.6, 8]} />
        <meshStandardMaterial color="#384652" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[0, 9.7, 0.4]} rotation={[0.7, 0, 0]}>
        <boxGeometry args={[0.8, 0.7, 1.2]} />
        <meshStandardMaterial color="#1d2732" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 9.55, 1.05]}>
        <circleGeometry args={[0.32, 12]} />
        <meshBasicMaterial color="#d9d0ff" toneMapped={false} />
      </mesh>
      <mesh position={[0, 7.4, 0]}>
        <boxGeometry args={[0.5, 0.7, 0.5]} />
        <meshStandardMaterial color="#222d39" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  )
}

function CommunityGarden({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8.5, 6]} />
        <meshStandardMaterial color="#1d2b22" roughness={0.95} />
      </mesh>
      {[-2.6, 0, 2.6].map((z) => (
        <group key={z}>
          <mesh position={[0, 0.26, z]}>
            <boxGeometry args={[7.4, 0.42, 1.15]} />
            <meshStandardMaterial color="#31402f" roughness={0.95} />
          </mesh>
          {[-2.7, -1.35, 0, 1.35, 2.7].map((x) => (
            <mesh key={x} position={[x, 0.62, z]}>
              <icosahedronGeometry args={[0.38, 0]} />
              <meshStandardMaterial color="#3f6b45" roughness={0.9} flatShading />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[0, 0.55, 3.2]}>
        <boxGeometry args={[8.6, 0.06, 0.06]} />
        <meshStandardMaterial color="#55645c" roughness={0.8} />
      </mesh>
    </group>
  )
}

function BiogasDome({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[9, 7]} />
        <meshStandardMaterial color="#1c2620" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.85, 0]}>
        <cylinderGeometry args={[3, 3.15, 1.7, 20]} />
        <meshStandardMaterial color="#485b52" roughness={0.6} metalness={0.35} />
      </mesh>
      <mesh position={[0, 1.7, 0]}>
        <sphereGeometry args={[3, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#5f7a68" roughness={0.55} metalness={0.3} />
      </mesh>
      <mesh position={[0, 3.65, 0]}>
        <cylinderGeometry args={[2.4, 2.7, 0.5, 20]} />
        <meshStandardMaterial color="#35463e" roughness={0.7} />
      </mesh>
      <mesh position={[0, 2.5, 2.8]}>
        <boxGeometry args={[1.2, 0.8, 0.3]} />
        <meshStandardMaterial color="#24322c" roughness={0.6} />
      </mesh>
      <mesh position={[0, 2.5, 2.98]}>
        <boxGeometry args={[0.8, 0.08, 0.04]} />
        <meshBasicMaterial color="#8ce6a8" toneMapped={false} />
      </mesh>
      {[-2.2, 2.2].map((x) => (
        <mesh key={x} position={[x, 0.8, 3.2]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.16, 0.16, 2.1, 8]} />
          <meshStandardMaterial color="#7e8c87" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 4.0, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color="#ffb86b" toneMapped={false} />
      </mesh>
    </group>
  )
}

function VerticalFarm({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[9.6, 0.2, 7.4]} />
        <meshStandardMaterial color="#1a2420" roughness={0.85} />
      </mesh>
      <mesh position={[0, 3.6, 0]}>
        <boxGeometry args={[9, 7, 6.8]} />
        <meshStandardMaterial color="#263530" roughness={0.6} metalness={0.2} />
      </mesh>
      {[0.7, 1.5, 2.3, 3.1, 3.9, 4.7, 5.5, 6.3].map((y) => (
        <mesh key={y} position={[0, y, 3.43]}>
          <boxGeometry args={[8.2, 0.12, 0.06]} />
          <meshBasicMaterial color="#6fe0a2" toneMapped={false} transparent opacity={0.85} />
        </mesh>
      ))}
      {[-3.4, 3.4].map((x) => (
        <mesh key={x} position={[x, 4.2, 3.43]}>
          <boxGeometry args={[0.14, 6.2, 0.06]} />
          <meshBasicMaterial color="#3d8f68" toneMapped={false} transparent opacity={0.6} />
        </mesh>
      ))}
      <mesh position={[0, 7.35, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[6.6, 0.22, 5.2]} />
        <meshStandardMaterial color="#83a991" roughness={0.35} metalness={0.35} transparent opacity={0.55} />
      </mesh>
      <mesh position={[0, 7.55, 0]}>
        <boxGeometry args={[9.2, 0.12, 7]} />
        <meshStandardMaterial color="#33483f" roughness={0.7} />
      </mesh>
      <mesh position={[0, 7.95, 0]}>
        <boxGeometry args={[4.2, 0.05, 0.06]} />
        <meshBasicMaterial color="#a5f0c2" toneMapped={false} />
      </mesh>
    </group>
  )
}

function PocketPark({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[19, 10.5]} />
        <meshStandardMaterial color="#1d3b2f" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[19, 2]} />
        <meshStandardMaterial color="#4b5a5d" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.047, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2, 10.5]} />
        <meshStandardMaterial color="#4b5a5d" roughness={0.9} />
      </mesh>
      <group position={[0, 0.05, 0]}>
        <mesh position={[0, 0.24, 0]}>
          <cylinderGeometry args={[1.35, 1.5, 0.48, 20]} />
          <meshStandardMaterial color="#65767c" roughness={0.55} metalness={0.35} />
        </mesh>
        <mesh position={[0, 0.43, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.22, 22]} />
          <meshStandardMaterial color="#2c7e93" roughness={0.15} metalness={0.5} emissive="#2b8fa8" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[0, 0.68, 0]}>
          <cylinderGeometry args={[0.12, 0.16, 0.5, 8]} />
          <meshStandardMaterial color="#7d8d93" roughness={0.4} metalness={0.5} />
        </mesh>
        <pointLight position={[0, 1, 0]} intensity={6} distance={10} decay={2} color="#6bd6e8" />
      </group>
      {[
        [-6.5, 3.4, 0],
        [6.5, 3.4, 0],
        [-6.5, -3.4, 0],
        [6.5, -3.4, 0],
      ].map(([x, z]) => (
        <group key={`${x}-${z}`} position={[x, 0, z]}>
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[1.6, 0.12, 0.5]} />
            <meshStandardMaterial color="#6b5b46" roughness={0.8} />
          </mesh>
          <mesh position={[-0.6, 0.2, 0]}>
            <boxGeometry args={[0.12, 0.4, 0.42]} />
            <meshStandardMaterial color="#384247" metalness={0.5} roughness={0.6} />
          </mesh>
          <mesh position={[0.6, 0.2, 0]}>
            <boxGeometry args={[0.12, 0.4, 0.42]} />
            <meshStandardMaterial color="#384247" metalness={0.5} roughness={0.6} />
          </mesh>
        </group>
      ))}
      {[-9.3, 9.3].map((x) =>
        [-5, 5].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 2, z]}>
            <sphereGeometry args={[0.09, 7, 7]} />
            <meshBasicMaterial color="#ffdca8" toneMapped={false} />
          </mesh>
        )),
      )}
    </group>
  )
}

function ZoneDistricts({ day = false }: { day?: boolean }) {
  const solar = useMemo(() => createSolarTexture(), [])

  return (
    <group>
      {/* Zona A · movilidad en todo el tercio central */}
      <EvHub position={[-70, 0, 62]} rotation={0.2} />
      <EvHub position={[70, 0, -62]} rotation={Math.PI + 0.2} />
      <EvHub position={[75, 0, 42]} rotation={Math.PI} />
      <MobilityKiosk position={[-20, 0, 56]} />
      <MobilityKiosk position={[20, 0, -56]} />
      <MobilityKiosk position={[-8, 0, 52]} />
      <WifiPylon position={[-45, 0, 87]} />
      <WifiPylon position={[45, 0, 87]} />
      <WifiPylon position={[-45, 0, -87]} />
      <WifiPylon position={[45, 0, -87]} />
      <WifiPylon position={[10, 0, 68]} />
      <WifiPylon position={[-18, 0, -68]} />
      <PocketPark position={[-48, 0, 67]} />
      <PocketPark position={[48, 0, -67]} />
      <PocketPark position={[-45, 0, -95]} />

      {/* Zona B · seguridad en todo el tercio este */}
      <SecurityCheckpoint position={[112, 0, 60]} />
      <SecurityCheckpoint position={[150, 0, 60]} />
      <SecurityCheckpoint position={[165, 0, 60]} />
      <SecurityCheckpoint position={[90, 0, 60]} />
      <SecurityCheckpoint position={[150, 0, -60]} rotation={Math.PI} />
      <SecurityCheckpoint position={[165, 0, -60]} rotation={Math.PI} />
      <DronePad position={[112, 0, -72]} />
      <DronePad position={[210, 0, 68]} />
      <DronePad position={[205, 0, -68]} />
      <DronePad position={[225, 0, 22]} />
      <SpotlightTower position={[220, 0, 25]} rotation={2.2} />
      <SpotlightTower position={[98, 0, 92]} rotation={0.8} />
      <SpotlightTower position={[106, 0, -100]} rotation={4.2} />
      <SpotlightTower position={[228, 0, -32]} rotation={3.3} />
      <PocketPark position={[200, 0, 120]} />

      {/* Zona C · energía, agua y comunidad en todo el tercio oeste */}
      <SolarFarm position={[-160, 0, 57]} solar={solar} cols={4} rows={3} />
      <SolarFarm position={[-154, 0, -64]} solar={solar} cols={3} rows={4} spacingX={3.2} spacingZ={2.4} />
      <SolarFarm position={[-205, 0, 118]} solar={solar} cols={3} rows={3} />
      <SolarFarm position={[-112, 0, 92]} solar={solar} cols={4} rows={3} spacingX={3} spacingZ={2.4} />
      <SolarFarm position={[-198, 0, -69]} solar={solar} cols={3} rows={3} spacingX={3.1} spacingZ={2.5} />
      <WindTurbine position={[-222, 0, 42]} speed={0.3} />
      <WindTurbine position={[-175, 0, 120]} speed={0.24} />
      <WindTurbine position={[-155, 0, 15]} speed={0.34} />
      <WindTurbine position={[-225, 0, 60]} speed={0.28} />
      <BiogasDome position={[-88, 0, 55]} />
      <VerticalFarm position={[-88, 0, 30]} />
      <PocketPark position={[-214, 0, -60]} />
      <CommunityGarden position={[-150, 0, 40]} />
      <CommunityGarden position={[-120, 0, 126]} />
      <PocketPark position={[-165, 0, 100]} />
      <group position={[-198, 0, 70]}>
        {[-1.5, 1.5].map((x) =>
          [-1.5, 1.5].map((z) => (
            <mesh key={`${x}-${z}`} position={[x, 1.9, z]}>
              <cylinderGeometry args={[0.13, 0.19, 3.8, 6]} />
              <meshStandardMaterial color="#667a82" metalness={0.6} roughness={0.45} />
            </mesh>
          )),
        )}
        <mesh position={[0, 4.15, 0]}>
          <cylinderGeometry args={[1.7, 1.9, 1.9, 16]} />
          <meshStandardMaterial color="#8fa3aa" roughness={0.45} metalness={0.45} />
        </mesh>
        <mesh position={[0, 5.2, 0]}>
          <coneGeometry args={[1.85, 0.8, 16]} />
          <meshStandardMaterial color="#a9bcc1" roughness={0.4} metalness={0.5} />
        </mesh>
        <mesh position={[0, 5.72, 0]}>
          <sphereGeometry args={[0.09, 8, 8]} />
          <meshBasicMaterial color="#ff9a82" toneMapped={false} />
        </mesh>
      </group>
      <group position={[-132, 0, 124]}>
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[2.4, 2.6, 0.1, 18]} />
          <meshStandardMaterial color="#263238" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.55, 0]}>
          <cylinderGeometry args={[2.1, 2.2, 1, 18]} />
          <meshStandardMaterial color="#5f8794" roughness={0.35} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0.72, 0]}>
          <torusGeometry args={[2.16, 0.04, 5, 28]} />
          <meshBasicMaterial color="#6bcddd" toneMapped={false} transparent opacity={0.7} />
        </mesh>
      </group>

      {!day && (
        <group>
          <pointLight position={[-118, 8, 25]} intensity={22} distance={40} decay={2} color="#ffcf8f" />
        </group>
      )}
    </group>
  )
}

function RingRoad() {
  const center = useMemo<Vec3[]>(() => {
    const points: Vec3[] = []
    for (let i = 0; i <= 180; i += 1) {
      const angle = (i / 180) * Math.PI * 2
      points.push([Math.cos(angle) * RING_RX, 0.065, Math.sin(angle) * RING_RZ])
    }
    return points
  }, [])
  const inner = useMemo<Vec3[]>(() => center.map(([x, , z]) => [x * 0.952, 0.06, z * 0.93]), [center])
  const outer = useMemo<Vec3[]>(() => center.map(([x, , z]) => [x * 1.045, 0.06, z * 1.075]), [center])

  return (
    <group>
      <mesh position={[0, 0.034, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[RING_RX / RING_RZ, 1, 1]}>
        <ringGeometry args={[RING_RZ - RING_WIDTH / 2, RING_RZ + RING_WIDTH / 2, 192]} />
        <meshStandardMaterial color="#303b42" roughness={0.8} metalness={0.2} side={THREE.DoubleSide} />
      </mesh>
      <Line points={center} color="#d6e1e5" transparent opacity={0.42} lineWidth={1} dashed dashSize={2.8} gapSize={3.4} />
      <Line points={inner} color="#81949c" transparent opacity={0.36} lineWidth={0.6} />
      <Line points={outer} color="#6d7f87" transparent opacity={0.28} lineWidth={0.6} />
    </group>
  )
}

function Roundabout({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[21, 48]} />
        <meshStandardMaterial color="#253036" roughness={0.82} metalness={0.18} />
      </mesh>
      <mesh position={[0, 0.055, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[9.2, 40]} />
        <meshStandardMaterial color="#1b2326" roughness={0.94} />
      </mesh>
      <mesh position={[0, 0.14, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[8.7, 9.2, 40]} />
        <meshBasicMaterial color="#9aabb1" transparent opacity={0.35} />
      </mesh>
      <mesh position={[0, 1.75, 0]}>
        <cylinderGeometry args={[0.14, 0.28, 3.4, 6]} />
        <meshStandardMaterial color="#536771" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 3.48, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.1, 0.045, 4, 32]} />
        <meshBasicMaterial color="#a6b8be" transparent opacity={0.6} />
      </mesh>
    </group>
  )
}

function FuturisticTower({
  x,
  z,
  h,
  r,
  index,
  accent = '#79E3F2',
  day = false,
}: {
  x: number
  z: number
  h: number
  r: number
  index: number
  accent?: string
  day?: boolean
}) {
  return (
    <group position={[x, 0, z]} rotation={[0, index * 0.52, 0]}>
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[r * 1.7, r * 1.9, 0.36, 12]} />
        <meshStandardMaterial color={day ? '#7c8a91' : '#141e25'} roughness={0.6} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.38, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[r * 1.5, r * 1.72, 32]} />
        <meshBasicMaterial color={accent} transparent opacity={0.55} toneMapped={false} />
      </mesh>
      <mesh position={[0, h / 2 + 0.35, 0]} castShadow>
        <cylinderGeometry args={[r * 0.62, r, h, 10, 1]} />
        <meshStandardMaterial color={day ? '#9aabb3' : '#263943'} roughness={day ? 0.72 : 0.36} metalness={day ? 0.18 : 0.62} />
      </mesh>
      {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((angle) => (
        <Line
          key={angle}
          points={[
            [Math.cos(angle) * r * 0.99, 0.4, Math.sin(angle) * r * 0.99],
            [Math.cos(angle) * r * 0.615, h + 0.3, Math.sin(angle) * r * 0.615],
          ]}
          color={accent}
          transparent
          opacity={day ? 0.35 : 0.7}
          lineWidth={1.1}
        />
      ))}
      {[0.22, 0.44, 0.66, 0.86].map((level, i) => (
        <mesh key={level} position={[0, h * level + 0.35, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[r * (1 - level * 0.3) + 0.1, 0.055, 5, 32]} />
          <meshBasicMaterial color={i % 2 === 0 ? accent : '#d9c39a'} transparent opacity={0.66} toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[0, h + 0.65, 0]}>
        <cylinderGeometry args={[r * 0.52, r * 0.66, 0.55, 10]} />
        <meshStandardMaterial color={day ? '#b4c0c5' : '#31434d'} roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, h + 0.94, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[r * 0.54, 24]} />
        <meshBasicMaterial color={accent} transparent opacity={day ? 0.3 : 0.5} toneMapped={false} />
      </mesh>
      <mesh position={[0, h + 1.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[r * 0.46, 0.045, 4, 28]} />
        <meshBasicMaterial color={accent} transparent opacity={0.75} toneMapped={false} />
      </mesh>
      <mesh position={[0, h + 2.2, 0]}>
        <cylinderGeometry args={[0.035, 0.06, 2.2, 5]} />
        <meshStandardMaterial color="#6f818a" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, h + 3.35, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color="#eef9ff" toneMapped={false} />
      </mesh>
    </group>
  )
}

export function City({ day = false }: { day?: boolean }) {
  const buildings = useMemo(() => buildCityBlocks(), [])
  const windowA = useMemo(() => createWindowTexture(12, 0.34), [])
  const windowB = useMemo(() => createWindowTexture(29, 0.38), [])
  const windowC = useMemo(() => createWindowTexture(47, 0.58), [])
  const facadeA = useMemo(() => createFacadeTexture(12, '#708a94'), [])
  const facadeB = useMemo(() => createFacadeTexture(29, '#776f8d'), [])
  const facadeC = useMemo(() => createFacadeTexture(47, '#8d7e66'), [])
  const asphalt = useMemo(() => createAsphaltTexture(), [])
  const glow = useMemo(() => createGlowTexture(), [])
  const aBuildings = useMemo(() => buildings.filter((b) => b.zone === 'a' && !b.outer), [buildings])
  const bBuildings = useMemo(() => buildings.filter((b) => b.zone === 'b' && !b.outer), [buildings])
  const aOuter = useMemo(() => buildings.filter((b) => b.zone === 'a' && b.outer), [buildings])
  const bOuter = useMemo(() => buildings.filter((b) => b.zone === 'b' && b.outer), [buildings])
  const cOuter = useMemo(() => buildings.filter((b) => b.zone === 'c' && b.outer), [buildings])

  const trees: Vec3[] = useMemo(() => {
    const positions: Vec3[] = [
      [-23, 0, 11.5],
      [-14, 0, 11.5],
      [-4, 0, 11.5],
      [12, 0, 11.5],
      [23, 0, 11.5],
      [-18, 0, -11.5],
      [-8, 0, -11.5],
      [4, 0, -11.5],
      [15, 0, -11.5],
      [-57, 0, 10.5],
      [-37, 0, 10.5],
      [-50, 0, 17.5],
      [-31.5, 0, 25.5],
      [35.5, 0, 11.5],
      [52, 0, 11.5],
      [35.5, 0, -11.5],
      [52, 0, -11.5],
      [-120, 0, 11.5],
      [-100, 0, 11.5],
      [-82, 0, 11.5],
      [82, 0, 11.5],
      [100, 0, 11.5],
      [120, 0, 11.5],
      [-118, 0, -11.5],
      [-96, 0, -11.5],
      [86, 0, -11.5],
      [108, 0, -11.5],
      [-170, 0, 11.5],
      [-210, 0, 11.5],
      [170, 0, 11.5],
      [210, 0, 11.5],
      [-190, 0, -11.5],
      [190, 0, -11.5],
      [-180, 0, 53],
      [-120, 0, 53],
      [-40, 0, 53],
      [40, 0, 53],
      [120, 0, 53],
      [180, 0, 53],
      [-160, 0, -53],
      [-80, 0, -53],
      [80, 0, -53],
      [160, 0, -53],
    ]

    for (let x = -224; x <= 224; x += 22) {
      positions.push([x, 0, 57.5], [x, 0, -57.5])
    }
    for (let x = -212; x <= 212; x += 24) {
      positions.push([x + 6, 0, 87], [x + 6, 0, -87])
      positions.push([x, 0, 101], [x, 0, -101])
    }
    for (let index = 0; index < 18; index += 1) {
      const angle = (index / 18) * Math.PI * 2
      positions.push([Math.cos(angle) * (RING_RX + 14), 0, Math.sin(angle) * (RING_RZ + 13)])
    }
    ;[-132, -125, -118, -111, -104].forEach((x) => positions.push([x, 0, 45]))
    ;[104, 112, 120, 128, 136].forEach((x) => positions.push([x, 0, 47], [x, 0, -47]))
    ;[-154, -150, -146, -108, -104, -100].forEach((z) => positions.push([-152, 0, z], [-103, 0, z]))
    ;[-80, -70, -60, -50, -40, 40, 50, 60, 70, 80].forEach((x) => {
      positions.push([x, 0, 68], [x, 0, -68])
    })
    ;[-164, -158, -152].forEach((x) => {
      ;[88, 94, 100].forEach((z) => positions.push([x, 0, z]))
    })
    ;[-52, -45, -38].forEach((x) => {
      ;[-101, -95, -89].forEach((z) => positions.push([x, 0, z]))
    })
    ;[-226, -220, -214].forEach((x) => {
      ;[-64, -58].forEach((z) => positions.push([x, 0, z]))
    })
    return positions.filter(([x, , z]) => {
      if (isOnTransport(x, z)) return false
      if (buildings.some((building) => Math.abs(x - building.x) < building.w / 2 + 0.9 && Math.abs(z - building.z) < building.d / 2 + 0.9)) return false
      if (TREE_BLOCKERS.some((blocker) => Math.hypot(x - blocker.x, z - blocker.z) < blocker.r)) return false
      return true
    })
  }, [buildings])

  const ringLamps = useMemo<Vec3[]>(
    () =>
      Array.from({ length: 12 }, (_, index) => {
        const angle = (index / 12) * Math.PI * 2
        return [Math.cos(angle) * (RING_RX + 18), 0, Math.sin(angle) * (RING_RZ + 18)]
      }),
    [],
  )

  const streetLights = useMemo(() => {
    const lights: { position: Vec3; facing?: number }[] = []
    const add = (x: number, z: number, facing: number) => lights.push({ position: [x, 0, z], facing })

    ;[-24, -12, 0, 12, 24, 46, 78, 116, 154, 194, 230].forEach((x) => add(x, 10.5, -1))
    ;[-18, -6, 6, 18, -46, -78, -116, -154, -194, -230].forEach((x) => add(x, -10.5, 1))
    ;[-42, -56, -114, -128].forEach((x) => add(x, 9.8, -1))
    ;[
      [-124.5, 17.5],
      [-117.5, 25.5],
      [-110.5, 17.5],
      [-103.8, 25.5],
    ].forEach(([x, z]) => add(x, z, 1))

    ringLamps.forEach(([x, , z], index) => add(x, z, index % 2 === 0 ? 1 : -1))

    ;[-160, -80, 80, 160, 220, -220].forEach((x) => {
      add(x, 54.5, 1)
      add(x, -54.5, -1)
    })
    ;[-140, 0, 140].forEach((x) => {
      add(x, 116.5, 1)
      add(x, -116.5, -1)
    })
    ;[-200, -150, -100, -50, 0, 50, 100, 150, 200].forEach((x) => {
      add(x, 83, 1)
      add(x, -83, -1)
      add(x, 105, 1)
      add(x, -105, -1)
    })

    return lights.filter((light) => !isOnTransport(light.position[0], light.position[2]))
  }, [ringLamps])

  return (
    <group>
      {/* Flota la ciudad sobre una base continua */}
      <RoundedBox args={[CITY_WIDTH + 4, 1.8, CITY_DEPTH + 4]} radius={0.9} smoothness={3} position={[0, -1.02, 0]}>
        <meshStandardMaterial color={day ? '#27343a' : '#0a1015'} roughness={0.42} metalness={0.55} />
      </RoundedBox>
      <Line
        points={[
          [-(CITY_WIDTH / 2 + 1.8), -0.12, -(CITY_DEPTH / 2 + 1.8)],
          [CITY_WIDTH / 2 + 1.8, -0.12, -(CITY_DEPTH / 2 + 1.8)],
          [CITY_WIDTH / 2 + 1.8, -0.12, CITY_DEPTH / 2 + 1.8],
          [-(CITY_WIDTH / 2 + 1.8), -0.12, CITY_DEPTH / 2 + 1.8],
          [-(CITY_WIDTH / 2 + 1.8), -0.12, -(CITY_DEPTH / 2 + 1.8)],
        ]}
        color="#7fa5b4"
        transparent
        opacity={0.16}
        lineWidth={1}
      />
      <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[CITY_WIDTH + 70, CITY_DEPTH + 60]} />
        <meshBasicMaterial map={glow} color="#2f7d99" transparent opacity={day ? 0.02 : 0.08} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Terreno */}
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[CITY_WIDTH - 3, CITY_DEPTH - 3]} />
        <meshStandardMaterial color={day ? '#3b494f' : '#070c10'} roughness={0.94} metalness={0.12} />
      </mesh>
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[CITY_WIDTH, CITY_DEPTH]} />
        <meshBasicMaterial map={glow} color="#1c637c" transparent opacity={day ? 0.03 : 0.12} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <gridHelper args={[CITY_DEPTH, 150, '#16232c', '#0b1319']} position={[0, 0.02, 0]} scale={[CITY_WIDTH / CITY_DEPTH, 1, 1]}>
        <lineBasicMaterial attach="material" transparent opacity={day ? 0.12 : 0.18} />
      </gridHelper>

      {/* Tres terceras partes: zonas A, B y C */}
      {[
        { x: -CITY_WIDTH / 3, color: '#F2C97B' },
        { x: 0, color: '#79E3F2' },
        { x: CITY_WIDTH / 3, color: '#B0A0FF' },
      ].map((band) => (
        <mesh key={band.x} position={[band.x, 0.023, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[CITY_WIDTH / 3, CITY_DEPTH]} />
          <meshBasicMaterial color={band.color} transparent opacity={day ? 0.05 : 0.075} depthWrite={false} />
        </mesh>
      ))}
      {[-CITY_WIDTH / 6, CITY_WIDTH / 6].map((x) => (
        <Line
          key={`zone-boundary-${x}`}
          points={[
            [x, 0.07, -CITY_DEPTH / 2 + 2],
            [x, 0.07, CITY_DEPTH / 2 - 2],
          ]}
          color="#9fb3ba"
          transparent
          opacity={0.34}
          lineWidth={0.9}
        />
      ))}

      {/* Avenida principal */}
      <mesh position={[0, 0.028, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[CITY_WIDTH - 4, 12.5]} />
        <meshStandardMaterial map={asphalt} color="#ffffff" roughness={0.82} metalness={0.15} />
      </mesh>
      {[8.3, -8.3].map((z) => (
        <mesh key={z} position={[0, 0.032, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[CITY_WIDTH - 4, 3.6]} />
          <meshStandardMaterial color="#202b31" roughness={0.82} metalness={0.1} />
        </mesh>
      ))}

      {/* Red vial conectada */}
      {VERTICAL_ROADS.map((x) => (
        <mesh key={`v-${x}`} position={[x, 0.029, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[7.5, CITY_DEPTH - 6]} />
          <meshStandardMaterial map={asphalt} color="#ffffff" roughness={0.85} metalness={0.12} />
        </mesh>
      ))}
      {[-144, -110, -78, -48, 48, 78, 110, 144].map((z) => (
        <mesh key={`h-${z}`} position={[0, 0.029, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[CITY_WIDTH - 4, 7]} />
          <meshStandardMaterial map={asphalt} color="#ffffff" roughness={0.85} metalness={0.12} />
        </mesh>
      ))}

      <RingRoad />
      {ROUNDABOUTS.map((roundabout) => (
        <Roundabout key={`${roundabout.x}-${roundabout.z}`} x={roundabout.x} z={roundabout.z} />
      ))}

      {/* Cordones discretos */}
      {[6.35, -6.35].map((z) => (
        <mesh key={z} position={[0, 0.05, z]}>
          <boxGeometry args={[CITY_WIDTH - 4, 0.06, 0.08]} />
          <meshBasicMaterial color="#6f8790" toneMapped={false} transparent opacity={0.35} />
        </mesh>
      ))}

      {/* Señalización vial */}
      {[-3.1, 3.1].map((z) => (
        <Line
          key={`lane-${z}`}
          points={[
            [-(CITY_WIDTH / 2 - 3), 0.06, z],
            [CITY_WIDTH / 2 - 3, 0.06, z],
          ]}
          color="#b7c3c7"
          transparent
          opacity={0.2}
          lineWidth={0.8}
          dashed
          dashSize={2.2}
          gapSize={3}
        />
      ))}
      {VERTICAL_ROADS.map((x) => (
        <Line
          key={`lane-v-${x}`}
          points={[
            [x, 0.06, -(CITY_DEPTH / 2 - 4)],
            [x, 0.06, CITY_DEPTH / 2 - 4],
          ]}
          color="#a7b4b9"
          transparent
          opacity={0.16}
          lineWidth={0.7}
          dashed
          dashSize={2.6}
          gapSize={3.6}
        />
      ))}
      {[-144, -110, -78, -48, 48, 78, 110, 144].map((z) => (
        <Line
          key={`lane-h-${z}`}
          points={[
            [-(CITY_WIDTH / 2 - 4), 0.06, z],
            [CITY_WIDTH / 2 - 4, 0.06, z],
          ]}
          color="#c2cdd1"
          transparent
          opacity={0.28}
          lineWidth={0.7}
          dashed
          dashSize={2.6}
          gapSize={3.6}
        />
      ))}

      <Crosswalk x={-10} />
      <Crosswalk x={10} />

      <InstancedTrees positions={trees} day={day} />

      <StreetLights lights={streetLights} day={day} />


      <InstancedBuildings buildings={aBuildings} emissive="#cddde3" texture={windowA} facade={facadeA} accent="#79E3F2" emissiveIntensity={day ? 0.16 : 1.0} day={day} dayTint="#b9d5df" />
      <InstancedBuildings buildings={bBuildings} emissive="#d4d1e6" texture={windowB} facade={facadeB} accent="#B0A0FF" emissiveIntensity={day ? 0.16 : 1.0} day={day} dayTint="#c8bce6" />
      <InstancedBuildings buildings={aOuter} emissive="#cddde3" texture={windowA} facade={facadeA} accent="#79E3F2" emissiveIntensity={day ? 0.14 : 0.9} day={day} dayTint="#b9d5df" />
      <InstancedBuildings buildings={bOuter} emissive="#bab5cf" texture={windowB} facade={facadeB} accent="#B0A0FF" emissiveIntensity={day ? 0.14 : 0.88} day={day} dayTint="#c8bce6" />
      <InstancedBuildings buildings={cOuter} emissive="#d8b98c" texture={windowC} facade={facadeC} accent="#F2C97B" emissiveIntensity={day ? 0.14 : 0.84} day={day} dayTint="#d8c197" roofSolar />

      {SPECIAL_TOWERS.map((tower, index) => (
        <FuturisticTower
          key={`${tower.x}-${tower.z}`}
          {...tower}
          index={index}
          day={day}
          accent={tower.x < -80 ? '#F2C97B' : tower.x > 80 ? '#B0A0FF' : '#79E3F2'}
        />
      ))}
      <SignatureBuildings day={day} />

      <TrafficVehicles />
      <Pedestrians />
      <AirTraffic day={day} />
      <IndustryAndResidential day={day} />
      <ZoneDistricts day={day} />
      <Decorations day={day} />
    </group>
  )
}
