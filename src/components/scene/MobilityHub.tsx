import { useLayoutEffect, useRef } from 'react'
import * as THREE from 'three'
import { Line } from '@react-three/drei'

type Vec3 = [number, number, number]

const HUB_X = 0
const HUB_Z = -63
const HUB_WIDTH = 44
const HUB_DEPTH = 20

const SHUTTLES: { x: number; color: string }[] = [
  { x: -7.2, color: '#9fb6bd' },
  { x: 0, color: '#b6c7cc' },
  { x: 7.2, color: '#a6b9a8' },
]

const EV_CARS: { x: number; color: string }[] = [
  { x: -11.5, color: '#9aaeb6' },
  { x: -4.2, color: '#a6b9c1' },
  { x: 4.2, color: '#b7a98c' },
  { x: 11.5, color: '#8fa4ad' },
]

const CHARGERS: Vec3[] = [
  [-13.9, 0, 5.6],
  [-7.2, 0, 5.6],
  [0, 0, 5.6],
  [7.2, 0, 5.6],
  [13.9, 0, 5.6],
]

const HUB_LAMPS: Vec3[] = [
  [-18, 0, -7.6],
  [-6, 0, -7.6],
  [6, 0, -7.6],
  [18, 0, -7.6],
]

function Shuttles({ day }: { day: boolean }) {
  const bodyRef = useRef<THREE.InstancedMesh>(null)
  const glassRef = useRef<THREE.InstancedMesh>(null)
  const wheelRef = useRef<THREE.InstancedMesh>(null)
  const lightRef = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    if (!bodyRef.current || !glassRef.current || !wheelRef.current || !lightRef.current) return
    const matrix = new THREE.Matrix4()
    const position = new THREE.Vector3()
    const quaternion = new THREE.Quaternion()
    const scale = new THREE.Vector3(1, 1, 1)
    const color = new THREE.Color()

    SHUTTLES.forEach((shuttle, index) => {
      position.set(shuttle.x, 1.05, 0)
      matrix.compose(position, quaternion, scale)
      bodyRef.current!.setMatrixAt(index, matrix)
      bodyRef.current!.setColorAt(index, color.set(shuttle.color))

      position.set(shuttle.x, 1.55, 0)
      matrix.compose(position, quaternion, scale)
      glassRef.current!.setMatrixAt(index, matrix)

      ;[
        [-1.55, 0.36, -0.98],
        [-1.55, 0.36, 0.98],
        [1.55, 0.36, -0.98],
        [1.55, 0.36, 0.98],
      ].forEach(([dx, dy, dz], wheelIndex) => {
        position.set(shuttle.x + dx, dy, dz)
        quaternion.setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0))
        matrix.compose(position, quaternion, scale)
        wheelRef.current!.setMatrixAt(index * 4 + wheelIndex, matrix)
      })
      quaternion.identity()

      position.set(shuttle.x + 2.2, 0.95, 0)
      matrix.compose(position, quaternion, scale)
      lightRef.current!.setMatrixAt(index * 2, matrix)
      position.set(shuttle.x - 2.2, 0.95, 0)
      matrix.compose(position, quaternion, scale)
      lightRef.current!.setMatrixAt(index * 2 + 1, matrix)
    })
    bodyRef.current.instanceMatrix.needsUpdate = true
    glassRef.current.instanceMatrix.needsUpdate = true
    wheelRef.current.instanceMatrix.needsUpdate = true
    lightRef.current.instanceMatrix.needsUpdate = true
    if (bodyRef.current.instanceColor) bodyRef.current.instanceColor.needsUpdate = true
  }, [day])

  return (
    <group>
      <instancedMesh ref={bodyRef} args={[undefined, undefined, SHUTTLES.length]} castShadow receiveShadow>
        <boxGeometry args={[4.5, 1.55, 2.05]} />
        <meshStandardMaterial color="#ffffff" roughness={0.4} metalness={0.42} />
      </instancedMesh>
      <instancedMesh ref={glassRef} args={[undefined, undefined, SHUTTLES.length]}>
        <boxGeometry args={[3.7, 0.58, 2.08]} />
        <meshStandardMaterial color={day ? '#6e8f9a' : '#0b2735'} emissive="#2c7184" emissiveIntensity={day ? 0.16 : 0.7} metalness={0.4} roughness={0.24} />
      </instancedMesh>
      <instancedMesh ref={wheelRef} args={[undefined, undefined, SHUTTLES.length * 4]}>
        <cylinderGeometry args={[0.34, 0.34, 0.2, 12]} />
        <meshStandardMaterial color="#0a1014" roughness={0.75} />
      </instancedMesh>
      <instancedMesh ref={lightRef} args={[undefined, undefined, SHUTTLES.length * 2]}>
        <boxGeometry args={[0.07, 0.2, 0.85]} />
        <meshBasicMaterial color="#dff8ff" toneMapped={false} />
      </instancedMesh>
    </group>
  )
}

function EvCars({ day }: { day: boolean }) {
  const bodyRef = useRef<THREE.InstancedMesh>(null)
  const cabinRef = useRef<THREE.InstancedMesh>(null)
  const wheelRef = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    if (!bodyRef.current || !cabinRef.current || !wheelRef.current) return
    const matrix = new THREE.Matrix4()
    const position = new THREE.Vector3()
    const quaternion = new THREE.Quaternion()
    const scale = new THREE.Vector3(1, 1, 1)
    const color = new THREE.Color()

    EV_CARS.forEach((car, index) => {
      const x = car.x
      const z = 7.1
      position.set(x, 0.55, z)
      matrix.compose(position, quaternion, scale)
      bodyRef.current!.setMatrixAt(index, matrix)
      bodyRef.current!.setColorAt(index, color.set(car.color))
      position.set(x - 0.1, 0.99, z)
      matrix.compose(position, quaternion, scale)
      cabinRef.current!.setMatrixAt(index, matrix)
      ;[
        [-0.72, 0.28, -0.58],
        [-0.72, 0.28, 0.58],
        [0.72, 0.28, -0.58],
        [0.72, 0.28, 0.58],
      ].forEach(([dx, dy, dz], wheelIndex) => {
        position.set(x + dx, dy, z + dz)
        quaternion.setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0))
        matrix.compose(position, quaternion, scale)
        wheelRef.current!.setMatrixAt(index * 4 + wheelIndex, matrix)
      })
      quaternion.identity()
    })
    bodyRef.current.instanceMatrix.needsUpdate = true
    cabinRef.current.instanceMatrix.needsUpdate = true
    wheelRef.current.instanceMatrix.needsUpdate = true
    if (bodyRef.current.instanceColor) bodyRef.current.instanceColor.needsUpdate = true
  }, [day])

  return (
    <group>
      <instancedMesh ref={bodyRef} args={[undefined, undefined, EV_CARS.length]} castShadow>
        <boxGeometry args={[2.25, 0.55, 1.05]} />
        <meshStandardMaterial color="#ffffff" roughness={0.4} metalness={0.45} />
      </instancedMesh>
      <instancedMesh ref={cabinRef} args={[undefined, undefined, EV_CARS.length]}>
        <boxGeometry args={[1.2, 0.44, 0.9]} />
        <meshStandardMaterial color={day ? '#5f7b86' : '#0c2733'} emissive="#2b6a7c" emissiveIntensity={day ? 0.12 : 0.55} roughness={0.22} metalness={0.55} />
      </instancedMesh>
      <instancedMesh ref={wheelRef} args={[undefined, undefined, EV_CARS.length * 4]}>
        <cylinderGeometry args={[0.22, 0.22, 0.15, 10]} />
        <meshStandardMaterial color="#080d10" roughness={0.75} />
      </instancedMesh>
    </group>
  )
}

function SolarCanopy({ day }: { day: boolean }) {
  return (
    <group>
      {[
        [-9.2, 0, -5.6],
        [9.2, 0, -5.6],
        [-9.2, 0, 5.6],
        [9.2, 0, 5.6],
      ].map(([x, y, z]) => (
        <mesh key={`${x}-${z}`} position={[x, y + 3.15, z]} castShadow>
          <cylinderGeometry args={[0.16, 0.22, 6.3, 8]} />
          <meshStandardMaterial color={day ? '#6d7b82' : '#33444c'} metalness={0.65} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 6.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[20.5, 0.22, 12.4]} />
        <meshStandardMaterial color={day ? '#899499' : '#22343d'} metalness={0.55} roughness={0.42} />
      </mesh>
      {[-4.6, -1.5, 1.6, 4.7].map((z) => (
        <group key={z} position={[0, 0, z]}>
          {[-6.8, -2.3, 2.3, 6.8].map((x) => (
            <mesh key={x} position={[x, 6.55, 0]} rotation={[-0.28, 0, 0]} castShadow>
              <boxGeometry args={[4.1, 0.06, 2.55]} />
              <meshStandardMaterial
                color={day ? '#315b70' : '#0a2c40'}
                emissive="#2f7fa8"
                emissiveIntensity={day ? 0.2 : 0.62}
                metalness={0.4}
                roughness={0.3}
              />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[0, 6.53, 0]}>
        <boxGeometry args={[20.1, 0.04, 0.08]} />
        <meshBasicMaterial color="#73dbe8" transparent opacity={day ? 0.35 : 0.75} toneMapped={false} />
      </mesh>
      <mesh position={[0, 6.12, 6.24]}>
        <boxGeometry args={[19.5, 0.3, 0.08]} />
        <meshStandardMaterial
          color={day ? '#3b4d55' : '#1b2b32'}
          emissive="#65d8e5"
          emissiveIntensity={day ? 0.18 : 0.8}
          metalness={0.45}
          roughness={0.35}
        />
      </mesh>
      {[-5.6, 5.6].map((z) => (
        <mesh key={z} position={[0, 0.22, z]}>
          <boxGeometry args={[19.6, 0.32, 0.7]} />
          <meshStandardMaterial color={day ? '#758287' : '#273a42'} roughness={0.85} />
        </mesh>
      ))}
    </group>
  )
}

function Chargers({ day }: { day: boolean }) {
  const postRef = useRef<THREE.InstancedMesh>(null)
  const screenRef = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    if (!postRef.current || !screenRef.current) return
    const matrix = new THREE.Matrix4()
    const position = new THREE.Vector3()
    const quaternion = new THREE.Quaternion()
    const scale = new THREE.Vector3(1, 1, 1)
    CHARGERS.forEach(([x, , z], index) => {
      position.set(x, 0.95, z)
      matrix.compose(position, quaternion, scale)
      postRef.current!.setMatrixAt(index, matrix)
      position.set(x, 1.54, z - 0.18)
      matrix.compose(position, quaternion, scale)
      screenRef.current!.setMatrixAt(index, matrix)
    })
    postRef.current.instanceMatrix.needsUpdate = true
    screenRef.current.instanceMatrix.needsUpdate = true
  }, [])

  return (
    <group>
      <instancedMesh ref={postRef} args={[undefined, undefined, CHARGERS.length]} castShadow>
        <boxGeometry args={[0.42, 1.9, 0.42]} />
        <meshStandardMaterial color={day ? '#6d7a80' : '#2e4149'} metalness={0.55} roughness={0.45} />
      </instancedMesh>
      <instancedMesh ref={screenRef} args={[undefined, undefined, CHARGERS.length]}>
        <boxGeometry args={[0.28, 0.42, 0.05]} />
        <meshBasicMaterial color={day ? '#76d9e4' : '#8ff1ff'} toneMapped={false} />
      </instancedMesh>
    </group>
  )
}

function ControlCabin({ day }: { day: boolean }) {
  return (
    <group position={[-16.2, 0, -5.8]}>
      <mesh position={[0, 1.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[5.4, 3.2, 4.2]} />
        <meshStandardMaterial color={day ? '#8c989b' : '#2d4048'} roughness={0.55} metalness={0.35} />
      </mesh>
      <mesh position={[0, 3.35, 0]} castShadow>
        <boxGeometry args={[5.8, 0.3, 4.6]} />
        <meshStandardMaterial color={day ? '#67767c' : '#1f333b'} metalness={0.5} roughness={0.45} />
      </mesh>
      <mesh position={[0, 1.9, 2.12]}>
        <boxGeometry args={[4.2, 1.25, 0.1]} />
        <meshStandardMaterial color={day ? '#537987' : '#0c2c3a'} emissive="#67d8e6" emissiveIntensity={day ? 0.2 : 0.9} metalness={0.4} roughness={0.25} />
      </mesh>
      <mesh position={[0, 1.9, 2.18]}>
        <boxGeometry args={[4.0, 0.05, 0.04]} />
        <meshBasicMaterial color="#8feaf4" toneMapped={false} transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, 0.55, 2.2]} castShadow>
        <boxGeometry args={[2.0, 1.1, 0.12]} />
        <meshStandardMaterial color={day ? '#3c4e56' : '#142830'} roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[0, 3.7, 0]}>
        <boxGeometry args={[0.12, 0.4, 0.12]} />
        <meshStandardMaterial color="#7d8b90" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 4.1, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color="#ff9a82" toneMapped={false} />
      </mesh>
    </group>
  )
}

function BikeParking({ day }: { day: boolean }) {
  const wheelRef = useRef<THREE.InstancedMesh>(null)
  const frameRef = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    if (!wheelRef.current || !frameRef.current) return
    const matrix = new THREE.Matrix4()
    const position = new THREE.Vector3()
    const quaternion = new THREE.Quaternion()
    const scale = new THREE.Vector3(1, 1, 1)
    for (let index = 0; index < 5; index += 1) {
      const z = -7.9 + index * 1.05
      ;[0, 1.1].forEach((dx, wheelIndex) => {
        position.set(15.7 + dx, 0.44, z)
        quaternion.setFromEuler(new THREE.Euler(0, 0, 0))
        matrix.compose(position, quaternion, scale)
        wheelRef.current!.setMatrixAt(index * 2 + wheelIndex, matrix)
      })
      position.set(16.25, 0.72, z)
      quaternion.setFromEuler(new THREE.Euler(0, 0, 0))
      matrix.compose(position, quaternion, scale)
      frameRef.current!.setMatrixAt(index, matrix)
    }
    wheelRef.current.instanceMatrix.needsUpdate = true
    frameRef.current.instanceMatrix.needsUpdate = true
  }, [])

  return (
    <group>
      <instancedMesh ref={wheelRef} args={[undefined, undefined, 10]}>
        <torusGeometry args={[0.28, 0.032, 6, 18]} />
        <meshStandardMaterial color="#11181c" roughness={0.7} />
      </instancedMesh>
      <instancedMesh ref={frameRef} args={[undefined, undefined, 5]}>
        <boxGeometry args={[1.15, 0.07, 0.07]} />
        <meshStandardMaterial color={day ? '#7ea0aa' : '#3f6370'} metalness={0.65} roughness={0.35} />
      </instancedMesh>
      <mesh position={[16.8, 0.65, -7.9]}>
        <boxGeometry args={[0.08, 1.3, 0.08]} />
        <meshStandardMaterial color={day ? '#748287' : '#394a51'} metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[16.8, 0.65, -3.7]}>
        <boxGeometry args={[0.08, 1.3, 0.08]} />
        <meshStandardMaterial color={day ? '#748287' : '#394a51'} metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[16.8, 1.28, -5.8]}>
        <boxGeometry args={[0.08, 0.08, 4.3]} />
        <meshStandardMaterial color={day ? '#748287' : '#394a51'} metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  )
}

function HubLamps({ day }: { day: boolean }) {
  return (
    <group>
      {HUB_LAMPS.map(([x, , z]) => (
        <group key={`${x}-${z}`} position={[x, 0, z]}>
          <mesh position={[0, 2.1, 0]}>
            <cylinderGeometry args={[0.06, 0.1, 4.2, 7]} />
            <meshStandardMaterial color={day ? '#738086' : '#37474f'} metalness={0.6} roughness={0.45} />
          </mesh>
          <mesh position={[0, 4.22, 0]}>
            <sphereGeometry args={[0.18, 9, 9]} />
            <meshBasicMaterial color={day ? '#e8e1ce' : '#ffdaa3'} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export function MobilityHub({ day = false }: { day?: boolean }) {
  return (
    <group position={[HUB_X, 0, HUB_Z]}>
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <boxGeometry args={[HUB_WIDTH, 0.12, HUB_DEPTH]} />
        <meshStandardMaterial color={day ? '#5e6a6c' : '#172227'} roughness={0.9} metalness={0.12} />
      </mesh>
      <mesh position={[0, 0.135, 0]} receiveShadow>
        <boxGeometry args={[HUB_WIDTH - 3.2, 0.06, HUB_DEPTH - 3.2]} />
        <meshStandardMaterial color={day ? '#6c7879' : '#1d2a30'} roughness={0.88} metalness={0.1} />
      </mesh>

      <SolarCanopy day={day} />
      <Shuttles day={day} />
      <EvCars day={day} />
      <Chargers day={day} />
      <ControlCabin day={day} />
      <BikeParking day={day} />
      <HubLamps day={day} />

      <Line
        points={[
          [-13.8, 0.18, 5.4],
          [13.8, 0.18, 5.4],
        ]}
        color="#c9d7db"
        transparent
        opacity={0.36}
        lineWidth={0.8}
        dashed
        dashSize={1.1}
        gapSize={0.8}
      />
      {[-14.5, -7.2, 0, 7.2, 14.5].map((x) => (
        <Line
          key={x}
          points={[
            [x, 0.18, 5.2],
            [x, 0.18, 9.2],
          ]}
          color="#c9d7db"
          transparent
          opacity={0.3}
          lineWidth={0.7}
        />
      ))}
      <mesh position={[17.8, 1.55, 6.4]}>
        <boxGeometry args={[2.2, 3.0, 0.24]} />
        <meshStandardMaterial color={day ? '#3e4f57' : '#172b34'} emissive="#62d7e4" emissiveIntensity={day ? 0.16 : 0.75} metalness={0.4} roughness={0.35} />
      </mesh>
      <mesh position={[17.8, 1.55, 6.26]}>
        <boxGeometry args={[1.8, 2.25, 0.04]} />
        <meshBasicMaterial color={day ? '#8edbe2' : '#7ee8f4'} transparent opacity={day ? 0.3 : 0.55} toneMapped={false} />
      </mesh>
      <mesh position={[17.8, 0.9, 6.4]}>
        <cylinderGeometry args={[0.09, 0.11, 1.8, 7]} />
        <meshStandardMaterial color={day ? '#6f7c82' : '#394850'} metalness={0.6} roughness={0.48} />
      </mesh>
    </group>
  )
}
