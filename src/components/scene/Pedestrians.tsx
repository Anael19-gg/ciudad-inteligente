import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

type Point2 = [number, number]

interface WalkRoute {
  points: Point2[]
  lengths: number[]
  total: number
}

function makeWalkerRoute(points: Point2[]): WalkRoute {
  const lengths: number[] = []
  let total = 0
  for (let i = 0; i < points.length; i += 1) {
    const a = points[i]
    const b = points[(i + 1) % points.length]
    const length = Math.hypot(b[0] - a[0], b[1] - a[1])
    lengths.push(length)
    total += length
  }
  return { points, lengths, total }
}

function walkAt(route: WalkRoute, distance: number) {
  let s = ((distance % route.total) + route.total) % route.total
  let index = 0
  while (s > route.lengths[index] && index < route.points.length - 1) {
    s -= route.lengths[index]
    index += 1
  }
  const a = route.points[index]
  const b = route.points[(index + 1) % route.points.length]
  const length = route.lengths[index] || 1
  const t = s / length
  return {
    x: a[0] + (b[0] - a[0]) * t,
    z: a[1] + (b[1] - a[1]) * t,
    tx: (b[0] - a[0]) / length,
    tz: (b[1] - a[1]) / length,
  }
}

const SOUTH_WALK = makeWalkerRoute([
  [-220, 11.7],
  [220, 11.7],
  [220, 9.7],
  [-220, 9.7],
])
const NORTH_WALK = makeWalkerRoute([
  [220, -11.7],
  [-220, -11.7],
  [-220, -9.7],
  [220, -9.7],
])
const WEST_WALK = makeWalkerRoute([
  [-180, 51],
  [-100, 51],
  [-100, 108],
  [-180, 108],
])
const EAST_WALK = makeWalkerRoute([
  [100, 51],
  [180, 51],
  [180, 108],
  [100, 108],
])

interface PersonColors {
  coat: string
  trousers: string
  skin: string
  hair: string
}

function PersonModel({
  colors,
  vader = false,
  phase = 0,
}: {
  colors: PersonColors
  vader?: boolean
  phase?: number
}) {
  const leftLeg = useRef<THREE.Mesh>(null)
  const rightLeg = useRef<THREE.Mesh>(null)
  const leftArm = useRef<THREE.Mesh>(null)
  const rightArm = useRef<THREE.Mesh>(null)
  const body = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    const time = clock.elapsedTime * 2.6 + phase
    const swing = Math.sin(time) * 0.34
    if (leftLeg.current) leftLeg.current.rotation.z = swing
    if (rightLeg.current) rightLeg.current.rotation.z = -swing
    if (leftArm.current) leftArm.current.rotation.z = -swing * 0.7
    if (rightArm.current) rightArm.current.rotation.z = swing * 0.7
    if (body.current) body.current.position.y = Math.abs(Math.sin(time)) * 0.025
  })

  if (vader) {
    return (
      <group>
        <group ref={body}>
          <mesh position={[0, 1.05, 0]}>
            <boxGeometry args={[0.42, 0.82, 0.3]} />
            <meshStandardMaterial color="#0a0b0d" roughness={0.55} metalness={0.3} />
          </mesh>
          <mesh position={[0, 1.48, 0]}>
            <sphereGeometry args={[0.18, 12, 12]} />
            <meshStandardMaterial color="#111216" roughness={0.3} metalness={0.55} />
          </mesh>
          <mesh position={[0, 1.39, 0.17]}>
            <boxGeometry args={[0.28, 0.2, 0.08]} />
            <meshStandardMaterial color="#08090b" roughness={0.4} metalness={0.5} />
          </mesh>
          <mesh position={[0, 1.05, -0.2]}>
            <boxGeometry args={[0.58, 0.98, 0.06]} />
            <meshStandardMaterial color="#07080a" roughness={0.8} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0.15, 1.08, 0.17]}>
            <boxGeometry args={[0.16, 0.2, 0.04]} />
            <meshBasicMaterial color="#9b3333" toneMapped={false} />
          </mesh>
          <mesh ref={leftLeg} position={[-0.12, 0.45, 0]}>
            <boxGeometry args={[0.16, 0.55, 0.16]} />
            <meshStandardMaterial color="#0b0c0e" roughness={0.7} />
          </mesh>
          <mesh ref={rightLeg} position={[0.12, 0.45, 0]}>
            <boxGeometry args={[0.16, 0.55, 0.16]} />
            <meshStandardMaterial color="#0b0c0e" roughness={0.7} />
          </mesh>
          <mesh ref={leftArm} position={[-0.28, 1.0, 0]} rotation={[0, 0, 0.1]}>
            <boxGeometry args={[0.13, 0.62, 0.16]} />
            <meshStandardMaterial color="#0a0b0d" roughness={0.6} />
          </mesh>
          <mesh ref={rightArm} position={[0.28, 1.0, 0]} rotation={[0, 0, -0.1]}>
            <boxGeometry args={[0.13, 0.62, 0.16]} />
            <meshStandardMaterial color="#0a0b0d" roughness={0.6} />
          </mesh>
        </group>
      </group>
    )
  }

  return (
    <group>
      <group ref={body}>
        <mesh position={[0, 1.02, 0]}>
          <boxGeometry args={[0.34, 0.6, 0.24]} />
          <meshStandardMaterial color={colors.coat} roughness={0.75} />
        </mesh>
        <mesh position={[0, 1.45, 0]}>
          <sphereGeometry args={[0.15, 12, 12]} />
          <meshStandardMaterial color={colors.skin} roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.55, -0.03]}>
          <sphereGeometry args={[0.15, 10, 10]} />
          <meshStandardMaterial color={colors.hair} roughness={0.85} />
        </mesh>
        <mesh ref={leftLeg} position={[-0.1, 0.45, 0]}>
          <boxGeometry args={[0.13, 0.5, 0.14]} />
          <meshStandardMaterial color={colors.trousers} roughness={0.8} />
        </mesh>
        <mesh ref={rightLeg} position={[0.1, 0.45, 0]}>
          <boxGeometry args={[0.13, 0.5, 0.14]} />
          <meshStandardMaterial color={colors.trousers} roughness={0.8} />
        </mesh>
        <mesh ref={leftArm} position={[-0.22, 1.0, 0]}>
          <boxGeometry args={[0.1, 0.56, 0.12]} />
          <meshStandardMaterial color={colors.coat} roughness={0.8} />
        </mesh>
        <mesh ref={rightArm} position={[0.22, 1.0, 0]}>
          <boxGeometry args={[0.1, 0.56, 0.12]} />
          <meshStandardMaterial color={colors.coat} roughness={0.8} />
        </mesh>
      </group>
    </group>
  )
}

function Walker({
  route,
  start,
  speed,
  colors,
  vader = false,
}: {
  route: WalkRoute
  start: number
  speed: number
  colors: PersonColors
  vader?: boolean
}) {
  const group = useRef<THREE.Group>(null)
  const progress = useRef(start % route.total)
  const initial = useMemo(() => walkAt(route, start % route.total), [route, start])

  useFrame((_, delta) => {
    if (!group.current) return
    progress.current = (progress.current + speed * delta) % route.total
    const point = walkAt(route, progress.current)
    group.current.position.set(point.x, 0, point.z)
    const target = Math.atan2(-point.tz, point.tx)
    const current = group.current.rotation.y
    const difference = Math.atan2(Math.sin(target - current), Math.cos(target - current))
    group.current.rotation.y = current + difference * Math.min(1, delta * 5)
  })

  return (
    <group ref={group} position={[initial.x, 0, initial.z]} rotation={[0, Math.atan2(-initial.tz, initial.tx), 0]}>
      <PersonModel colors={colors} vader={vader} phase={start * 0.13} />
    </group>
  )
}

const PEOPLE: { route: WalkRoute; start: number; speed: number; colors: PersonColors; vader?: boolean }[] = [
  {
    route: SOUTH_WALK,
    start: 200,
    speed: 1.45,
    colors: { coat: '#c2b08a', trousers: '#28343b', skin: '#b58d73', hair: '#29221d' },
    vader: true,
  },
  {
    route: SOUTH_WALK,
    start: 20,
    speed: 1.25,
    colors: { coat: '#7e969d', trousers: '#263137', skin: '#c6a184', hair: '#1d2428' },
  },
  {
    route: SOUTH_WALK,
    start: 340,
    speed: 1.5,
    colors: { coat: '#9c7f69', trousers: '#1c252a', skin: '#a77d63', hair: '#29221d' },
  },
  {
    route: SOUTH_WALK,
    start: 600,
    speed: 1.35,
    colors: { coat: '#5e747c', trousers: '#20292e', skin: '#c49b7d', hair: '#211b17' },
  },
  {
    route: NORTH_WALK,
    start: 120,
    speed: 1.4,
    colors: { coat: '#8d9b9f', trousers: '#1f2a30', skin: '#b98c6f', hair: '#1f1b18' },
  },
  {
    route: NORTH_WALK,
    start: 430,
    speed: 1.2,
    colors: { coat: '#a8987a', trousers: '#2b3338', skin: '#c49d82', hair: '#1f2428' },
  },
  {
    route: NORTH_WALK,
    start: 680,
    speed: 1.55,
    colors: { coat: '#697d84', trousers: '#1e292e', skin: '#9f765e', hair: '#29211c' },
  },
  {
    route: WEST_WALK,
    start: 60,
    speed: 1.3,
    colors: { coat: '#b5a27e', trousers: '#28343b', skin: '#c5a087', hair: '#1c2428' },
  },
  {
    route: WEST_WALK,
    start: 210,
    speed: 1.45,
    colors: { coat: '#7d9299', trousers: '#1e282d', skin: '#b2876d', hair: '#1f1a16' },
  },
  {
    route: WEST_WALK,
    start: 340,
    speed: 1.2,
    colors: { coat: '#9b836b', trousers: '#2b3338', skin: '#c49d82', hair: '#211c18' },
  },
  {
    route: EAST_WALK,
    start: 80,
    speed: 1.5,
    colors: { coat: '#a7b1b4', trousers: '#202b31', skin: '#bd947b', hair: '#1d2428' },
  },
  {
    route: EAST_WALK,
    start: 250,
    speed: 1.3,
    colors: { coat: '#89735f', trousers: '#1b252a', skin: '#a87e64', hair: '#26201b' },
  },
  {
    route: EAST_WALK,
    start: 430,
    speed: 1.4,
    colors: { coat: '#637b84', trousers: '#1e282e', skin: '#c6a084', hair: '#1f272b' },
  },
  {
    route: SOUTH_WALK,
    start: 780,
    speed: 1.25,
    colors: { coat: '#b09678', trousers: '#2a3337', skin: '#b38a70', hair: '#231e19' },
  },
  {
    route: NORTH_WALK,
    start: 300,
    speed: 1.35,
    colors: { coat: '#83969b', trousers: '#273238', skin: '#c7a084', hair: '#1c2023' },
  },
]

export function Pedestrians() {
  return (
    <group>
      {PEOPLE.map((person, index) => (
        <Walker
          key={`${person.route === SOUTH_WALK ? 's' : person.route === NORTH_WALK ? 'n' : person.route === WEST_WALK ? 'w' : 'e'}-${index}`}
          route={person.route}
          start={person.start}
          speed={person.speed}
          colors={person.colors}
          vader={person.vader}
        />
      ))}
    </group>
  )
}
