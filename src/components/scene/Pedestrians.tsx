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
const C_HOMES_WALK = makeWalkerRoute([
  [-136, 12],
  [-100, 12],
  [-100, 42],
  [-136, 42],
])
const C_WORKS_WALK = makeWalkerRoute([
  [-140, -5],
  [-140, -42],
  [-104, -42],
  [-104, -5],
])
const B_TOWERS_WALK = makeWalkerRoute([
  [103, 10],
  [136, 10],
  [136, 45],
  [103, 45],
])
const B_SOUTH_WALK = makeWalkerRoute([
  [140, -10],
  [178, -10],
  [178, -44],
  [140, -44],
])
const A_NORTH_WALK = makeWalkerRoute([
  [-62, 55],
  [62, 55],
  [62, 76],
  [-62, 76],
])
const A_SOUTH_WALK = makeWalkerRoute([
  [62, -55],
  [-62, -55],
  [-62, -76],
  [62, -76],
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
  const leftLeg = useRef<THREE.Group>(null)
  const rightLeg = useRef<THREE.Group>(null)
  const leftArm = useRef<THREE.Group>(null)
  const rightArm = useRef<THREE.Group>(null)
  const body = useRef<THREE.Group>(null)
  const cape = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    const time = clock.elapsedTime * 2.6 + phase
    const swing = Math.sin(time) * 0.34
    if (leftLeg.current) leftLeg.current.rotation.z = swing
    if (rightLeg.current) rightLeg.current.rotation.z = -swing
    if (leftArm.current) leftArm.current.rotation.z = -swing * 0.7
    if (rightArm.current) rightArm.current.rotation.z = swing * 0.7
    if (body.current) body.current.position.y = Math.abs(Math.sin(time)) * 0.025
    if (cape.current) {
      cape.current.rotation.z = Math.sin(time * 0.6) * 0.035
      cape.current.rotation.x = Math.sin(time * 0.45 + 1) * 0.03
    }
  })

  if (vader) {
    return (
      <group>
        <group ref={body}>
          {/* Torso y armadura */}
          <mesh position={[0, 1.05, 0]}>
            <boxGeometry args={[0.44, 0.82, 0.32]} />
            <meshStandardMaterial color="#0a0b0d" roughness={0.55} metalness={0.35} />
          </mesh>
          <mesh position={[0, 1.29, 0.01]}>
            <boxGeometry args={[0.55, 0.36, 0.38]} />
            <meshStandardMaterial color="#101216" roughness={0.32} metalness={0.62} />
          </mesh>
          {[1.16, 1.23, 1.3].map((y) => (
            <mesh key={y} position={[0, y, 0.205]}>
              <boxGeometry args={[0.5, 0.035, 0.02]} />
              <meshStandardMaterial color="#1c2027" roughness={0.4} metalness={0.65} />
            </mesh>
          ))}
          {[-0.34, 0.34].map((x) => (
            <mesh key={x} position={[x, 1.4, 0]} rotation={[0, 0, x < 0 ? 0.34 : -0.34]}>
              <boxGeometry args={[0.2, 0.14, 0.4]} />
              <meshStandardMaterial color="#14161b" roughness={0.35} metalness={0.6} />
            </mesh>
          ))}
          <mesh position={[0.13, 1.25, 0.19]}>
            <boxGeometry args={[0.19, 0.2, 0.05]} />
            <meshStandardMaterial color="#08090b" roughness={0.4} metalness={0.5} />
          </mesh>
          {[
            ['#ff5a4f', 1.31, 0.12],
            ['#66e29a', 1.25, 0.12],
            ['#62b7ff', 1.19, 0.12],
          ].map(([color, y, x]) => (
            <mesh key={`${color}`} position={[Number(x), Number(y), 0.22]}>
              <boxGeometry args={[0.03, 0.03, 0.02]} />
              <meshBasicMaterial color={String(color)} toneMapped={false} />
            </mesh>
          ))}
          <mesh position={[0, 1.45, 0]}>
            <cylinderGeometry args={[0.1, 0.12, 0.14, 10]} />
            <meshStandardMaterial color="#101216" roughness={0.4} metalness={0.5} />
          </mesh>

          {/* Cinturón y tabardo */}
          <mesh position={[0, 0.71, 0]}>
            <boxGeometry args={[0.48, 0.13, 0.36]} />
            <meshStandardMaterial color="#0b0c0f" roughness={0.5} metalness={0.4} />
          </mesh>
          <mesh position={[0, 0.71, 0.19]}>
            <boxGeometry args={[0.13, 0.14, 0.03]} />
            <meshStandardMaterial color="#5b6570" roughness={0.3} metalness={0.8} />
          </mesh>
          {[-0.24, -0.12, 0.12, 0.24].map((x) => (
            <mesh key={x} position={[x, 0.71, 0.19]}>
              <boxGeometry args={[0.07, 0.08, 0.035]} />
              <meshStandardMaterial color="#242a32" roughness={0.45} metalness={0.6} />
            </mesh>
          ))}
          <mesh position={[0, 0.48, 0.16]} rotation={[0.06, 0, 0]}>
            <boxGeometry args={[0.3, 0.5, 0.05]} />
            <meshStandardMaterial color="#08090b" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.48, -0.16]} rotation={[-0.06, 0, 0]}>
            <boxGeometry args={[0.42, 0.52, 0.05]} />
            <meshStandardMaterial color="#07080a" roughness={0.85} />
          </mesh>

          {/* Casco, máscara y lentes */}
          <mesh position={[0, 1.62, -0.005]} scale={[1, 0.92, 1.02]}>
            <sphereGeometry args={[0.2, 16, 14]} />
            <meshStandardMaterial color="#111318" roughness={0.24} metalness={0.68} />
          </mesh>
          <mesh position={[0, 1.6, 0.04]}>
            <boxGeometry args={[0.37, 0.08, 0.22]} />
            <meshStandardMaterial color="#0b0d11" roughness={0.3} metalness={0.6} />
          </mesh>
          <mesh position={[0, 1.52, 0.17]} rotation={[-0.14, 0, 0]}>
            <boxGeometry args={[0.3, 0.26, 0.13]} />
            <meshStandardMaterial color="#0b0d11" roughness={0.32} metalness={0.55} />
          </mesh>
          {[-0.09, 0.09].map((x) => (
            <mesh key={x} position={[x, 1.56, 0.225]} rotation={[0, 0, x < 0 ? 0.12 : -0.12]}>
              <boxGeometry args={[0.1, 0.085, 0.045]} />
              <meshStandardMaterial color="#080a0d" roughness={0.3} metalness={0.5} />
            </mesh>
          ))}
          {[-0.075, 0.075].map((x) => (
            <mesh key={`lens-${x}`} position={[x, 1.575, 0.252]}>
              <sphereGeometry args={[0.042, 10, 10]} />
              <meshBasicMaterial color="#a32a2a" toneMapped={false} />
            </mesh>
          ))}
          <mesh position={[0, 1.43, 0.23]} rotation={[0.22, 0, 0]}>
            <coneGeometry args={[0.11, 0.2, 4]} />
            <meshStandardMaterial color="#0a0c10" roughness={0.4} metalness={0.5} />
          </mesh>
          {[1.4, 1.34].map((y) => (
            <mesh key={`grill-${y}`} position={[0, y, 0.27]}>
              <boxGeometry args={[0.14, 0.025, 0.02]} />
              <meshStandardMaterial color="#2b3138" roughness={0.5} metalness={0.6} />
            </mesh>
          ))}
          <mesh position={[0, 1.78, -0.01]} scale={[1, 0.55, 1]}>
            <sphereGeometry args={[0.17, 14, 10]} />
            <meshStandardMaterial color="#14161b" roughness={0.28} metalness={0.65} />
          </mesh>

          {/* Capa en paneles */}
          <group ref={cape} position={[0, 1.42, -0.18]}>
            {[
              { y: -0.28, w: 0.62, h: 0.62, z: -0.02 },
              { y: -0.78, w: 0.72, h: 0.6, z: -0.07 },
              { y: -1.2, w: 0.78, h: 0.42, z: -0.1 },
            ].map((panel, index) => (
              <mesh key={index} position={[0, panel.y, panel.z]} rotation={[0.04 + index * 0.03, 0, 0]}>
                <boxGeometry args={[panel.w, panel.h, 0.045]} />
                <meshStandardMaterial color="#07080a" roughness={0.88} metalness={0.05} side={THREE.DoubleSide} />
              </mesh>
            ))}
          </group>

          {/* Piernas con botas */}
          {[
            { x: -0.13, ref: leftLeg },
            { x: 0.13, ref: rightLeg },
          ].map((leg) => (
            <group key={leg.x} ref={leg.ref} position={[leg.x, 0.72, 0]}>
              <mesh position={[0, -0.18, 0]}>
                <boxGeometry args={[0.17, 0.38, 0.18]} />
                <meshStandardMaterial color="#0b0c0f" roughness={0.62} />
              </mesh>
              <mesh position={[0, -0.46, 0.01]}>
                <boxGeometry args={[0.18, 0.14, 0.2]} />
                <meshStandardMaterial color="#14171d" roughness={0.38} metalness={0.55} />
              </mesh>
              <mesh position={[0, -0.64, 0]}>
                <boxGeometry args={[0.15, 0.28, 0.16]} />
                <meshStandardMaterial color="#090a0d" roughness={0.68} />
              </mesh>
              <mesh position={[0, -0.8, 0.05]}>
                <boxGeometry args={[0.17, 0.11, 0.26]} />
                <meshStandardMaterial color="#0d1015" roughness={0.4} metalness={0.4} />
              </mesh>
            </group>
          ))}

          {/* Brazos con guantes */}
          {[
            { x: -0.32, ref: leftArm, tilt: 0.12 },
            { x: 0.32, ref: rightArm, tilt: -0.12 },
          ].map((arm) => (
            <group key={arm.x} ref={arm.ref} position={[arm.x, 1.34, 0]} rotation={[0, 0, arm.tilt]}>
              <mesh position={[0, -0.2, 0]}>
                <boxGeometry args={[0.14, 0.38, 0.17]} />
                <meshStandardMaterial color="#0a0b0e" roughness={0.6} />
              </mesh>
              <mesh position={[0, -0.42, 0.01]}>
                <boxGeometry args={[0.16, 0.12, 0.19]} />
                <meshStandardMaterial color="#171a20" roughness={0.35} metalness={0.6} />
              </mesh>
              <mesh position={[0, -0.58, 0.02]}>
                <boxGeometry args={[0.13, 0.26, 0.15]} />
                <meshStandardMaterial color="#090a0d" roughness={0.62} />
              </mesh>
              <mesh position={[0, -0.75, 0.05]}>
                <boxGeometry args={[0.15, 0.13, 0.19]} />
                <meshStandardMaterial color="#0b0d11" roughness={0.45} metalness={0.4} />
              </mesh>
              {arm.x > 0 && (
                <group position={[0, -0.78, 0.09]} rotation={[0.08, 0, -0.18]}>
                  <mesh>
                    <cylinderGeometry args={[0.042, 0.05, 0.3, 10]} />
                    <meshStandardMaterial color="#a8b3b8" metalness={0.85} roughness={0.25} />
                  </mesh>
                  <mesh position={[0, 0.17, 0]}>
                    <cylinderGeometry args={[0.06, 0.045, 0.08, 10]} />
                    <meshStandardMaterial color="#20282e" metalness={0.7} roughness={0.3} />
                  </mesh>
                  <mesh position={[0, 1.3, 0]}>
                    <cylinderGeometry args={[0.018, 0.021, 2.3, 8]} />
                    <meshBasicMaterial color="#fff0f0" toneMapped={false} />
                  </mesh>
                  <mesh position={[0, 1.3, 0]}>
                    <cylinderGeometry args={[0.055, 0.06, 2.3, 10]} />
                    <meshBasicMaterial color="#ff4d4d" toneMapped={false} transparent opacity={0.85} />
                  </mesh>
                  <mesh position={[0, 1.3, 0]}>
                    <cylinderGeometry args={[0.14, 0.14, 2.3, 10]} />
                    <meshBasicMaterial color="#ff2f2f" toneMapped={false} transparent opacity={0.12} depthWrite={false} />
                  </mesh>
                  <mesh position={[0, 2.47, 0]}>
                    <sphereGeometry args={[0.035, 8, 8]} />
                    <meshBasicMaterial color="#ffe6e6" toneMapped={false} />
                  </mesh>
                  <pointLight position={[0, 1.4, 0]} color="#ff5a4a" intensity={12} distance={10} decay={2} />
                </group>
              )}
            </group>
          ))}
        </group>
      </group>
    )
  }

  return (
    <group>
      <group ref={body}>
        <mesh position={[0, 1.05, 0]}>
          <boxGeometry args={[0.36, 0.62, 0.25]} />
          <meshStandardMaterial color={colors.coat} roughness={0.78} />
        </mesh>
        <mesh position={[0, 1.06, 0.13]}>
          <boxGeometry args={[0.04, 0.52, 0.02]} />
          <meshStandardMaterial color="#1a2228" roughness={0.7} />
        </mesh>
        <mesh position={[0, 1.47, 0]}>
          <sphereGeometry args={[0.155, 14, 12]} />
          <meshStandardMaterial color={colors.skin} roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.57, -0.035]} scale={[1, 0.8, 1]}>
          <sphereGeometry args={[0.155, 12, 10]} />
          <meshStandardMaterial color={colors.hair} roughness={0.88} />
        </mesh>
        <mesh position={[0, 1.43, 0.13]}>
          <boxGeometry args={[0.06, 0.05, 0.05]} />
          <meshStandardMaterial color={colors.skin} roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.75, 0]}>
          <boxGeometry args={[0.37, 0.08, 0.26]} />
          <meshStandardMaterial color="#222b31" roughness={0.7} />
        </mesh>

        {[
          { x: -0.1, ref: leftLeg },
          { x: 0.1, ref: rightLeg },
        ].map((leg) => (
          <group key={leg.x} ref={leg.ref} position={[leg.x, 0.74, 0]}>
            <mesh position={[0, -0.2, 0]}>
              <boxGeometry args={[0.14, 0.42, 0.15]} />
              <meshStandardMaterial color={colors.trousers} roughness={0.82} />
            </mesh>
            <mesh position={[0, -0.46, 0.02]}>
              <boxGeometry args={[0.15, 0.14, 0.25]} />
              <meshStandardMaterial color="#12181d" roughness={0.6} />
            </mesh>
          </group>
        ))}

        {[
          { x: -0.235, ref: leftArm, tilt: 0.06 },
          { x: 0.235, ref: rightArm, tilt: -0.06 },
        ].map((arm) => (
          <group key={arm.x} ref={arm.ref} position={[arm.x, 1.28, 0]} rotation={[0, 0, arm.tilt]}>
            <mesh position={[0, -0.22, 0]}>
              <boxGeometry args={[0.1, 0.46, 0.13]} />
              <meshStandardMaterial color={colors.coat} roughness={0.82} />
            </mesh>
            <mesh position={[0, -0.48, 0]}>
              <sphereGeometry args={[0.062, 8, 8]} />
              <meshStandardMaterial color={colors.skin} roughness={0.8} />
            </mesh>
          </group>
        ))}
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
    <group ref={group} position={[initial.x, 0, initial.z]} rotation={[0, Math.atan2(-initial.tz, initial.tx), 0]} scale={vader ? 1.12 : 1}>
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
  {
    route: C_HOMES_WALK,
    start: 20,
    speed: 1.3,
    colors: { coat: '#b39a76', trousers: '#28333a', skin: '#bc9277', hair: '#211c18' },
  },
  {
    route: C_HOMES_WALK,
    start: 95,
    speed: 1.45,
    colors: { coat: '#8b9c8e', trousers: '#232d32', skin: '#c7a084', hair: '#1f2428' },
  },
  {
    route: C_WORKS_WALK,
    start: 55,
    speed: 1.25,
    colors: { coat: '#7a8b6f', trousers: '#2b3336', skin: '#b2876d', hair: '#29221d' },
  },
  {
    route: B_TOWERS_WALK,
    start: 40,
    speed: 1.35,
    colors: { coat: '#7c7f96', trousers: '#202832', skin: '#bd947b', hair: '#1d2428' },
  },
  {
    route: B_SOUTH_WALK,
    start: 90,
    speed: 1.4,
    colors: { coat: '#64687e', trousers: '#1e2830', skin: '#c49b7d', hair: '#211b17' },
  },
  {
    route: A_NORTH_WALK,
    start: 30,
    speed: 1.4,
    colors: { coat: '#9dacb0', trousers: '#26343b', skin: '#b58d73', hair: '#29221d' },
  },
  {
    route: A_SOUTH_WALK,
    start: 120,
    speed: 1.3,
    colors: { coat: '#ad9c7c', trousers: '#222d33', skin: '#c6a184', hair: '#1d2428' },
  },
]

export function Pedestrians() {
  return (
    <group>
      {PEOPLE.map((person, index) => (
        <Walker
          key={index}
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
