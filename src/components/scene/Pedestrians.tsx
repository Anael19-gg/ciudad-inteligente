import { useLayoutEffect, useMemo, useRef } from 'react'
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
  [-174, 54],
  [-106, 54],
  [-106, 104],
  [-174, 104],
])
const EAST_WALK = makeWalkerRoute([
  [106, 54],
  [174, 54],
  [174, 104],
  [106, 104],
])
const C_HOMES_WALK = makeWalkerRoute([
  [-134, 10.5],
  [-105, 10.5],
  [-105, 42],
  [-134, 42],
])
const C_WORKS_WALK = makeWalkerRoute([
  [-134, -12],
  [-134, -42],
  [-106, -42],
  [-106, -12],
])
const B_TOWERS_WALK = makeWalkerRoute([
  [108, 10.5],
  [136, 10.5],
  [136, 43],
  [108, 43],
])
const B_SOUTH_WALK = makeWalkerRoute([
  [134, -12],
  [134, -42.5],
  [106, -42.5],
  [106, -12],
])
const A_NORTH_WALK = makeWalkerRoute([
  [-56, 56],
  [56, 56],
  [56, 72],
  [-56, 72],
])
const A_SOUTH_WALK = makeWalkerRoute([
  [56, -56],
  [-56, -56],
  [-56, -72],
  [56, -72],
])
const C_LAKE_WALK = makeWalkerRoute([
  [-163, 61],
  [-149, 61],
  [-149, 73],
  [-163, 73],
])
const A_POND_WALK = makeWalkerRoute([
  [34, 96],
  [54, 96],
  [54, 104],
  [34, 104],
])
const B_POND_WALK = makeWalkerRoute([
  [84, 25],
  [95, 25],
  [95, 36],
  [84, 36],
])
const SCHOOL_WALK = makeWalkerRoute([
  [-95, 55],
  [-77, 55],
  [-77, 69],
  [-95, 69],
])
const CLINIC_WALK = makeWalkerRoute([
  [78, 88],
  [94, 88],
  [94, 104],
  [78, 104],
])
const MARKET_WALK = makeWalkerRoute([
  [-52, -57],
  [-35, -57],
  [-35, -71],
  [-52, -71],
])
const FOREST_WALK = makeWalkerRoute([
  [-18, -86],
  [18, -86],
  [18, -98],
  [-18, -98],
])
const PLAZA_WALK = makeWalkerRoute([
  [-20, 54],
  [20, 54],
  [20, 72],
  [-20, 72],
])
const HUB_WALK = makeWalkerRoute([
  [-20, -54],
  [20, -54],
  [20, -72],
  [-20, -72],
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
    if (leftLeg.current) leftLeg.current.rotation.x = swing
    if (rightLeg.current) rightLeg.current.rotation.x = -swing
    if (leftArm.current) leftArm.current.rotation.x = -swing * 0.7
    if (rightArm.current) rightArm.current.rotation.x = swing * 0.7
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
            <meshStandardMaterial color="#15191f" roughness={0.55} metalness={0.35} />
          </mesh>
          <mesh position={[0, 1.29, 0.01]}>
            <boxGeometry args={[0.55, 0.36, 0.38]} />
            <meshStandardMaterial color="#1d222b" roughness={0.32} metalness={0.62} />
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
          {[-0.34, 0.34].map((x) => (
            <mesh key={`clasp-${x}`} position={[x, 1.46, 0.17]} rotation={[0, 0, x < 0 ? 0.34 : -0.34]}>
              <boxGeometry args={[0.05, 0.06, 0.055]} />
              <meshStandardMaterial color="#75818a" roughness={0.25} metalness={0.85} />
            </mesh>
          ))}
          <mesh position={[0, 1.44, -0.17]}>
            <boxGeometry args={[0.3, 0.035, 0.045]} />
            <meshStandardMaterial color="#525c65" roughness={0.3} metalness={0.8} />
          </mesh>
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
            <meshStandardMaterial color="#1d222b" roughness={0.4} metalness={0.5} />
          </mesh>

          {/* Cinturón y tabardo */}
          <mesh position={[0, 0.71, 0]}>
            <boxGeometry args={[0.48, 0.13, 0.36]} />
            <meshStandardMaterial color="#161a20" roughness={0.5} metalness={0.4} />
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
            <meshStandardMaterial color="#11141a" roughness={0.85} />
          </mesh>

          {/* Casco, máscara y lentes */}
          <mesh position={[0, 1.62, -0.005]} scale={[1, 0.92, 1.02]}>
            <sphereGeometry args={[0.2, 16, 14]} />
            <meshStandardMaterial color="#1b2029" roughness={0.24} metalness={0.68} />
          </mesh>
          <mesh position={[0, 1.6, 0.04]}>
            <boxGeometry args={[0.37, 0.08, 0.22]} />
            <meshStandardMaterial color="#161a21" roughness={0.3} metalness={0.6} />
          </mesh>
          <mesh position={[0, 1.515, 0.11]}>
            <boxGeometry args={[0.34, 0.028, 0.2]} />
            <meshStandardMaterial color="#69737b" roughness={0.28} metalness={0.8} />
          </mesh>
          {[-0.12, 0.12].map((x) => (
            <mesh key={`cheek-${x}`} position={[x, 1.47, 0.235]} rotation={[0, x < 0 ? 0.2 : -0.2, 0]}>
              <boxGeometry args={[0.1, 0.13, 0.03]} />
              <meshStandardMaterial color="#303741" roughness={0.35} metalness={0.65} />
            </mesh>
          ))}
          <mesh position={[0, 1.52, 0.17]} rotation={[-0.14, 0, 0]}>
            <boxGeometry args={[0.3, 0.26, 0.13]} />
            <meshStandardMaterial color="#161a21" roughness={0.32} metalness={0.55} />
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
              <meshStandardMaterial color="#4c555d" roughness={0.5} metalness={0.6} />
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
                <meshStandardMaterial color="#11141a" roughness={0.88} metalness={0.05} side={THREE.DoubleSide} />
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
                <meshStandardMaterial color="#161a20" roughness={0.62} />
              </mesh>
              <mesh position={[0, -0.46, 0.01]}>
                <boxGeometry args={[0.18, 0.14, 0.2]} />
                <meshStandardMaterial color="#20252d" roughness={0.38} metalness={0.55} />
              </mesh>
              <mesh position={[0, -0.64, 0]}>
                <boxGeometry args={[0.15, 0.28, 0.16]} />
                <meshStandardMaterial color="#13161c" roughness={0.68} />
              </mesh>
              <mesh position={[0, -0.8, 0.05]}>
                <boxGeometry args={[0.17, 0.11, 0.26]} />
                <meshStandardMaterial color="#0d1015" roughness={0.4} metalness={0.4} />
              </mesh>
              <mesh position={[0, -0.84, 0.16]}>
                <boxGeometry args={[0.14, 0.03, 0.06]} />
                <meshStandardMaterial color="#5a646c" roughness={0.3} metalness={0.8} />
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
                <meshStandardMaterial color="#13161c" roughness={0.62} />
              </mesh>
              <mesh position={[0, -0.75, 0.05]}>
                <boxGeometry args={[0.15, 0.13, 0.19]} />
                <meshStandardMaterial color="#161a21" roughness={0.45} metalness={0.4} />
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
                  <mesh position={[0, 0.68, 0]}>
                    <cylinderGeometry args={[0.016, 0.019, 1.15, 8]} />
                    <meshBasicMaterial color="#fff0f0" toneMapped={false} />
                  </mesh>
                  <mesh position={[0, 0.68, 0]}>
                    <cylinderGeometry args={[0.05, 0.055, 1.15, 10]} />
                    <meshBasicMaterial color="#ff4d4d" toneMapped={false} transparent opacity={0.85} />
                  </mesh>
                  <mesh position={[0, 0.68, 0]}>
                    <cylinderGeometry args={[0.12, 0.12, 1.15, 10]} />
                    <meshBasicMaterial color="#ff2f2f" toneMapped={false} transparent opacity={0.1} depthWrite={false} />
                  </mesh>
                  <mesh position={[0, 1.27, 0]}>
                    <sphereGeometry args={[0.03, 8, 8]} />
                    <meshBasicMaterial color="#ffe6e6" toneMapped={false} />
                  </mesh>
                  <pointLight position={[0, 0.8, 0]} color="#ff5a4a" intensity={12} distance={8} decay={2} />
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
    const target = Math.atan2(point.tx, point.tz)
    const current = group.current.rotation.y
    const difference = Math.atan2(Math.sin(target - current), Math.cos(target - current))
    group.current.rotation.y = current + difference * Math.min(1, delta * 5)
  })

  return (
    <group ref={group} position={[initial.x, vader ? 0.14 : 0, initial.z]} rotation={[0, Math.atan2(initial.tx, initial.tz), 0]} scale={vader ? 1.08 : 1}>
      <PersonModel colors={colors} vader={vader} phase={start * 0.13} />
    </group>
  )
}

interface CrowdPerson {
  route: WalkRoute
  start: number
  speed: number
  colors: PersonColors
}

const Y_AXIS = new THREE.Vector3(0, 1, 0)

function InstancedCrowd({ people }: { people: CrowdPerson[] }) {
  const torsoRef = useRef<THREE.InstancedMesh>(null)
  const headRef = useRef<THREE.InstancedMesh>(null)
  const hairRef = useRef<THREE.InstancedMesh>(null)
  const legRef = useRef<THREE.InstancedMesh>(null)
  const shoeRef = useRef<THREE.InstancedMesh>(null)
  const armRef = useRef<THREE.InstancedMesh>(null)
  const progress = useRef(people.map((person) => person.start % person.route.total))
  const count = people.length

  const setMatrices = useMemo(() => {
    const base = new THREE.Matrix4()
    const rotation = new THREE.Matrix4()
    const local = new THREE.Matrix4()
    const transform = new THREE.Matrix4()
    const scaleMatrix = new THREE.Matrix4()
    const scratch = new THREE.Matrix4()
    const legSwing = new THREE.Matrix4()
    const legSwingOpposite = new THREE.Matrix4()
    const hipLeft = new THREE.Matrix4()
    const hipRight = new THREE.Matrix4()
    const armSwingLeft = new THREE.Matrix4()
    const armSwingRight = new THREE.Matrix4()
    const shoulderLeft = new THREE.Matrix4()
    const shoulderRight = new THREE.Matrix4()

    return (elapsed: number) => {
      if (!torsoRef.current || !headRef.current || !hairRef.current || !legRef.current || !shoeRef.current || !armRef.current) return
      const half = count
      for (let i = 0; i < count; i += 1) {
        const person = people[i]
        const point = walkAt(person.route, progress.current[i])
        const yaw = Math.atan2(point.tx, point.tz)
        const bob = Math.abs(Math.sin(elapsed * 2.6 + person.start * 0.13)) * 0.025
        const swing = Math.sin(elapsed * 2.6 + person.start * 0.13) * 0.34

        base.makeTranslation(point.x, bob, point.z)
        rotation.makeRotationY(yaw)
        base.multiply(rotation)

        torsoRef.current.setMatrixAt(i, scratch.copy(base).multiply(local.makeTranslation(0, 1.05, 0)))
        headRef.current.setMatrixAt(i, scratch.copy(base).multiply(local.makeTranslation(0, 1.47, 0)))
        hairRef.current.setMatrixAt(
          i,
          scratch
            .copy(base)
            .multiply(local.makeTranslation(0, 1.57, -0.035))
            .multiply(scaleMatrix.makeScale(1, 0.8, 1)),
        )

        legSwing.makeRotationX(swing)
        legSwingOpposite.makeRotationX(-swing)
        hipLeft.copy(base).multiply(local.makeTranslation(-0.1, 0.74, 0)).multiply(legSwing)
        hipRight.copy(base).multiply(local.makeTranslation(0.1, 0.74, 0)).multiply(legSwingOpposite)
        legRef.current.setMatrixAt(i, transform.copy(hipLeft).multiply(local.makeTranslation(0, -0.3, 0)))
        legRef.current.setMatrixAt(i + half, transform.copy(hipRight).multiply(local.makeTranslation(0, -0.3, 0)))
        shoeRef.current.setMatrixAt(i, transform.copy(hipLeft).multiply(local.makeTranslation(0, -0.67, 0.02)))
        shoeRef.current.setMatrixAt(i + half, transform.copy(hipRight).multiply(local.makeTranslation(0, -0.67, 0.02)))

        armSwingLeft.makeRotationX(-swing * 0.7)
        armSwingRight.makeRotationX(swing * 0.7)
        shoulderLeft.copy(base).multiply(local.makeTranslation(-0.235, 1.28, 0)).multiply(armSwingLeft)
        shoulderRight.copy(base).multiply(local.makeTranslation(0.235, 1.28, 0)).multiply(armSwingRight)
        armRef.current.setMatrixAt(i, transform.copy(shoulderLeft).multiply(local.makeTranslation(0, -0.22, 0)))
        armRef.current.setMatrixAt(i + half, transform.copy(shoulderRight).multiply(local.makeTranslation(0, -0.22, 0)))
      }
      torsoRef.current.instanceMatrix.needsUpdate = true
      headRef.current.instanceMatrix.needsUpdate = true
      hairRef.current.instanceMatrix.needsUpdate = true
      legRef.current.instanceMatrix.needsUpdate = true
      shoeRef.current.instanceMatrix.needsUpdate = true
      armRef.current.instanceMatrix.needsUpdate = true
    }
  }, [people, count])

  useLayoutEffect(() => {
    if (!torsoRef.current || !headRef.current || !hairRef.current || !legRef.current || !shoeRef.current || !armRef.current) return
    people.forEach((person, index) => {
      torsoRef.current!.setColorAt(index, new THREE.Color(person.colors.coat))
      headRef.current!.setColorAt(index, new THREE.Color(person.colors.skin))
      hairRef.current!.setColorAt(index, new THREE.Color(person.colors.hair))
      legRef.current!.setColorAt(index, new THREE.Color(person.colors.trousers))
      legRef.current!.setColorAt(index + people.length, new THREE.Color(person.colors.trousers))
      shoeRef.current!.setColorAt(index, new THREE.Color('#12181d'))
      shoeRef.current!.setColorAt(index + people.length, new THREE.Color('#12181d'))
      armRef.current!.setColorAt(index, new THREE.Color(person.colors.coat))
      armRef.current!.setColorAt(index + people.length, new THREE.Color(person.colors.coat))
    })
    torsoRef.current.instanceColor!.needsUpdate = true
    headRef.current.instanceColor!.needsUpdate = true
    hairRef.current.instanceColor!.needsUpdate = true
    legRef.current.instanceColor!.needsUpdate = true
    shoeRef.current.instanceColor!.needsUpdate = true
    armRef.current.instanceColor!.needsUpdate = true
    setMatrices(0)
  }, [people, setMatrices])

  useFrame(({ clock }, delta) => {
    const step = Math.min(delta, 0.1)
    for (let i = 0; i < count; i += 1) {
      progress.current[i] = (progress.current[i] + people[i].speed * step) % people[i].route.total
    }
    setMatrices(clock.elapsedTime)
  })

  return (
    <group>
      <instancedMesh ref={torsoRef} args={[undefined, undefined, count]} castShadow>
        <boxGeometry args={[0.36, 0.62, 0.25]} />
        <meshStandardMaterial color="#ffffff" roughness={0.78} />
      </instancedMesh>
      <instancedMesh ref={headRef} args={[undefined, undefined, count]}>
        <sphereGeometry args={[0.155, 12, 10]} />
        <meshStandardMaterial color="#ffffff" roughness={0.8} />
      </instancedMesh>
      <instancedMesh ref={hairRef} args={[undefined, undefined, count]}>
        <sphereGeometry args={[0.155, 10, 8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.88} />
      </instancedMesh>
      <instancedMesh ref={legRef} args={[undefined, undefined, count * 2]} castShadow>
        <boxGeometry args={[0.14, 0.6, 0.15]} />
        <meshStandardMaterial color="#ffffff" roughness={0.82} />
      </instancedMesh>
      <instancedMesh ref={shoeRef} args={[undefined, undefined, count * 2]}>
        <boxGeometry args={[0.15, 0.14, 0.25]} />
        <meshStandardMaterial color="#ffffff" roughness={0.6} />
      </instancedMesh>
      <instancedMesh ref={armRef} args={[undefined, undefined, count * 2]} castShadow>
        <boxGeometry args={[0.1, 0.46, 0.13]} />
        <meshStandardMaterial color="#ffffff" roughness={0.82} />
      </instancedMesh>
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
  {
    route: C_LAKE_WALK,
    start: 12,
    speed: 1.2,
    colors: { coat: '#9a8864', trousers: '#2a3439', skin: '#b58d73', hair: '#2a231d' },
  },
  {
    route: C_LAKE_WALK,
    start: 46,
    speed: 1.35,
    colors: { coat: '#7f9187', trousers: '#1f2a2e', skin: '#c49d82', hair: '#1e2427' },
  },
  {
    route: A_POND_WALK,
    start: 18,
    speed: 1.3,
    colors: { coat: '#a5b4b8', trousers: '#27343b', skin: '#c5a087', hair: '#211c18' },
  },
  {
    route: A_POND_WALK,
    start: 54,
    speed: 1.25,
    colors: { coat: '#b39c7b', trousers: '#222c32', skin: '#a87e64', hair: '#26201b' },
  },
  {
    route: B_POND_WALK,
    start: 10,
    speed: 1.35,
    colors: { coat: '#7a8095', trousers: '#202832', skin: '#bd947b', hair: '#1d2428' },
  },
  {
    route: B_POND_WALK,
    start: 44,
    speed: 1.3,
    colors: { coat: '#8d9aa1', trousers: '#263137', skin: '#c49b7d', hair: '#1f2428' },
  },
  {
    route: SOUTH_WALK,
    start: 900,
    speed: 1.4,
    colors: { coat: '#b7a583', trousers: '#28343b', skin: '#b58d73', hair: '#29221d' },
  },
  {
    route: NORTH_WALK,
    start: 980,
    speed: 1.3,
    colors: { coat: '#83969b', trousers: '#273238', skin: '#c7a084', hair: '#1c2023' },
  },
  {
    route: WEST_WALK,
    start: 470,
    speed: 1.35,
    colors: { coat: '#9c856b', trousers: '#263137', skin: '#c6a184', hair: '#1f1a16' },
  },
  {
    route: SCHOOL_WALK,
    start: 20,
    speed: 1.25,
    colors: { coat: '#8d9fa5', trousers: '#243037', skin: '#c49b7d', hair: '#1d2428' },
  },
  {
    route: SCHOOL_WALK,
    start: 72,
    speed: 1.35,
    colors: { coat: '#b09a78', trousers: '#263238', skin: '#b58d73', hair: '#29221d' },
  },
  {
    route: CLINIC_WALK,
    start: 16,
    speed: 1.3,
    colors: { coat: '#7b959c', trousers: '#202b31', skin: '#c6a184', hair: '#1f2428' },
  },
  {
    route: MARKET_WALK,
    start: 28,
    speed: 1.2,
    colors: { coat: '#a98d69', trousers: '#2a3439', skin: '#b2876d', hair: '#26201b' },
  },
  {
    route: FOREST_WALK,
    start: 30,
    speed: 1.15,
    colors: { coat: '#849a8d', trousers: '#243037', skin: '#c5a087', hair: '#1c2428' },
  },
  {
    route: FOREST_WALK,
    start: 78,
    speed: 1.25,
    colors: { coat: '#9b836b', trousers: '#202b31', skin: '#a87e64', hair: '#211c18' },
  },
  {
    route: PLAZA_WALK,
    start: 12,
    speed: 1.3,
    colors: { coat: '#8ea2a8', trousers: '#243037', skin: '#c7a084', hair: '#1d2529' },
  },
  {
    route: PLAZA_WALK,
    start: 58,
    speed: 1.2,
    colors: { coat: '#b39c7a', trousers: '#263238', skin: '#b58d73', hair: '#29221d' },
  },
  {
    route: HUB_WALK,
    start: 22,
    speed: 1.28,
    colors: { coat: '#7f979d', trousers: '#202b31', skin: '#c49b7d', hair: '#1f2428' },
  },
  {
    route: HUB_WALK,
    start: 74,
    speed: 1.18,
    colors: { coat: '#a88f6e', trousers: '#2a3439', skin: '#b2876d', hair: '#26201b' },
  },
]

const CROWD: CrowdPerson[] = PEOPLE.filter((person) => !person.vader).map(({ route, start, speed, colors }) => ({
  route,
  start,
  speed,
  colors,
}))

export function Pedestrians() {
  const vader = PEOPLE.find((person) => person.vader)
  return (
    <group>
      <InstancedCrowd people={CROWD} />
      {vader && (
        <Walker
          route={vader.route}
          start={vader.start}
          speed={vader.speed}
          colors={vader.colors}
          vader
        />
      )}
    </group>
  )
}
