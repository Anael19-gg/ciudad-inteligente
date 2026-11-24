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
  zone: 'a' | 'b'
  tint: string
}

const ZONE_TINTS = {
  a: ['#1d2b37', '#243440', '#182531', '#2a3843', '#20303a'],
  b: ['#292c40', '#313450', '#232638', '#363a55', '#2c3046'],
}

function buildCityBlocks(): BuildingSpec[] {
  const rng = makeRng(42)
  const buildings: BuildingSpec[] = []
  const colsA = [-21, -14, -7, 0, 7, 14, 21]
  const rowsA = [
    { z: -27.5, skip: [-21, -14, -7] },
    { z: -17.5, skip: [-21, -14, -7] },
    { z: 17.5, skip: [] as number[] },
    { z: 27.5, skip: [] as number[] },
  ]

  for (const row of rowsA) {
    for (const x of colsA) {
      if (row.skip.includes(x)) continue
      const h = 7 + rng() * 14 + (Math.abs(x) < 10 ? rng() * 6 : 0)
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
    { z: -29, skip: [42, 49.5] },
    { z: -18, skip: [42, 49.5] },
    { z: 17, skip: [] as number[] },
    { z: 28, skip: [] as number[] },
  ]

  for (const row of rowsB) {
    for (const x of colsB) {
      if (row.skip.includes(x)) continue
      const h = 10 + rng() * 20 + (row.z > 0 ? rng() * 5 : 0)
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

  return buildings
}

function InstancedBuildings({
  buildings,
  emissive,
  texture,
}: {
  buildings: BuildingSpec[]
  emissive: string
  texture: THREE.CanvasTexture
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
          emissiveIntensity={0.9}
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

function TowerLights({ buildings }: { buildings: BuildingSpec[] }) {
  const towers = useMemo(() => buildings.filter((b) => b.h > 19).slice(0, 10), [buildings])
  const group = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (!group.current) return
    const t = state.clock.elapsedTime
    const pulse = 0.55 + Math.sin(t * 2.2) * 0.45
    group.current.children.forEach((child) => {
      const material = (child as THREE.Mesh).material
      if (material && 'opacity' in material) {
        ;(material as THREE.MeshBasicMaterial).opacity = pulse
      }
    })
  })

  return (
    <group ref={group}>
      {towers.map((tower, index) => (
        <group key={`${tower.x}-${tower.z}`} position={[tower.x, tower.h, tower.z]}>
          <mesh position={[0, 0.8, 0]}>
            <cylinderGeometry args={[0.035, 0.05, 1.6, 5]} />
            <meshStandardMaterial color="#34414a" metalness={0.6} roughness={0.5} />
          </mesh>
          <mesh position={[0, 1.65, 0]}>
            <sphereGeometry args={[0.09, 8, 8]} />
            <meshBasicMaterial color={index % 3 === 0 ? '#ff8c7a' : '#ffb27a'} toneMapped={false} transparent opacity={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Tree({ position, scale = 1 }: { position: Vec3; scale?: number }) {
  return (
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
    for (const z of [13.5, 21.5, 29.5]) {
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

function ZonePlate({
  center,
  width,
  depth,
  color,
}: {
  center: [number, number]
  width: number
  depth: number
  color: string
}) {
  const x = center[0]
  const z = center[1]
  return (
    <group>
      <mesh position={[x, 0.025, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial color={color} transparent opacity={0.035} depthWrite={false} />
      </mesh>
      <Line
        points={[
          [x - width / 2, 0.07, z - depth / 2],
          [x + width / 2, 0.07, z - depth / 2],
          [x + width / 2, 0.07, z + depth / 2],
          [x - width / 2, 0.07, z + depth / 2],
          [x - width / 2, 0.07, z - depth / 2],
        ]}
        color={color}
        transparent
        opacity={0.4}
        lineWidth={1}
      />
    </group>
  )
}

export function City() {
  const buildings = useMemo(() => buildCityBlocks(), [])
  const windowA = useMemo(() => createWindowTexture(12, 0.08), [])
  const windowB = useMemo(() => createWindowTexture(29, 0.14), [])
  const asphalt = useMemo(() => createAsphaltTexture(), [])
  const glow = useMemo(() => createGlowTexture(), [])
  const aBuildings = useMemo(() => buildings.filter((b) => b.zone === 'a'), [buildings])
  const bBuildings = useMemo(() => buildings.filter((b) => b.zone === 'b'), [buildings])

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
    ],
    [],
  )

  return (
    <group>
      {/* Floating diorama base */}
      <RoundedBox args={[144, 1.8, 96]} radius={0.9} smoothness={3} position={[0, -1.02, 0]}>
        <meshStandardMaterial color="#0a1015" roughness={0.42} metalness={0.55} />
      </RoundedBox>
      <Line
        points={[
          [-71.6, -0.12, -47.6],
          [71.6, -0.12, -47.6],
          [71.6, -0.12, 47.6],
          [-71.6, -0.12, 47.6],
          [-71.6, -0.12, -47.6],
        ]}
        color="#7fa5b4"
        transparent
        opacity={0.22}
        lineWidth={1}
      />
      <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[200, 150]} />
        <meshBasicMaterial map={glow} color="#2f7d99" transparent opacity={0.13} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Terrain */}
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[141, 93]} />
        <meshStandardMaterial color="#070c10" roughness={0.94} metalness={0.12} />
      </mesh>
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[144, 96]} />
        <meshBasicMaterial map={glow} color="#1c637c" transparent opacity={0.24} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <gridHelper args={[96, 48, '#16232c', '#0b1319']} position={[0, 0.02, 0]} scale={[1.458, 1, 1]}>
        <lineBasicMaterial attach="material" transparent opacity={0.32} />
      </gridHelper>

      {/* Zone grounds */}
      <ZonePlate center={[0, 0]} width={46} depth={70} color="#79E3F2" />
      <ZonePlate center={[46, 0]} width={28} depth={70} color="#B0A0FF" />
      <ZonePlate center={[-46, 0]} width={28} depth={70} color="#F2C97B" />

      {/* Roads */}
      <mesh position={[0, 0.028, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[140, 12.5]} />
        <meshStandardMaterial map={asphalt} color="#cdd8dc" roughness={0.88} metalness={0.15} />
      </mesh>
      {[8.3, -8.3].map((z) => (
        <mesh key={z} position={[0, 0.032, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[140, 3.6]} />
          <meshStandardMaterial color="#0c1319" roughness={0.86} metalness={0.1} />
        </mesh>
      ))}
      {[28, -28].map((x) => (
        <mesh key={x} position={[x, 0.029, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[7.5, 90]} />
          <meshStandardMaterial map={asphalt} color="#c8d3d7" roughness={0.9} metalness={0.12} />
        </mesh>
      ))}

      {/* Glowing curbs */}
      {[6.35, -6.35].map((z) => (
        <mesh key={z} position={[0, 0.05, z]}>
          <boxGeometry args={[140, 0.06, 0.1]} />
          <meshBasicMaterial color="#73d8ee" toneMapped={false} transparent opacity={0.75} />
        </mesh>
      ))}
      {[31.85, 24.15, -24.15, -31.85].map((x) => (
        <mesh key={x} position={[x, 0.05, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.09, 0.05, 90]} />
          <meshBasicMaterial color="#4e7d8c" toneMapped={false} transparent opacity={0.4} />
        </mesh>
      ))}

      {/* Lane markings */}
      <Line
        points={[
          [-69, 0.06, 0],
          [69, 0.06, 0],
        ]}
        color="#ffdca8"
        transparent
        opacity={0.32}
        lineWidth={1.1}
        dashed
        dashSize={2.4}
        gapSize={2.8}
      />
      {[3.1, -3.1].map((z) => (
        <Line
          key={z}
          points={[
            [-69, 0.06, z],
            [69, 0.06, z],
          ]}
          color="#d9f0f5"
          transparent
          opacity={0.24}
          lineWidth={0.8}
          dashed
          dashSize={2.2}
          gapSize={3}
        />
      ))}

      <Crosswalk x={-10} />
      <Crosswalk x={10} />

      {trees.map((position, index) => (
        <Tree key={index} position={position} scale={index > 8 ? 1.15 : 1} />
      ))}

      {[-24, -12, 0, 12, 24].map((x) => (
        <StreetLight key={`s-${x}`} position={[x, 0, 10.5]} facing={-1} />
      ))}
      {[-18, -6, 6, 18].map((x) => (
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

      <InstancedBuildings buildings={aBuildings} emissive="#9bdcff" texture={windowA} />
      <InstancedBuildings buildings={bBuildings} emissive="#b6b0ff" texture={windowB} />
      <TowerLights buildings={[...aBuildings, ...bBuildings]} />

      <IndustryAndResidential />
    </group>
  )
}
