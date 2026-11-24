import { useMemo } from 'react'
import { Line } from '@react-three/drei'
import * as THREE from 'three'

type Vec3 = [number, number, number]

const CYAN = '#7fe8f6'
const GREEN = '#8ee6b4'
const AMBER = '#f4c37a'
const RED = '#ff8674'
const WHITE = '#eafcff'
const WARM = '#ffe3b2'

const PLAZA_TOP = 0.44

const BOX = new THREE.BoxGeometry(1, 1, 1)
const CYLINDER = new THREE.CylinderGeometry(1, 1, 1, 12)
const SPHERE = new THREE.SphereGeometry(1, 10, 8)
const RING = new THREE.RingGeometry(0.9, 1, 40)

interface CivicMaterials {
  plazaBase: THREE.MeshStandardMaterial
  plazaDeck: THREE.MeshStandardMaterial
  plazaInset: THREE.MeshStandardMaterial
  path: THREE.MeshStandardMaterial
  concrete: THREE.MeshStandardMaterial
  concreteLight: THREE.MeshStandardMaterial
  concreteDark: THREE.MeshStandardMaterial
  structural: THREE.MeshStandardMaterial
  metal: THREE.MeshStandardMaterial
  metalDark: THREE.MeshStandardMaterial
  glass: THREE.MeshStandardMaterial
  wood: THREE.MeshStandardMaterial
  green: THREE.MeshStandardMaterial
  greenSoft: THREE.MeshStandardMaterial
  red: THREE.MeshStandardMaterial
  fabric: THREE.MeshStandardMaterial
  winCyan: THREE.MeshStandardMaterial
  winGreen: THREE.MeshStandardMaterial
  winAmber: THREE.MeshStandardMaterial
  winWhite: THREE.MeshStandardMaterial
  glowCyan: THREE.MeshBasicMaterial
  glowGreen: THREE.MeshBasicMaterial
  glowAmber: THREE.MeshBasicMaterial
  glowRed: THREE.MeshBasicMaterial
  glowWarm: THREE.MeshBasicMaterial
  glowWhite: THREE.MeshBasicMaterial
}

function standard(params: THREE.MeshStandardMaterialParameters) {
  return new THREE.MeshStandardMaterial(params)
}

function basicGlow(color: string, opacity: number) {
  return new THREE.MeshBasicMaterial({ color, transparent: true, opacity, toneMapped: false })
}

function createCivicMaterials(day: boolean): CivicMaterials {
  return {
    plazaBase: standard({ color: day ? '#4a565b' : '#090f13', roughness: 0.95, metalness: 0.1 }),
    plazaDeck: standard({ color: day ? '#687479' : '#101a20', roughness: 0.84, metalness: 0.2 }),
    plazaInset: standard({ color: day ? '#3e4b50' : '#0b1419', roughness: 0.9, metalness: 0.15 }),
    path: standard({ color: day ? '#a1aaab' : '#223137', roughness: 0.78, metalness: 0.2 }),
    concrete: standard({ color: day ? '#aab4b6' : '#62737b', roughness: 0.72, metalness: 0.12 }),
    concreteLight: standard({ color: day ? '#d9dedc' : '#8d9da2', roughness: 0.62, metalness: 0.08 }),
    concreteDark: standard({ color: day ? '#5d6c72' : '#25353d', roughness: 0.78, metalness: 0.22 }),
    structural: standard({ color: day ? '#35464e' : '#122129', roughness: 0.5, metalness: 0.55 }),
    metal: standard({ color: day ? '#a4afb2' : '#61747c', roughness: 0.32, metalness: 0.8 }),
    metalDark: standard({ color: day ? '#34444b' : '#101c22', roughness: 0.38, metalness: 0.72 }),
    glass: standard({
      color: day ? '#1c3c48' : '#071b24',
      emissive: CYAN,
      emissiveIntensity: day ? 0.06 : 0.5,
      roughness: 0.12,
      metalness: 0.78,
    }),
    wood: standard({ color: day ? '#a17c50' : '#5c452e', roughness: 0.88, metalness: 0.04 }),
    green: standard({ color: day ? '#4d7e56' : '#1c3525', roughness: 0.92, metalness: 0.02 }),
    greenSoft: standard({ color: day ? '#6f9a6b' : '#2b4932', roughness: 0.88, metalness: 0.02 }),
    red: standard({
      color: day ? '#b4473f' : '#7c2924',
      emissive: RED,
      emissiveIntensity: day ? 0.04 : 0.4,
      roughness: 0.5,
      metalness: 0.25,
    }),
    fabric: standard({
      color: day ? '#c68c50' : '#6f4a2b',
      emissive: AMBER,
      emissiveIntensity: day ? 0.02 : 0.16,
      roughness: 0.85,
      metalness: 0.02,
    }),
    winCyan: standard({
      color: day ? '#25454d' : '#0b2630',
      emissive: CYAN,
      emissiveIntensity: day ? 0.1 : 1.35,
      roughness: 0.25,
      metalness: 0.36,
    }),
    winGreen: standard({
      color: day ? '#2a4a3b' : '#0a281e',
      emissive: GREEN,
      emissiveIntensity: day ? 0.1 : 1.25,
      roughness: 0.28,
      metalness: 0.3,
    }),
    winAmber: standard({
      color: day ? '#4e4030' : '#281f12',
      emissive: AMBER,
      emissiveIntensity: day ? 0.1 : 1.3,
      roughness: 0.3,
      metalness: 0.25,
    }),
    winWhite: standard({
      color: day ? '#dbe6e7' : '#8ea4a9',
      emissive: WHITE,
      emissiveIntensity: day ? 0.04 : 0.85,
      roughness: 0.25,
      metalness: 0.2,
    }),
    glowCyan: basicGlow(CYAN, day ? 0.38 : 1),
    glowGreen: basicGlow(GREEN, day ? 0.38 : 1),
    glowAmber: basicGlow(AMBER, day ? 0.38 : 1),
    glowRed: basicGlow(RED, day ? 0.36 : 1),
    glowWarm: basicGlow(WARM, day ? 0.5 : 1),
    glowWhite: basicGlow(WHITE, day ? 0.55 : 1),
  }
}

function Block({
  position,
  size,
  material,
  rotation,
  cast = false,
  receive = false,
}: {
  position: Vec3
  size: Vec3
  material: THREE.Material
  rotation?: Vec3
  cast?: boolean
  receive?: boolean
}) {
  return (
    <mesh
      geometry={BOX}
      material={material}
      position={position}
      rotation={rotation}
      scale={size}
      castShadow={cast}
      receiveShadow={receive}
    />
  )
}

function Cylinder({
  position,
  radius,
  height,
  material,
  rotation,
  cast = false,
}: {
  position: Vec3
  radius: number
  height: number
  material: THREE.Material
  rotation?: Vec3
  cast?: boolean
}) {
  return (
    <mesh
      geometry={CYLINDER}
      material={material}
      position={position}
      rotation={rotation}
      scale={[radius, height, radius]}
      castShadow={cast}
    />
  )
}

function Orb({ position, radius, material }: { position: Vec3; radius: number; material: THREE.Material }) {
  return <mesh geometry={SPHERE} material={material} position={position} scale={[radius, radius, radius]} />
}

function Bollard({ position, height = 0.7, material }: { position: Vec3; height?: number; material: THREE.Material }) {
  return <Cylinder position={[position[0], height / 2, position[2]]} radius={0.075} height={height} material={material} />
}

function PlazaLamp({ position, mat, glow }: { position: Vec3; mat: CivicMaterials; glow: THREE.MeshBasicMaterial }) {
  return (
    <group position={position}>
      <Cylinder position={[0, 1.6, 0]} radius={0.07} height={3.2} material={mat.metalDark} cast />
      <Block position={[0, 3.28, 0]} size={[0.46, 0.16, 0.46]} material={glow} />
    </group>
  )
}

function PlazaBench({ position, rotation = 0, mat }: { position: Vec3; rotation?: number; mat: CivicMaterials }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <Block position={[0, 0.21, 0]} size={[1.9, 0.42, 0.62]} material={mat.wood} cast />
      <Block position={[0, 0.68, -0.26]} size={[1.9, 0.58, 0.08]} material={mat.wood} />
    </group>
  )
}

function rectOutline(width: number, depth: number, y: number, centerX = 0, centerZ = 0): Vec3[] {
  const halfW = width / 2
  const halfD = depth / 2
  return [
    [centerX - halfW, y, centerZ - halfD],
    [centerX + halfW, y, centerZ - halfD],
    [centerX + halfW, y, centerZ + halfD],
    [centerX - halfW, y, centerZ + halfD],
    [centerX - halfW, y, centerZ - halfD],
  ]
}

function CivicPlaza({
  day,
  mat,
  width,
  depth,
  accent,
  glow,
  position = [0, 0, 0],
}: {
  day: boolean
  mat: CivicMaterials
  width: number
  depth: number
  accent: string
  glow: THREE.MeshBasicMaterial
  position?: Vec3
}) {
  const halfW = width / 2
  const halfD = depth / 2

  return (
    <group position={position}>
      <Block position={[0, 0.07, 0]} size={[width, 0.14, depth]} material={mat.plazaBase} receive />
      <Block
        position={[0, 0.27, 0]}
        size={[width - 1.7, 0.34, depth - 1.7]}
        material={mat.plazaDeck}
        receive
      />
      <Block position={[0, 0.455, -halfD + 1.35]} size={[width - 3.2, 0.03, 0.16]} material={glow} />
      <Block position={[0, 0.455, halfD - 1.35]} size={[width - 3.2, 0.03, 0.16]} material={glow} />
      <Block position={[-halfW + 1.35, 0.455, 0]} size={[0.16, 0.03, depth - 3.2]} material={glow} />
      <Block position={[halfW - 1.35, 0.455, 0]} size={[0.16, 0.03, depth - 3.2]} material={glow} />
      <Line
        points={rectOutline(width - 2, depth - 2, 0.45)}
        color={accent}
        transparent
        opacity={day ? 0.26 : 0.78}
        lineWidth={0.8}
      />
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* 1 · Escuela · Zona C                                               */
/* ------------------------------------------------------------------ */

const SCHOOL_WINDOWS: { position: Vec3; size: Vec3 }[] = [
  { position: [-4.8, 2.0, -3.04], size: [1.8, 1.1, 0.09] },
  { position: [4.8, 2.0, -3.04], size: [1.8, 1.1, 0.09] },
  { position: [-6.32, 2.0, -0.6], size: [0.09, 1.1, 2.2] },
  { position: [6.32, 2.0, -0.6], size: [0.09, 1.1, 2.2] },
  { position: [-3.8, 2.05, 1.51], size: [1.6, 1.15, 0.09] },
  { position: [3.8, 2.05, 1.51], size: [1.6, 1.15, 0.09] },
]

const SCHOOL_BENCHES: { position: Vec3; rotation: number }[] = [
  { position: [-2.55, 0.07, -1.5], rotation: Math.PI / 2 },
  { position: [2.55, 0.07, -1.5], rotation: -Math.PI / 2 },
  { position: [2.55, 0.07, 0.7], rotation: -Math.PI / 2 },
]

const SCHOOL_LAMPS: Vec3[] = [
  [-3.15, 0, -3.9],
  [3.15, 0, -3.9],
]

const SCHOOL_BOLLARDS: Vec3[] = [
  [-1.25, 0, -4.7],
  [0, 0, -4.9],
  [1.25, 0, -4.7],
]

function School({ day, mat }: { day: boolean; mat: CivicMaterials }) {
  return (
    <group position={[-120, 0, 60]}>
      <CivicPlaza day={day} mat={mat} width={17.2} depth={12.6} accent={CYAN} glow={mat.glowCyan} />
      <group position={[0, PLAZA_TOP, 0]}>
        <Block position={[0, 0.035, -0.8]} size={[6.5, 0.07, 4.4]} material={mat.plazaInset} receive />
        <Block position={[0, 0.18, -0.8]} size={[2.6, 0.36, 2.6]} material={mat.green} receive />
        <mesh
          geometry={RING}
          material={mat.glowCyan}
          position={[0, 0.08, -0.8]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[2.2, 2.2, 1]}
        />

        <Block position={[0, 2.3, 3.0]} size={[12.6, 4.6, 3.0]} material={mat.concrete} cast receive />
        <Block position={[-4.8, 1.9, 0]} size={[3.0, 3.8, 6.0]} material={mat.concrete} cast receive />
        <Block position={[4.8, 1.9, 0]} size={[3.0, 3.8, 6.0]} material={mat.concrete} cast receive />

        {SCHOOL_WINDOWS.map((window, index) => (
          <Block key={index} position={window.position} size={window.size} material={mat.winCyan} />
        ))}

        <Block position={[0, 2.6, 0.8]} size={[4.6, 0.2, 2.0]} material={mat.metalDark} cast />
        <Cylinder position={[-1.9, 1.3, 0.2]} radius={0.09} height={2.6} material={mat.metal} cast />
        <Cylinder position={[1.9, 1.3, 0.2]} radius={0.09} height={2.6} material={mat.metal} cast />
        <Block position={[0, 1.5, 1.44]} size={[3.0, 3.0, 0.16]} material={mat.metalDark} />
        <Block position={[0, 1.45, 1.33]} size={[2.4, 2.6, 0.08]} material={mat.glass} />

        <Cylinder position={[0, 0.45, -0.8]} radius={0.3} height={0.18} material={mat.metal} />
        <Cylinder position={[0, 2.49, -0.8]} radius={0.045} height={4.0} material={mat.metal} />
        <Block position={[0.7, 4.05, -0.8]} size={[1.35, 0.75, 0.05]} material={mat.winCyan} />
        <Orb position={[0, 4.54, -0.8]} radius={0.08} material={mat.glowWhite} />

        <Block position={[-4.8, 3.86, -0.3]} size={[1.4, 0.1, 2.0]} material={mat.winCyan} />
        <Block position={[4.8, 3.86, -0.3]} size={[1.4, 0.1, 2.0]} material={mat.winCyan} />
        <Block position={[-4.9, 5.15, 3.0]} size={[1.7, 1.1, 1.7]} material={mat.concreteDark} cast />
        {[-1.7, 0.7].map((x) => (
          <Block
            key={x}
            position={[x, 4.72, 2.8]}
            size={[1.9, 0.06, 1.3]}
            material={mat.glass}
            rotation={[-0.35, 0, 0]}
            cast
          />
        ))}

        {SCHOOL_BENCHES.map((bench, index) => (
          <PlazaBench key={index} position={bench.position} rotation={bench.rotation} mat={mat} />
        ))}
        {SCHOOL_LAMPS.map((position) => (
          <PlazaLamp key={position[0]} position={position} mat={mat} glow={mat.glowWarm} />
        ))}
        {SCHOOL_BOLLARDS.map((position) => (
          <Bollard key={position[0]} position={position} material={mat.winCyan} />
        ))}

        <Line
          points={rectOutline(12.6, 3.0, 4.62, 0, 3.0)}
          color={CYAN}
          transparent
          opacity={day ? 0.24 : 0.72}
          lineWidth={0.7}
        />
        <Line
          points={rectOutline(3.0, 6.0, 3.82, -4.8, 0)}
          color={CYAN}
          transparent
          opacity={day ? 0.22 : 0.65}
          lineWidth={0.7}
        />
        <Line
          points={rectOutline(3.0, 6.0, 3.82, 4.8, 0)}
          color={CYAN}
          transparent
          opacity={day ? 0.22 : 0.65}
          lineWidth={0.7}
        />
      </group>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* 2 · Banco · Zona A                                                 */
/* ------------------------------------------------------------------ */

const BANK_COLUMNS = [-3.5, -1.17, 1.17, 3.5]
const BANK_MULLIONS = [-2.2, 0, 2.2]
const BANK_SOLAR = [-2.8, 0.8]
const BANK_BENCHES: { position: Vec3; rotation: number }[] = [
  { position: [-5.7, 0, 2.8], rotation: Math.PI / 2 },
  { position: [5.5, 0, 0.8], rotation: -Math.PI / 2 },
]
const BANK_LAMPS: Vec3[] = [
  [-7.2, 0, -5.2],
  [7.2, 0, -5.2],
]
const BANK_STEPS: { z: number; width: number; y: number }[] = [
  { z: -4.7, width: 5.8, y: 0.07 },
  { z: -4.2, width: 5.2, y: 0.15 },
  { z: -3.7, width: 4.6, y: 0.23 },
]

function Bank({ day, mat }: { day: boolean; mat: CivicMaterials }) {
  return (
    <group position={[35, 0, 55]}>
      <group position={[8, 0, 5]}>
        <CivicPlaza day={day} mat={mat} width={16.4} depth={13.2} accent={CYAN} glow={mat.glowCyan} />
        <group position={[0, PLAZA_TOP, 0]}>
          <Block position={[0, 0.22, 1.5]} size={[9.4, 0.44, 7.8]} material={mat.structural} cast receive />
          <Block position={[0, 4.55, 1.5]} size={[7.8, 8.2, 6.4]} material={mat.concreteDark} cast receive />
          <Block position={[0, 4.4, -1.78]} size={[6.4, 7.2, 0.14]} material={mat.glass} />
          {BANK_MULLIONS.map((x) => (
            <Block key={x} position={[x, 4.4, -1.86]} size={[0.1, 7.2, 0.26]} material={mat.metal} />
          ))}
          {BANK_COLUMNS.map((x) => (
            <Cylinder key={x} position={[x, 2.95, -3.3]} radius={0.22} height={5.9} material={mat.metal} cast />
          ))}
          <Block position={[0, 6.05, -2.4]} size={[9.0, 0.3, 2.8]} material={mat.metal} cast />
          <Block position={[0, 1.55, -1.9]} size={[3.2, 3.1, 0.16]} material={mat.metalDark} />
          <Block position={[0, 1.5, -2.0]} size={[2.6, 2.7, 0.08]} material={mat.glass} />
          <Block position={[0, 8.79, 1.5]} size={[8.2, 0.28, 6.8]} material={mat.metalDark} cast />
          <Block position={[-1.1, 9.35, 1.6]} size={[2.4, 0.8, 1.8]} material={mat.metal} cast />
          <mesh position={[0, 9.0, 1.5]} rotation={[-Math.PI / 2, 0, 0]} material={mat.glowCyan}>
            <torusGeometry args={[4.05, 0.07, 6, 56]} />
          </mesh>
          <Cylinder position={[3.2, 10.5, 1.6]} radius={0.06} height={3.0} material={mat.metal} />
          <Orb position={[3.2, 12.04, 1.6]} radius={0.09} material={mat.glowWhite} />
          <Block position={[-3.94, 4.55, -1.84]} size={[0.08, 6.4, 0.1]} material={mat.glowCyan} />
          <Block position={[3.94, 4.55, -1.84]} size={[0.08, 6.4, 0.1]} material={mat.glowCyan} />
          {BANK_SOLAR.map((x) => (
            <Block
              key={x}
              position={[x, 9.05, 4.6]}
              size={[2.3, 0.06, 1.2]}
              material={mat.glass}
              rotation={[-0.32, 0, 0]}
              cast
            />
          ))}

          {BANK_STEPS.map((step) => (
            <Block key={step.z} position={[0, step.y, step.z]} size={[step.width, 0.14, 0.55]} material={mat.path} receive />
          ))}

          <group position={[-5.9, 0, -3.3]}>
            <Block position={[0, 0.08, 0]} size={[1.8, 0.16, 1.2]} material={mat.metalDark} />
            <Block position={[0, 1.33, 0]} size={[1.5, 2.5, 0.9]} material={mat.structural} cast />
            <Block position={[0, 1.5, -0.49]} size={[1.1, 0.7, 0.06]} material={mat.glowCyan} />
          </group>

          <group position={[5.9, 0, -3.3]}>
            <Block position={[0, 0.15, 0]} size={[1.0, 0.3, 1.0]} material={mat.metalDark} />
            <Block position={[0, 2.1, 0]} size={[0.3, 4.0, 1.0]} material={mat.metal} cast />
            <mesh position={[0, 3.1, -0.53]} material={mat.glowCyan}>
              <torusGeometry args={[0.5, 0.035, 6, 28]} />
            </mesh>
          </group>

          {BANK_BENCHES.map((bench, index) => (
            <PlazaBench key={index} position={bench.position} rotation={bench.rotation} mat={mat} />
          ))}
          {BANK_LAMPS.map((position) => (
            <PlazaLamp key={position[0]} position={position} mat={mat} glow={mat.glowCyan} />
          ))}

          <Line
            points={rectOutline(8.2, 6.8, 8.96, 0, 1.5)}
            color={CYAN}
            transparent
            opacity={day ? 0.24 : 0.7}
            lineWidth={0.7}
          />
          <Line
            points={[
              [-3.2, 2.5, -1.87],
              [3.2, 2.5, -1.87],
            ]}
            color={CYAN}
            transparent
            opacity={day ? 0.2 : 0.62}
            lineWidth={0.7}
          />
          <Line
            points={[
              [-3.2, 6.0, -1.87],
              [3.2, 6.0, -1.87],
            ]}
            color={CYAN}
            transparent
            opacity={day ? 0.2 : 0.62}
            lineWidth={0.7}
          />
        </group>
      </group>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* 3 · Clínica · Zona B                                               */
/* ------------------------------------------------------------------ */

const CLINIC_UPPER_WINDOWS: Vec3[] = [
  [-1.9, 6.6, 0.98],
  [0.3, 6.6, 0.98],
]
const CLINIC_STEPS: { z: number; width: number; y: number }[] = [
  { z: -2.9, width: 4.0, y: 0.05 },
  { z: -3.35, width: 4.4, y: 0.13 },
  { z: -3.8, width: 4.8, y: 0.21 },
]
const CLINIC_BOLLARDS: Vec3[] = [
  [-3.2, 0, -5.6],
  [0, 0, -5.9],
  [3.2, 0, -5.6],
]

function Clinic({ day, mat }: { day: boolean; mat: CivicMaterials }) {
  return (
    <group position={[82, 0, 88]}>
      <group position={[-1, 0, 4]}>
        <CivicPlaza day={day} mat={mat} width={15} depth={14} accent={GREEN} glow={mat.glowGreen} />
        <group position={[0, PLAZA_TOP, 0]}>
          <Block position={[0.8, 2.6, 2.9]} size={[9.0, 5.2, 6.4]} material={mat.concreteLight} cast receive />
          <Block position={[-0.6, 6.6, 3.3]} size={[5.4, 2.8, 4.6]} material={mat.concrete} cast receive />
          <Block position={[0, 1.6, -0.6]} size={[3.8, 3.2, 3.2]} material={mat.concreteLight} cast receive />

          <Block position={[0, 1.6, -2.24]} size={[3.0, 2.8, 0.12]} material={mat.glass} />
          <Block position={[-1.52, 1.6, -2.33]} size={[0.06, 2.8, 0.06]} material={mat.glowGreen} />
          <Block position={[1.52, 1.6, -2.33]} size={[0.06, 2.8, 0.06]} material={mat.glowGreen} />

          <Block position={[0, 3.4, -2.9]} size={[5.6, 0.24, 2.4]} material={mat.metal} cast />
          <Block position={[0, 3.22, -4.05]} size={[5.0, 0.05, 0.14]} material={mat.glowGreen} />
          <Cylinder position={[-2.2, 1.65, -4.2]} radius={0.14} height={3.3} material={mat.metal} cast />
          <Cylinder position={[2.2, 1.65, -4.2]} radius={0.14} height={3.3} material={mat.metal} cast />

          <Block position={[0.8, 4.25, -0.36]} size={[2.6, 2.6, 0.12]} material={mat.structural} />
          <Block position={[0.8, 4.25, -0.45]} size={[0.55, 1.9, 0.1]} material={mat.winGreen} />
          <Block position={[0.8, 4.25, -0.45]} size={[1.9, 0.55, 0.1]} material={mat.winGreen} />

          {CLINIC_UPPER_WINDOWS.map((position) => (
            <Block key={position[0]} position={position} size={[1.6, 1.0, 0.09]} material={mat.winGreen} />
          ))}
          <Block position={[5.32, 2.7, 2.9]} size={[0.1, 3.0, 3.4]} material={mat.glass} />
          <Block position={[-3.72, 2.7, 2.9]} size={[0.1, 3.0, 3.4]} material={mat.glass} />

          {CLINIC_STEPS.map((step) => (
            <Block key={step.z} position={[0, step.y, step.z]} size={[step.width, 0.12, 0.45]} material={mat.path} receive />
          ))}

          <Block position={[0.8, 5.28, 0.4]} size={[8.6, 0.16, 1.0]} material={mat.green} />
          <Block position={[-0.6, 8.08, 5.0]} size={[4.8, 0.16, 1.2]} material={mat.green} />
          <Block position={[3.9, 5.55, 2.6]} size={[1.5, 0.7, 1.2]} material={mat.metal} cast />
          <Block position={[3.9, 5.45, 4.1]} size={[1.0, 0.5, 0.9]} material={mat.metal} cast />
          <Block
            position={[-0.6, 8.12, 2.5]}
            size={[2.4, 0.06, 1.3]}
            material={mat.glass}
            rotation={[-0.3, 0, 0]}
          />
          <Orb position={[1.6, 8.25, 4.4]} radius={0.09} material={mat.glowWhite} />

          <Block position={[-3.4, 0.18, -1.4]} size={[1.2, 0.36, 1.2]} material={mat.green} />
          <Block position={[3.6, 0.18, -1.4]} size={[1.2, 0.36, 1.2]} material={mat.green} />
          <PlazaBench position={[4.4, 0, -4.6]} mat={mat} />
          {CLINIC_BOLLARDS.map((position) => (
            <Bollard key={position[0]} position={position} height={0.8} material={mat.winGreen} />
          ))}

          <Line
            points={rectOutline(9.0, 6.4, 5.22, 0.8, 2.9)}
            color={GREEN}
            transparent
            opacity={day ? 0.22 : 0.68}
            lineWidth={0.7}
          />
          <Line
            points={rectOutline(5.4, 4.6, 8.02, -0.6, 3.3)}
            color={GREEN}
            transparent
            opacity={day ? 0.22 : 0.68}
            lineWidth={0.7}
          />
        </group>
      </group>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* 4 · Mercado · Zona A                                               */
/* ------------------------------------------------------------------ */

const MARKET_STALLS: { x: number; z: number }[] = [
  { x: -2.5, z: -0.9 },
  { x: 2.5, z: -0.9 },
  { x: -2.5, z: 1.7 },
  { x: 2.5, z: 1.7 },
]
const MARKET_CANOPIES = [-2.55, 2.55]
const MARKET_POSTS: Vec3[] = [
  [-2.55, 0, -2.1],
  [-2.55, 0, 2.9],
  [2.55, 0, -2.1],
  [2.55, 0, 2.9],
]
const MARKET_PENDANTS: Vec3[] = [
  [-2.55, 2.4, 1.7],
  [2.55, 2.4, 1.7],
]
const MARKET_LAMPS: Vec3[] = [
  [-7.3, 0, 4.6],
  [7.3, 0, 4.6],
]

function Market({ day, mat }: { day: boolean; mat: CivicMaterials }) {
  const produce = [mat.green, mat.red, mat.winAmber, mat.greenSoft]

  return (
    <group position={[-40, 0, -64]}>
      <group position={[-5, 0, 0]}>
        <CivicPlaza day={day} mat={mat} width={18} depth={13} accent={AMBER} glow={mat.glowAmber} />
        <group position={[0, PLAZA_TOP, 0]}>
          <Block position={[0, 0.05, 0]} size={[12, 0.1, 7.8]} material={mat.plazaInset} receive />
          <Block position={[0, 0.12, 0]} size={[2.2, 0.04, 7.6]} material={mat.path} receive />

          <Block position={[0, 1.75, -2.9]} size={[4.4, 3.5, 1.8]} material={mat.concrete} cast receive />
          <Block position={[0, 3.6, -2.9]} size={[5.0, 0.2, 2.3]} material={mat.metalDark} cast />
          <Block position={[0, 3.0, -1.98]} size={[3.8, 0.55, 0.1]} material={mat.winAmber} />
          <Block position={[0, 1.9, -1.99]} size={[2.4, 1.0, 0.1]} material={mat.glass} />
          <Cylinder position={[-1.5, 4.2, -3.0]} radius={0.45} height={1.0} material={mat.metal} cast />
          <Block
            position={[0.9, 3.8, -3.0]}
            size={[2.1, 0.06, 1.2]}
            material={mat.glass}
            rotation={[-0.3, 0, 0]}
          />

          {MARKET_STALLS.map((stall) => (
            <Block
              key={`${stall.x}-${stall.z}`}
              position={[stall.x, 0.5, stall.z]}
              size={[2.2, 1.0, 1.4]}
              material={mat.wood}
              cast
            />
          ))}
          {MARKET_CANOPIES.map((x) => (
            <Block key={x} position={[x, 2.75, 0.4]} size={[3.1, 0.14, 5.6]} material={mat.fabric} cast />
          ))}
          {MARKET_POSTS.map((position) => (
            <Cylinder
              key={`${position[0]}-${position[2]}`}
              position={[position[0], 1.33, position[2]]}
              radius={0.07}
              height={2.66}
              material={mat.metalDark}
              cast
            />
          ))}
          {MARKET_STALLS.map((stall, index) => (
            <group key={`crate-${stall.x}-${stall.z}`}>
              <Block position={[stall.x, 1.2, stall.z]} size={[0.8, 0.4, 0.7]} material={mat.wood} cast />
              <Block
                position={[stall.x, 1.43, stall.z]}
                size={[0.55, 0.18, 0.45]}
                material={produce[index % produce.length]}
              />
            </group>
          ))}
          {MARKET_PENDANTS.map((position) => (
            <Orb key={`${position[0]}-lamp`} position={position} radius={0.12} material={mat.glowWarm} />
          ))}

          <Cylinder position={[-1.5, 2.1, 3.8]} radius={0.09} height={4.2} material={mat.metalDark} cast />
          <Cylinder position={[1.5, 2.1, 3.8]} radius={0.09} height={4.2} material={mat.metalDark} cast />
          <Block position={[0, 4.18, 3.8]} size={[3.6, 0.22, 0.3]} material={mat.metal} cast />
          <Block position={[0, 4.03, 3.8]} size={[3.2, 0.08, 0.16]} material={mat.glowAmber} />

          <PlazaBench position={[-6.7, 0, 1.0]} rotation={Math.PI / 2} mat={mat} />
          {MARKET_LAMPS.map((position) => (
            <PlazaLamp key={position[0]} position={position} mat={mat} glow={mat.glowAmber} />
          ))}

          <Line
            points={rectOutline(5.0, 2.3, 3.72, 0, -2.9)}
            color={AMBER}
            transparent
            opacity={day ? 0.22 : 0.68}
            lineWidth={0.7}
          />
          <Line
            points={[
              [-4.1, 2.84, 0.4],
              [4.1, 2.84, 0.4],
            ]}
            color={AMBER}
            transparent
            opacity={day ? 0.2 : 0.62}
            lineWidth={0.7}
          />
        </group>
      </group>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* 5 · Biblioteca · Zona A                                            */
/* ------------------------------------------------------------------ */

const LIBRARY_FINS = [-4.3, -2.7, 2.7, 4.3]
const LIBRARY_PERGOLA_POSTS: Vec3[] = [
  [-2.6, 10.76, 2.2],
  [-2.6, 10.76, 4.6],
  [0.8, 10.76, 2.2],
  [0.8, 10.76, 4.6],
]
const LIBRARY_ROOF_BENCHES: { position: Vec3; rotation: number }[] = [
  { position: [-2.25, 10.76, 4.15], rotation: 0 },
  { position: [0.45, 10.76, 4.15], rotation: 0 },
]
const LIBRARY_BOLLARDS: Vec3[] = [
  [-3.6, 0, -4.8],
  [3.6, 0, -4.8],
]

function Library({ day, mat }: { day: boolean; mat: CivicMaterials }) {
  return (
    <group position={[-45, 0, 100]}>
      <group position={[0, 0, -5]}>
        <CivicPlaza day={day} mat={mat} width={16} depth={16} accent={GREEN} glow={mat.glowGreen} />
        <group position={[0, PLAZA_TOP, 0]}>
          <Block position={[0, 2.2, 3.5]} size={[10.5, 4.4, 8.0]} material={mat.concreteLight} cast receive />
          <Block position={[-0.4, 6.1, 3.2]} size={[8.2, 3.4, 6.0]} material={mat.concrete} cast receive />
          <Block position={[-0.9, 9.2, 3.4]} size={[5.6, 2.8, 4.0]} material={mat.concrete} cast receive />

          <Block position={[0, 0.16, -1.9]} size={[4.6, 0.32, 2.8]} material={mat.concreteDark} receive />
          <Block
            position={[0, 0.16, -4.9]}
            size={[3.2, 0.12, 3.4]}
            material={mat.path}
            rotation={[-0.09, 0, 0]}
            receive
          />
          <Block
            position={[-1.52, 0.24, -4.9]}
            size={[0.08, 0.05, 3.4]}
            material={mat.glowGreen}
            rotation={[-0.09, 0, 0]}
          />
          <Block
            position={[1.52, 0.24, -4.9]}
            size={[0.08, 0.05, 3.4]}
            material={mat.glowGreen}
            rotation={[-0.09, 0, 0]}
          />

          <Block position={[0, 1.72, -0.54]} size={[3.2, 2.8, 0.12]} material={mat.glass} />
          <Block position={[0, 3.5, -0.56]} size={[7.2, 1.2, 0.12]} material={mat.glass} />
          <Block position={[-0.4, 6.1, 0.15]} size={[4.8, 1.6, 0.12]} material={mat.glass} />
          <Block position={[-5.28, 2.6, 3.5]} size={[0.12, 2.4, 4.6]} material={mat.winWhite} />
          <Block position={[5.28, 2.0, 3.7]} size={[0.14, 3.2, 4.2]} material={mat.green} />
          {LIBRARY_FINS.map((x) => (
            <Block key={x} position={[x, 2.2, -0.74]} size={[0.18, 4.4, 0.38]} material={mat.metal} cast />
          ))}

          <Block position={[0, 4.48, -0.15]} size={[10.1, 0.16, 1.2]} material={mat.green} />
          <Block position={[-0.4, 7.88, 0.85]} size={[7.8, 0.16, 1.1]} material={mat.green} />
          <Block position={[-0.9, 10.68, 3.4]} size={[5.4, 0.16, 3.8]} material={mat.greenSoft} />

          {LIBRARY_PERGOLA_POSTS.map((position) => (
            <Cylinder
              key={`${position[0]}-${position[2]}`}
              position={[position[0], 11.96, position[2]]}
              radius={0.07}
              height={2.4}
              material={mat.metal}
              cast
            />
          ))}
          <Block position={[-0.9, 13.24, 3.4]} size={[4.4, 0.16, 3.4]} material={mat.wood} cast />
          {LIBRARY_ROOF_BENCHES.map((bench, index) => (
            <PlazaBench key={index} position={bench.position} rotation={bench.rotation} mat={mat} />
          ))}
          <Block position={[-2.8, 10.95, 2.25]} size={[1.0, 0.36, 0.8]} material={mat.green} />
          <Block position={[1.1, 10.95, 2.25]} size={[1.0, 0.36, 0.8]} material={mat.green} />
          <Block position={[2.9, 7.92, 3.2]} size={[1.0, 0.08, 2.4]} material={mat.winGreen} />
          <Orb position={[-0.9, 10.9, 4.8]} radius={0.08} material={mat.glowWhite} />

          <PlazaBench position={[5.6, 0, -3.1]} rotation={Math.PI / 2} mat={mat} />
          {LIBRARY_BOLLARDS.map((position) => (
            <Bollard key={position[0]} position={position} height={0.8} material={mat.glowGreen} />
          ))}
          <Block position={[-2.5, 0.34, -1.9]} size={[0.1, 0.05, 2.6]} material={mat.glowGreen} />
          <Block position={[2.5, 0.34, -1.9]} size={[0.1, 0.05, 2.6]} material={mat.glowGreen} />

          <Line
            points={rectOutline(10.5, 8.0, 4.44, 0, 3.5)}
            color={GREEN}
            transparent
            opacity={day ? 0.24 : 0.7}
            lineWidth={0.7}
          />
          <Line
            points={rectOutline(8.2, 6.0, 7.84, -0.4, 3.2)}
            color={GREEN}
            transparent
            opacity={day ? 0.22 : 0.65}
            lineWidth={0.7}
          />
          <Line
            points={rectOutline(5.6, 4.0, 10.64, -0.9, 3.4)}
            color={GREEN}
            transparent
            opacity={day ? 0.22 : 0.65}
            lineWidth={0.7}
          />
        </group>
      </group>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* 6 · Estación de bomberos · Zona C                                  */
/* ------------------------------------------------------------------ */

const FIRE_DOORS = [-3.2, 0, 3.2]
const FIRE_LAMPS: Vec3[] = [
  [-8.0, 0, -5.5],
  [8.0, 0, -5.5],
]

function FireStation({ day, mat }: { day: boolean; mat: CivicMaterials }) {
  return (
    <group position={[-169, 0, 30]}>
      <group position={[8, 0, -1]}>
        <CivicPlaza day={day} mat={mat} width={18} depth={16} accent={RED} glow={mat.glowRed} />
        <group position={[0, PLAZA_TOP, 0]}>
          <Block position={[0, 2.4, 0.6]} size={[9.8, 4.8, 7.0]} material={mat.concrete} cast receive />
          <Block position={[0, 1.85, -2.96]} size={[9.0, 3.7, 0.18]} material={mat.metalDark} />
          {FIRE_DOORS.map((x) => (
            <Block key={x} position={[x, 1.8, -3.06]} size={[2.6, 3.4, 0.12]} material={mat.red} />
          ))}
          {FIRE_DOORS.map((x) => (
            <Block key={`lintel-${x}`} position={[x, 3.65, -3.08]} size={[2.6, 0.1, 0.1]} material={mat.glowAmber} />
          ))}
          <Block position={[0, 4.35, -3.45]} size={[10.2, 0.24, 1.3]} material={mat.metalDark} cast />
          <Block position={[0, 4.92, 0.6]} size={[10.2, 0.24, 7.4]} material={mat.metalDark} cast />
          <Block position={[2.4, 5.9, 1.2]} size={[3.0, 1.8, 2.4]} material={mat.concreteDark} cast />
          <Block position={[2.4, 6.1, -0.04]} size={[2.2, 0.9, 0.1]} material={mat.winWhite} />
          <Cylinder position={[4.4, 6.84, 1.6]} radius={0.06} height={3.6} material={mat.metal} />
          <Orb position={[4.4, 8.7, 1.6]} radius={0.09} material={mat.glowRed} />

          <Block position={[-5.8, 5.2, 2.2]} size={[1.6, 10.4, 1.6]} material={mat.concrete} cast receive />
          <Block position={[-5.8, 10.55, 2.2]} size={[2.0, 0.3, 2.0]} material={mat.metalDark} cast />
          {[7.1, 8.0, 8.9].map((y) => (
            <Block key={y} position={[-5.8, y, 1.42]} size={[1.1, 0.3, 0.06]} material={mat.metalDark} />
          ))}
          <Orb position={[-5.8, 10.82, 2.2]} radius={0.09} material={mat.glowRed} />

          <Block position={[6.0, 1.6, 1.0]} size={[2.4, 3.2, 4.6]} material={mat.concreteDark} cast receive />
          <Block position={[6.0, 2.45, -1.32]} size={[1.5, 0.8, 0.1]} material={mat.winWhite} />
          <Block position={[6.0, 0.95, -1.34]} size={[1.0, 1.9, 0.1]} material={mat.metalDark} />

          <Block position={[-1.8, 5.35, 2.4]} size={[1.8, 0.7, 1.4]} material={mat.metal} cast />
          <Block
            position={[0.8, 5.13, 3.0]}
            size={[2.0, 0.06, 1.1]}
            material={mat.glass}
            rotation={[-0.25, 0, 0]}
          />
          <Cylinder position={[-3.6, 5.2, 0.2]} radius={0.25} height={0.5} material={mat.metalDark} />

          <Cylinder position={[-7.2, 1.7, -4.8]} radius={0.05} height={3.4} material={mat.metal} />
          <Cylinder position={[-5.6, 1.7, -4.8]} radius={0.05} height={3.4} material={mat.metal} />
          <Block position={[-6.4, 3.2, -4.8]} size={[1.8, 0.08, 0.08]} material={mat.metal} />
          <mesh
            geometry={RING}
            material={mat.glowAmber}
            position={[0, 0.04, -5.2]}
            rotation={[-Math.PI / 2, 0, 0]}
            scale={[2.7, 2.7, 1]}
          />
          <PlazaBench position={[4.9, 0, -4.4]} rotation={Math.PI / 2} mat={mat} />
          {FIRE_LAMPS.map((position) => (
            <PlazaLamp key={position[0]} position={position} mat={mat} glow={mat.glowAmber} />
          ))}
          <Block position={[-4.85, 2.5, -2.94]} size={[0.08, 3.6, 0.1]} material={mat.glowRed} />
          <Block position={[4.85, 2.5, -2.94]} size={[0.08, 3.6, 0.1]} material={mat.glowRed} />

          <Line
            points={rectOutline(10.2, 7.4, 5.06, 0, 0.6)}
            color={RED}
            transparent
            opacity={day ? 0.22 : 0.68}
            lineWidth={0.7}
          />
          <Line
            points={rectOutline(1.6, 1.6, 10.42, -5.8, 2.2)}
            color={AMBER}
            transparent
            opacity={day ? 0.2 : 0.6}
            lineWidth={0.7}
          />
        </group>
      </group>
    </group>
  )
}

export function CivicBuildings({ day = false }: { day?: boolean }) {
  const mat = useMemo(() => createCivicMaterials(day), [day])

  return (
    <group>
      <School day={day} mat={mat} />
      <Bank day={day} mat={mat} />
      <Clinic day={day} mat={mat} />
      <Market day={day} mat={mat} />
      <Library day={day} mat={mat} />
      <FireStation day={day} mat={mat} />
    </group>
  )
}
