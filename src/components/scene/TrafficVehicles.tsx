import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { AVENUE_SIGNALS, getMainSignal } from './signals'

type Point2 = [number, number]

interface Route {
  points: Point2[]
  lengths: number[]
  total: number
  stopS: number[]
}

function makeRoute(points: Point2[], stopS: number[] = []): Route {
  const lengths: number[] = []
  let total = 0
  for (let i = 0; i < points.length; i += 1) {
    const a = points[i]
    const b = points[(i + 1) % points.length]
    const length = Math.hypot(b[0] - a[0], b[1] - a[1])
    lengths.push(length)
    total += length
  }
  return {
    points,
    lengths,
    total,
    stopS: stopS.map((s) => ((s % total) + total) % total).filter((s) => s >= 0 && s < total),
  }
}

function routeAt(route: Route, distance: number) {
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

function nextStopDistance(route: Route, distance: number) {
  let best = Infinity
  for (const stop of route.stopS) {
    let d = stop - distance
    if (d < 0) d += route.total
    if (d < best) best = d
  }
  return best
}

const eastStops = AVENUE_SIGNALS.map((x) => Math.max(0, x + 180 - 2.5))
const westStops = AVENUE_SIGNALS.map((x) => Math.max(0, 180 - x - 2.5))

const AVENUE_EAST_OUTER = makeRoute(
  [
    [-180, -4.8],
    [180, -4.8],
    [180, 48],
    [-180, 48],
  ],
  eastStops,
)
const AVENUE_EAST_INNER = makeRoute(
  [
    [-180, -2.2],
    [180, -2.2],
    [180, 48],
    [-180, 48],
  ],
  eastStops,
)
const AVENUE_WEST_INNER = makeRoute(
  [
    [180, 2.2],
    [-180, 2.2],
    [-180, -48],
    [180, -48],
  ],
  westStops,
)
const AVENUE_WEST_OUTER = makeRoute(
  [
    [180, 4.8],
    [-180, 4.8],
    [-180, -48],
    [180, -48],
  ],
  westStops,
)

const WEST_NORTH = makeRoute([
  [-180, 48],
  [-100, 48],
  [-100, 110],
  [-180, 110],
])
const EAST_NORTH = makeRoute([
  [100, 48],
  [180, 48],
  [180, 110],
  [100, 110],
])
const WEST_SOUTH = makeRoute([
  [-180, -48],
  [-100, -48],
  [-100, -110],
  [-180, -110],
])
const EAST_SOUTH = makeRoute([
  [100, -48],
  [180, -48],
  [180, -110],
  [100, -110],
])
const CENTER_NORTH = makeRoute([
  [-62, 48],
  [62, 48],
  [62, 110],
  [-62, 110],
])
const CENTER_SOUTH = makeRoute([
  [-62, -48],
  [62, -48],
  [62, -110],
  [-62, -110],
])
const BIKE_LOOP = makeRoute([
  [-220, 9.4],
  [220, 9.4],
  [220, 7.2],
  [-220, 7.2],
])

type CarVariant = 'sedan' | 'compact' | 'taxi' | 'pickup' | 'security'
type VehicleKind = 'car' | 'bus' | 'bike'

function CarModel({ variant = 'sedan', color = '#b6c3c9' }: { variant?: CarVariant; color?: string }) {
  const isPickup = variant === 'pickup'
  const isCompact = variant === 'compact'
  const isTaxi = variant === 'taxi'
  const isSecurity = variant === 'security'
  const length = isCompact ? 1.95 : isPickup ? 2.7 : isSecurity ? 2.5 : 2.35
  const roofLength = isPickup ? 0.9 : isCompact ? 1.0 : 1.2

  return (
    <group>
      <RoundedBox args={[length, 0.5, 1.08]} radius={0.14} smoothness={2} position={[0, 0.45, 0]}>
        <meshStandardMaterial color={color} roughness={0.34} metalness={0.6} />
      </RoundedBox>
      <mesh position={[isPickup ? length * 0.22 : -0.1, 0.78, 0]}>
        <boxGeometry args={[roofLength, isPickup ? 0.3 : 0.38, 0.88]} />
        <meshStandardMaterial
          color={isSecurity ? '#0b1115' : '#0d1920'}
          roughness={0.18}
          metalness={0.55}
          emissive={isTaxi ? '#5d4d1d' : '#1a3b47'}
          emissiveIntensity={0.3}
        />
      </mesh>
      {isPickup && (
        <mesh position={[-length * 0.32, 0.63, 0]}>
          <boxGeometry args={[0.95, 0.18, 0.9]} />
          <meshStandardMaterial color="#131b20" roughness={0.8} />
        </mesh>
      )}
      <mesh position={[0, 0.33, 0]}>
        <boxGeometry args={[length - 0.2, 0.08, 0.96]} />
        <meshBasicMaterial color={isSecurity ? '#9bb7c1' : '#81a8b6'} transparent opacity={0.55} toneMapped={false} />
      </mesh>
      {[-length * 0.3, length * 0.3].map((x) =>
        [-0.53, 0.53].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 0.26, z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.15, 10]} />
            <meshStandardMaterial color="#080d10" roughness={0.7} />
          </mesh>
        )),
      )}
      <mesh position={[length / 2 + 0.02, 0.5, 0]}>
        <boxGeometry args={[0.05, 0.16, 0.88]} />
        <meshBasicMaterial color="#eaf7fa" toneMapped={false} />
      </mesh>
      <mesh position={[-length / 2 - 0.02, 0.48, 0]}>
        <boxGeometry args={[0.04, 0.11, 0.7]} />
        <meshBasicMaterial color="#d0806e" toneMapped={false} />
      </mesh>
      {isTaxi && (
        <mesh position={[-0.1, 1.03, 0]}>
          <boxGeometry args={[0.45, 0.15, 0.28]} />
          <meshBasicMaterial color="#e1c36e" toneMapped={false} />
        </mesh>
      )}
      {isSecurity && (
        <mesh position={[-0.1, 1.02, 0]}>
          <boxGeometry args={[1.0, 0.12, 0.24]} />
          <meshBasicMaterial color="#6fb6ff" toneMapped={false} />
        </mesh>
      )}
    </group>
  )
}

function BusModel({ color = '#b9c7cc' }: { color?: string }) {
  return (
    <group>
      <RoundedBox args={[4.6, 1.35, 1.9]} radius={0.22} smoothness={3} position={[0, 0.92, 0]}>
        <meshStandardMaterial color={color} roughness={0.32} metalness={0.5} />
      </RoundedBox>
      <mesh position={[-0.2, 1.3, 0]}>
        <boxGeometry args={[3.0, 0.55, 1.72]} />
        <meshStandardMaterial color="#0d1b22" roughness={0.16} metalness={0.5} emissive="#183d48" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 0.34, 0]}>
        <boxGeometry args={[4.3, 0.1, 1.8]} />
        <meshBasicMaterial color="#74dbe7" transparent opacity={0.7} toneMapped={false} />
      </mesh>
      {[-1.7, 1.7].map((x) =>
        [-0.84, 0.84].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 0.28, z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.2, 12]} />
            <meshStandardMaterial color="#080d10" roughness={0.7} />
          </mesh>
        )),
      )}
      <mesh position={[2.33, 0.9, 0]}>
        <boxGeometry args={[0.05, 0.32, 1.55]} />
        <meshBasicMaterial color="#e9f8fa" toneMapped={false} />
      </mesh>
      <mesh position={[-2.33, 0.85, 0]}>
        <boxGeometry args={[0.05, 0.2, 1.35]} />
        <meshBasicMaterial color="#d17e6c" toneMapped={false} />
      </mesh>
      <mesh position={[0, 1.78, 0]}>
        <sphereGeometry args={[0.13, 10, 10]} />
        <meshStandardMaterial color="#90a0a7" metalness={0.6} roughness={0.3} emissive="#2f6272" emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}

function BikeModel({ jacket = '#c3a36a', frame = '#8da0a8' }: { jacket?: string; frame?: string }) {
  const wheels = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (wheels.current) wheels.current.rotation.z = clock.elapsedTime * 2
  })

  return (
    <group>
      <group ref={wheels}>
        {[-0.62, 0.62].map((x) => (
          <mesh key={x} position={[x, 0.34, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.31, 0.035, 5, 18]} />
            <meshBasicMaterial color="#aeb9bd" />
          </mesh>
        ))}
      </group>
      <mesh position={[0, 0.42, 0]} rotation={[0, 0, -0.1]}>
        <boxGeometry args={[1.05, 0.045, 0.045]} />
        <meshStandardMaterial color={frame} metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0.26, 0.5, 0]} rotation={[0, 0, 0.8]}>
        <boxGeometry args={[0.04, 0.5, 0.04]} />
        <meshStandardMaterial color={frame} metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0.61, 0.64, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.04, 0.04, 0.42]} />
        <meshStandardMaterial color="#1b2429" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[-0.22, 0.62, 0]}>
        <boxGeometry args={[0.28, 0.05, 0.16]} />
        <meshStandardMaterial color="#121a1e" roughness={0.7} />
      </mesh>
      <mesh position={[-0.05, 0.93, 0]}>
        <boxGeometry args={[0.28, 0.45, 0.28]} />
        <meshStandardMaterial color={jacket} roughness={0.6} />
      </mesh>
      <mesh position={[-0.05, 1.23, 0]}>
        <sphereGeometry args={[0.13, 10, 10]} />
        <meshStandardMaterial color="#b58d73" roughness={0.7} />
      </mesh>
      <mesh position={[0.02, 0.78, 0]} rotation={[0, 0, -0.45]}>
        <boxGeometry args={[0.36, 0.07, 0.07]} />
        <meshStandardMaterial color={jacket} roughness={0.6} />
      </mesh>
    </group>
  )
}

function VehicleBody({
  kind,
  variant,
  color,
  jacket,
}: {
  kind: VehicleKind
  variant?: CarVariant
  color?: string
  jacket?: string
}) {
  if (kind === 'bus') return <BusModel color={color} />
  if (kind === 'bike') return <BikeModel jacket={jacket} frame={color} />
  return <CarModel variant={variant} color={color} />
}

function RouteVehicle({
  route,
  start,
  speed,
  kind,
  variant,
  color,
  jacket,
}: {
  route: Route
  start: number
  speed: number
  kind: VehicleKind
  variant?: CarVariant
  color?: string
  jacket?: string
}) {
  const group = useRef<THREE.Group>(null)
  const progress = useRef(start % route.total)
  const initial = useMemo(() => routeAt(route, start % route.total), [route, start])

  useFrame(({ clock }, delta) => {
    if (!group.current) return
    let factor = 1
    if (route.stopS.length) {
      const signal = getMainSignal(clock.elapsedTime)
      if (signal !== 'green') {
        const distance = nextStopDistance(route, progress.current)
        if (distance < 24) factor = Math.max(0, Math.min(1, (distance - 2) / 14))
      }
    }
    progress.current = (progress.current + speed * factor * delta) % route.total
    const point = routeAt(route, progress.current)
    group.current.position.set(point.x, 0, point.z)
    const target = Math.atan2(-point.tz, point.tx)
    const current = group.current.rotation.y
    const difference = Math.atan2(Math.sin(target - current), Math.cos(target - current))
    group.current.rotation.y = current + difference * Math.min(1, delta * 7)
  })

  return (
    <group ref={group} position={[initial.x, 0, initial.z]} rotation={[0, Math.atan2(-initial.tz, initial.tx), 0]}>
      <VehicleBody kind={kind} variant={variant} color={color} jacket={jacket} />
    </group>
  )
}

export function TrafficVehicles() {
  return (
    <group>
      {/* Avenida principal: carriles con semáforos */}
      <RouteVehicle route={AVENUE_EAST_OUTER} start={150} speed={9.2} kind="car" variant="sedan" color="#aebfc6" />
      <RouteVehicle route={AVENUE_EAST_INNER} start={220} speed={6.4} kind="bus" color="#c1d0d5" />
      <RouteVehicle route={AVENUE_WEST_OUTER} start={165} speed={8.8} kind="car" variant="security" color="#596b74" />
      <RouteVehicle route={AVENUE_WEST_INNER} start={260} speed={6.1} kind="bus" color="#b6c5cb" />

      {/* Anillo exterior: tráfico continuo en los cuatro cuadrantes */}
      <RouteVehicle route={WEST_NORTH} start={40} speed={7.4} kind="car" variant="compact" color="#a6b6bd" />
      <RouteVehicle route={WEST_NORTH} start={220} speed={7.4} kind="car" variant="pickup" color="#8e9ba1" />
      <RouteVehicle route={WEST_NORTH} start={120} speed={7.2} kind="car" variant="sedan" color="#b6c3c9" />
      <RouteVehicle route={EAST_NORTH} start={60} speed={7.8} kind="car" variant="security" color="#596b74" />
      <RouteVehicle route={EAST_NORTH} start={250} speed={7.8} kind="car" variant="taxi" color="#b9a56f" />
      <RouteVehicle route={EAST_NORTH} start={140} speed={7.6} kind="car" variant="compact" color="#a6b6bd" />
      <RouteVehicle route={WEST_SOUTH} start={80} speed={7.1} kind="car" variant="taxi" color="#b9a56f" />
      <RouteVehicle route={WEST_SOUTH} start={260} speed={7.1} kind="car" variant="sedan" color="#a6b6bd" />
      <RouteVehicle route={WEST_SOUTH} start={160} speed={6.9} kind="car" variant="pickup" color="#8e9ba1" />
      <RouteVehicle route={EAST_SOUTH} start={30} speed={7.6} kind="bus" color="#c1d0d5" />
      <RouteVehicle route={EAST_SOUTH} start={230} speed={7.6} kind="car" variant="compact" color="#a6b6bd" />
      <RouteVehicle route={EAST_SOUTH} start={140} speed={7.4} kind="car" variant="taxi" color="#b9a56f" />
      <RouteVehicle route={CENTER_NORTH} start={50} speed={7.2} kind="car" variant="pickup" color="#8e9ba1" />
      <RouteVehicle route={CENTER_NORTH} start={240} speed={7.2} kind="car" variant="sedan" color="#b6c3c9" />
      <RouteVehicle route={CENTER_NORTH} start={130} speed={6.4} kind="bus" color="#c1d0d5" />
      <RouteVehicle route={CENTER_SOUTH} start={90} speed={7.5} kind="car" variant="taxi" color="#b9a56f" />
      <RouteVehicle route={CENTER_SOUTH} start={280} speed={7.5} kind="car" variant="security" color="#596b74" />
      <RouteVehicle route={CENTER_SOUTH} start={180} speed={6.7} kind="car" variant="sedan" color="#b6c3c9" />

      {/* Ciclovía continua sobre la avenida */}
      <RouteVehicle route={BIKE_LOOP} start={30} speed={3.1} kind="bike" color="#84969e" jacket="#b7a16d" />
      <RouteVehicle route={BIKE_LOOP} start={230} speed={3.1} kind="bike" color="#94a6ad" jacket="#869fa4" />
      <RouteVehicle route={BIKE_LOOP} start={430} speed={3.1} kind="bike" color="#84969e" jacket="#a5755c" />
      <RouteVehicle route={BIKE_LOOP} start={630} speed={3.1} kind="bike" color="#94a6ad" jacket="#7f979c" />
      <RouteVehicle route={BIKE_LOOP} start={330} speed={2.9} kind="bike" color="#8a9da4" jacket="#9d8a63" />
      <RouteVehicle route={BIKE_LOOP} start={530} speed={3.2} kind="bike" color="#9aabb1" jacket="#788f94" />
    </group>
  )
}
