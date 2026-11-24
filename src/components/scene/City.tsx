import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Edges, Line, RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { createAsphaltTexture, createGlowTexture, createSolarTexture, createWindowTexture } from '../../lib/textures'
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

function buildOuterBlocks(): BuildingSpec[] {
  const rng = makeRng(118)
  const outer: BuildingSpec[] = []

  for (let x = -(CITY_WIDTH / 2 - 8); x <= CITY_WIDTH / 2 - 8; x += 9.5) {
    for (let z = -(CITY_DEPTH / 2 - 8); z <= CITY_DEPTH / 2 - 8; z += 9.5) {
      if (Math.abs(x) <= 66 && Math.abs(z) <= 44) continue
      if (Math.abs(z) < 12) continue
      if (VERTICAL_ROADS.some((road) => Math.abs(x - road) < 8)) continue
      if (HORIZONTAL_ROADS.some((road) => Math.abs(z - road) < 7.5)) continue
      if (Math.hypot(x / RING_RX, z / RING_RZ) > 0.9 && Math.hypot(x / RING_RX, z / RING_RZ) < 1.1) continue
      if (ROUNDABOUTS.some((roundabout) => Math.hypot(x - roundabout.x, z - roundabout.z) < 24)) continue
      if (SPECIAL_TOWERS.some((tower) => Math.hypot(x - tower.x, z - tower.z) < 13)) continue
      if (rng() > 0.78) continue

      const east = x > 0
      const periphery = Math.abs(z) > 52
      let h: number
      if (east) {
        h = 4 + rng() * 13 + (periphery ? rng() * 3 : 0)
      } else {
        h = 2.5 + rng() * 7 + (periphery ? rng() * 4 : 0)
      }
      if (rng() < 0.06) h += 4

      outer.push({
        x,
        z,
        w: 4.4 + rng() * 2.1,
        d: 4.6 + rng() * 2.2,
        h,
        zone: east ? 'b' : 'c',
        outer: true,
        tint: (east ? ZONE_TINTS.b : ZONE_TINTS.c)[
          Math.floor(rng() * (east ? ZONE_TINTS.b.length : ZONE_TINTS.c.length))
        ],
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
      const h = 6 + rng() * 13 + (Math.abs(x) < 10 && Math.abs(row.z) < 33 ? rng() * 6 : 0)
      const w = 4.6 + rng() * 1.5
      const d = 5.2 + rng() * 1.4
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

  const colsB = [34.5, 42, 49.5, 57]
  const rowsB = [
    { z: -40, skip: [42, 49.5] },
    { z: -29, skip: [42, 49.5] },
    { z: -18, skip: [42, 49.5] },
    { z: 17, skip: [] as number[] },
    { z: 28, skip: [] as number[] },
    { z: 40, skip: [] as number[] },
  ]

  for (const row of rowsB) {
    for (const x of colsB) {
      if (row.skip.includes(x)) continue
      const h = 9 + rng() * 19 + (row.z > 0 ? rng() * 5 : 0)
      const w = 4.4 + rng() * 1.6
      const d = 5 + rng() * 1.8
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
  emissiveIntensity = 0.5,
}: {
  buildings: BuildingSpec[]
  emissive: string
  texture: THREE.CanvasTexture
  emissiveIntensity?: number
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const roofRef = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    if (!meshRef.current || !roofRef.current) return
    const matrix = new THREE.Matrix4()
    const position = new THREE.Vector3()
    const quaternion = new THREE.Quaternion()
    const scale = new THREE.Vector3()
    const color = new THREE.Color()

    buildings.forEach((b, i) => {
      position.set(b.x, b.h / 2, b.z)
      scale.set(b.w, b.h, b.d)
      matrix.compose(position, quaternion, scale)
      meshRef.current!.setMatrixAt(i, matrix)
      meshRef.current!.setColorAt(i, color.set(b.tint))

      position.set(b.x, b.h + 0.12, b.z)
      scale.set(b.w + 0.18, 0.28, b.d + 0.18)
      matrix.compose(position, quaternion, scale)
      roofRef.current!.setMatrixAt(i, matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
    roofRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
  }, [buildings])

  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, buildings.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          roughness={0.5}
          metalness={0.45}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
          emissiveMap={texture}
          color="#ffffff"
        />
      </instancedMesh>
      <instancedMesh ref={roofRef} args={[undefined, undefined, buildings.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#0a1015" roughness={0.75} metalness={0.3} />
      </instancedMesh>
    </group>
  )
}

function Tree({ position, scale = 1 }: { position: Vec3; scale?: number }) {  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 1.3, 6]} />
        <meshStandardMaterial color="#2b2a23" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.7, 0]}>
        <icosahedronGeometry args={[0.78, 0]} />
        <meshStandardMaterial color="#173f39" roughness={0.85} flatShading />
      </mesh>
      <mesh position={[0.25, 2.25, 0.1]}>
        <icosahedronGeometry args={[0.56, 0]} />
        <meshStandardMaterial color="#1c4a3f" roughness={0.85} flatShading />
      </mesh>
    </group>
  )
}

function StreetLight({ position, facing = 1 }: { position: Vec3; facing?: number }) {
  return (
    <group position={position}>
      <mesh position={[0, 2.2, 0]}>
        <cylinderGeometry args={[0.045, 0.065, 4.4, 6]} />
        <meshStandardMaterial color="#334149" metalness={0.6} roughness={0.5} />
      </mesh>
      <mesh position={[0, 4.36, 0.4 * facing]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.8, 6]} />
        <meshStandardMaterial color="#334149" metalness={0.6} roughness={0.5} />
      </mesh>
      <mesh position={[0, 4.3, 0.8 * facing]}>
        <sphereGeometry args={[0.12, 10, 10]} />
        <meshBasicMaterial color="#ffd7a2" toneMapped={false} />
      </mesh>
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

function House({ position, lit = 0.6 }: { position: Vec3; lit?: number }) {
  const rng = makeRng(Math.round(position[0] * 13 + position[2] * 7))
  const warm = rng() < lit
  return (
    <group position={position}>
      <mesh position={[0, 1.25, 0]}>
        <boxGeometry args={[3.4, 2.5, 3.8]} />
        <meshStandardMaterial color="#2b2b2c" roughness={0.85} />
      </mesh>
      <mesh position={[0, 2.7, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[2.9, 1.35, 4]} />
        <meshStandardMaterial color="#1b2024" roughness={0.8} flatShading />
      </mesh>
      <mesh position={[0, 1.35, 1.92]}>
        <planeGeometry args={[0.7, 0.85]} />
        <meshBasicMaterial color={warm ? '#ffce8f' : '#132b38'} toneMapped={false} transparent opacity={warm ? 0.85 : 0.6} />
      </mesh>
      <mesh position={[-1.72, 1.35, 0.4]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.55, 0.7]} />
        <meshBasicMaterial color={rng() < 0.5 ? '#ffce8f' : '#132b38'} toneMapped={false} transparent opacity={0.6} />
      </mesh>
      <mesh position={[1.72, 0.9, -0.4]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.38, 0.5, 0.22]} />
        <meshStandardMaterial color="#0c1820" emissive="#5fd8ff" emissiveIntensity={2.2} />
      </mesh>
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.9, 16]} />
        <meshBasicMaterial color="#1a2b25" transparent opacity={0.5} depthWrite={false} />
      </mesh>
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

function IndustryAndResidential() {
  const solar = useMemo(() => createSolarTexture(), [])
  const housePositions: Vec3[] = useMemo(() => {
    const positions: Vec3[] = []
    for (const z of [13.5, 21.5, 29.5, 37.5]) {
      for (const x of [-56.5, -49.5, -42.5, -35.5]) {
        positions.push([x, 0, z])
      }
    }
    return positions
  }, [])

  return (
    <group>
      {housePositions.map((position, index) => (
        <House key={index} position={position} lit={index % 3 === 0 ? 0.9 : 0.55} />
      ))}

      {/* Residential streets */}
      {[17.5, 25.5, 33.5].map((z) => (
        <mesh key={z} position={[-46, 0.034, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[27, 2.3]} />
          <meshStandardMaterial color="#0c1217" roughness={0.92} />
        </mesh>
      ))}
      <mesh position={[-31.8, 0.034, 25]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.2, 27]} />
        <meshStandardMaterial color="#0c1217" roughness={0.92} />
      </mesh>

      {/* Industrial campus */}
      <group position={[-51.5, 0, -27]}>
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

      <group position={[-35.6, 0, -27.5]}>
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
      <group position={[-42, 0, -15.5]}>
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
      <group position={[-53.5, 0, -14.5]}>
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

      <WindTurbine position={[-58, 0, -34]} speed={0.32} />
      <WindTurbine position={[-33.5, 0, -34]} speed={0.44} />
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
}: {
  x: number
  z: number
  h: number
  r: number
  index: number
}) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[r * 1.7, r * 1.9, 0.36, 10]} />
        <meshStandardMaterial color="#111920" roughness={0.6} metalness={0.4} />
      </mesh>
      <mesh position={[0, h / 2 + 0.35, 0]}>
        <cylinderGeometry args={[r * 0.62, r, h, 8, 1]} />
        <meshStandardMaterial color="#1a252d" roughness={0.34} metalness={0.68} />
      </mesh>
      {[0.28, 0.54, 0.78].map((level, i) => (
        <mesh key={level} position={[0, h * level + 0.35, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[r * (1 - level * 0.28) + 0.1, 0.045, 4, 28]} />
          <meshBasicMaterial color={i % 2 === 0 ? '#a9ccd7' : '#cbb083'} transparent opacity={0.55} toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[0, h + 0.65, 0]}>
        <cylinderGeometry args={[r * 0.52, r * 0.66, 0.55, 8]} />
        <meshStandardMaterial color="#26343d" roughness={0.3} metalness={0.72} />
      </mesh>
      <mesh position={[0, h + 1.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[r * 0.46, 0.04, 4, 28]} />
        <meshBasicMaterial color={index % 2 === 0 ? '#c4dbe3' : '#d5bb8c'} transparent opacity={0.65} />
      </mesh>
      <mesh position={[0, h + 2.2, 0]}>
        <cylinderGeometry args={[0.035, 0.06, 2.2, 5]} />
        <meshStandardMaterial color="#465963" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, h + 3.35, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#d6e6eb" toneMapped={false} />
      </mesh>
    </group>
  )
}

function CarModel({ color = '#aebdc4' }: { color?: string }) {
  return (
    <group>
      <RoundedBox args={[2.3, 0.52, 1.08]} radius={0.16} smoothness={2} position={[0, 0.46, 0]}>
        <meshStandardMaterial color={color} roughness={0.34} metalness={0.6} />
      </RoundedBox>
      <mesh position={[-0.15, 0.79, 0]}>
        <boxGeometry args={[1.18, 0.38, 0.9]} />
        <meshStandardMaterial color="#0d1920" roughness={0.18} metalness={0.55} emissive="#1a3b47" emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <boxGeometry args={[2.1, 0.08, 0.96]} />
        <meshBasicMaterial color="#81a8b6" transparent opacity={0.55} toneMapped={false} />
      </mesh>
      {[-0.75, 0.75].map((x) =>
        [-0.56, 0.56].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 0.27, z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.23, 0.23, 0.16, 10]} />
            <meshStandardMaterial color="#080d10" roughness={0.7} />
          </mesh>
        )),
      )}
      <mesh position={[1.16, 0.52, 0]}>
        <boxGeometry args={[0.05, 0.18, 0.9]} />
        <meshBasicMaterial color="#e8f6fa" toneMapped={false} />
      </mesh>
      <mesh position={[-1.16, 0.5, 0]}>
        <boxGeometry args={[0.04, 0.12, 0.72]} />
        <meshBasicMaterial color="#d8806e" toneMapped={false} />
      </mesh>
    </group>
  )
}

function CityCar({
  lane,
  direction,
  offset,
  speed,
  color,
}: {
  lane: number
  direction: 1 | -1
  offset: number
  speed: number
  color?: string
}) {
  const group = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (!group.current) return
    const travel = (offset + clock.elapsedTime * speed) % (CITY_WIDTH - 8)
    group.current.position.x = direction === 1 ? -(CITY_WIDTH / 2 - 4) + travel : CITY_WIDTH / 2 - 4 - travel
  })

  return (
    <group ref={group} position={[0, 0, lane]} rotation={[0, direction === 1 ? 0 : Math.PI, 0]}>
      <CarModel color={color} />
    </group>
  )
}

export function City() {
  const buildings = useMemo(() => buildCityBlocks(), [])
  const windowA = useMemo(() => createWindowTexture(12, 0.34), [])
  const windowB = useMemo(() => createWindowTexture(29, 0.38), [])
  const windowC = useMemo(() => createWindowTexture(47, 0.58), [])
  const asphalt = useMemo(() => createAsphaltTexture(), [])
  const glow = useMemo(() => createGlowTexture(), [])
  const aBuildings = useMemo(() => buildings.filter((b) => b.zone === 'a' && !b.outer), [buildings])
  const bBuildings = useMemo(() => buildings.filter((b) => b.zone === 'b' && !b.outer), [buildings])
  const bOuter = useMemo(() => buildings.filter((b) => b.zone === 'b' && b.outer), [buildings])
  const cOuter = useMemo(() => buildings.filter((b) => b.zone === 'c' && b.outer), [buildings])

  const trees: Vec3[] = useMemo(
    () => [
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
    ],
    [],
  )

  const ringLamps = useMemo<Vec3[]>(
    () =>
      Array.from({ length: 12 }, (_, index) => {
        const angle = (index / 12) * Math.PI * 2
        return [Math.cos(angle) * (RING_RX + 9), 0, Math.sin(angle) * (RING_RZ + 10)]
      }),
    [],
  )

  return (
    <group>
      {/* Flota la ciudad sobre una base continua */}
      <RoundedBox args={[CITY_WIDTH + 4, 1.8, CITY_DEPTH + 4]} radius={0.9} smoothness={3} position={[0, -1.02, 0]}>
        <meshStandardMaterial color="#0a1015" roughness={0.42} metalness={0.55} />
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
        <meshBasicMaterial map={glow} color="#2f7d99" transparent opacity={0.08} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Terreno */}
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[CITY_WIDTH - 3, CITY_DEPTH - 3]} />
        <meshStandardMaterial color="#070c10" roughness={0.94} metalness={0.12} />
      </mesh>
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[CITY_WIDTH, CITY_DEPTH]} />
        <meshBasicMaterial map={glow} color="#1c637c" transparent opacity={0.12} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <gridHelper args={[CITY_DEPTH, 150, '#16232c', '#0b1319']} position={[0, 0.02, 0]} scale={[CITY_WIDTH / CITY_DEPTH, 1, 1]}>
        <lineBasicMaterial attach="material" transparent opacity={0.2} />
      </gridHelper>

      {/* Avenida principal */}
      <mesh position={[0, 0.028, 0]} rotation={[-Math.PI / 2, 0, 0]}>
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
        <mesh key={`v-${x}`} position={[x, 0.029, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[7.5, CITY_DEPTH - 6]} />
          <meshStandardMaterial map={asphalt} color="#ffffff" roughness={0.85} metalness={0.12} />
        </mesh>
      ))}
      {[-144, -110, -78, -48, 48, 78, 110, 144].map((z) => (
        <mesh key={`h-${z}`} position={[0, 0.029, z]} rotation={[-Math.PI / 2, 0, 0]}>
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

      {trees.map((position, index) => (
        <Tree key={index} position={position} scale={index > 8 ? 1.15 : 1} />
      ))}

      {[-24, -12, 0, 12, 24, 46, 78, 116, 154, 194, 230].map((x) => (
        <StreetLight key={`s-${x}`} position={[x, 0, 10.5]} facing={-1} />
      ))}
      {[-18, -6, 6, 18, -46, -78, -116, -154, -194, -230].map((x) => (
        <StreetLight key={`n-${x}`} position={[x, 0, -10.5]} facing={1} />
      ))}
      {[-42, -56].map((x) => (
        <StreetLight key={`c-${x}`} position={[x, 0, 9.8]} facing={-1} />
      ))}
      {[
        [-52.5, 17.5],
        [-45.5, 25.5],
        [-38.5, 17.5],
        [-31.8, 25.5],
      ].map(([x, z]) => (
        <StreetLight key={`r-${x}-${z}`} position={[x, 0, z]} facing={1} />
      ))}

      {ringLamps.map((position, index) => (
        <StreetLight key={`ring-${index}`} position={position} facing={index % 2 === 0 ? 1 : -1} />
      ))}

      <InstancedBuildings buildings={aBuildings} emissive="#cddde3" texture={windowA} emissiveIntensity={0.65} />
      <InstancedBuildings buildings={bBuildings} emissive="#d4d1e6" texture={windowB} emissiveIntensity={0.65} />
      <InstancedBuildings buildings={bOuter} emissive="#bab5cf" texture={windowB} emissiveIntensity={0.36} />
      <InstancedBuildings buildings={cOuter} emissive="#d8b98c" texture={windowC} emissiveIntensity={0.3} />

      {SPECIAL_TOWERS.map((tower, index) => (
        <FuturisticTower key={`${tower.x}-${tower.z}`} {...tower} index={index} />
      ))}

      <CityCar lane={-4.4} direction={1} offset={20} speed={10.8} color="#b7c5cb" />
      <CityCar lane={-4.4} direction={1} offset={170} speed={9.6} color="#8fa3ac" />
      <CityCar lane={-4.4} direction={1} offset={330} speed={11.4} color="#c8d0d4" />
      <CityCar lane={4.4} direction={-1} offset={60} speed={10.2} color="#9eb0b8" />
      <CityCar lane={4.4} direction={-1} offset={220} speed={9.1} color="#c3ccd0" />
      <CityCar lane={4.4} direction={-1} offset={380} speed={11.9} color="#8da0a9" />
      <CityCar lane={49.5} direction={1} offset={80} speed={9.7} color="#a8b7bd" />
      <CityCar lane={49.5} direction={1} offset={280} speed={11.1} color="#c1ccd0" />
      <CityCar lane={-49.5} direction={-1} offset={140} speed={10.4} color="#96a8b0" />
      <CityCar lane={-49.5} direction={-1} offset={360} speed={9.3} color="#b9c5ca" />

      <IndustryAndResidential />
    </group>
  )
}
