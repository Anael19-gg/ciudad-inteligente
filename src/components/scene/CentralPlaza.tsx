import { useLayoutEffect, useRef } from 'react'
import * as THREE from 'three'

type Vec3 = [number, number, number]
type TreeSpec = { x: number; z: number; scale: number }
type BenchSpec = { angle: number; radius: number }
type LampSpec = { angle: number; radius: number }
type PlanterSpec = { x: number; z: number }

const PLAZA_X = 0
const PLAZA_Z = 63
const PLAZA_WIDTH = 46
const PLAZA_DEPTH = 20

const TREES: TreeSpec[] = [
  { x: -20, z: -8.2, scale: 0.9 },
  { x: -14, z: -8.4, scale: 1.0 },
  { x: -8, z: -8.2, scale: 0.82 },
  { x: -2, z: -8.4, scale: 1.06 },
  { x: 4, z: -8.2, scale: 0.88 },
  { x: 10, z: -8.4, scale: 1.0 },
  { x: -20, z: 8.2, scale: 0.96 },
  { x: -14, z: 8.4, scale: 0.84 },
  { x: -8, z: 8.2, scale: 1.04 },
  { x: -2, z: 8.4, scale: 0.9 },
  { x: 4, z: 8.2, scale: 1.02 },
  { x: 10, z: 8.4, scale: 0.86 },
  { x: 16, z: 8.2, scale: 0.95 },
  { x: 20, z: 8.4, scale: 0.82 },
  { x: -20.4, z: -2.2, scale: 0.86 },
  { x: -20.4, z: 2.2, scale: 1.0 },
]

const BENCHES: BenchSpec[] = [
  { angle: 0.15, radius: 5.1 },
  { angle: 0.95, radius: 5.1 },
  { angle: 1.75, radius: 5.1 },
  { angle: 2.55, radius: 5.1 },
  { angle: 3.35, radius: 5.1 },
  { angle: 4.15, radius: 5.1 },
  { angle: 4.95, radius: 5.1 },
  { angle: 5.75, radius: 5.1 },
]

const LAMPS: LampSpec[] = [
  { angle: 0.4, radius: 8.8 },
  { angle: 1.45, radius: 8.8 },
  { angle: 2.5, radius: 8.8 },
  { angle: 3.6, radius: 8.8 },
  { angle: 4.65, radius: 8.8 },
  { angle: 5.7, radius: 8.8 },
]

const PLANTERS: PlanterSpec[] = [
  { x: -16, z: -3.2 },
  { x: -16, z: 3.2 },
  { x: 16, z: 3.2 },
  { x: -9.5, z: -4.6 },
  { x: 9.5, z: 4.6 },
  { x: 9.5, z: -4.6 },
]

function Trees({ day }: { day: boolean }) {
  const trunkRef = useRef<THREE.InstancedMesh>(null)
  const canopyRef = useRef<THREE.InstancedMesh>(null)
  const crownRef = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    if (!trunkRef.current || !canopyRef.current || !crownRef.current) return
    const matrix = new THREE.Matrix4()
    const position = new THREE.Vector3()
    const quaternion = new THREE.Quaternion()
    const scale = new THREE.Vector3()
    const color = new THREE.Color()
    const palette = day
      ? ['#3d7b57', '#4b8a60', '#356f4e', '#578f65']
      : ['#1d473e', '#28574b', '#225244', '#1a3f38']

    TREES.forEach((tree, index) => {
      const size = tree.scale
      position.set(tree.x, 0.85 * size, tree.z)
      scale.set(size, size, size)
      matrix.compose(position, quaternion, scale)
      trunkRef.current!.setMatrixAt(index, matrix)

      position.set(tree.x, 2.15 * size, tree.z)
      scale.set(size * 1.08, size * 1.24, size * 1.08)
      matrix.compose(position, quaternion, scale)
      canopyRef.current!.setMatrixAt(index, matrix)
      canopyRef.current!.setColorAt(index, color.set(palette[index % palette.length]))

      position.set(tree.x + 0.18 * size, 2.72 * size, tree.z - 0.12 * size)
      scale.set(size * 0.62, size * 0.76, size * 0.62)
      matrix.compose(position, quaternion, scale)
      crownRef.current!.setMatrixAt(index, matrix)
      crownRef.current!.setColorAt(index, color.set(palette[(index + 2) % palette.length]))
    })
    trunkRef.current.instanceMatrix.needsUpdate = true
    canopyRef.current.instanceMatrix.needsUpdate = true
    crownRef.current.instanceMatrix.needsUpdate = true
    if (canopyRef.current.instanceColor) canopyRef.current.instanceColor.needsUpdate = true
    if (crownRef.current.instanceColor) crownRef.current.instanceColor.needsUpdate = true
  }, [day])

  return (
    <group>
      <instancedMesh ref={trunkRef} args={[undefined, undefined, TREES.length]} castShadow>
        <cylinderGeometry args={[0.1, 0.16, 1.7, 7]} />
        <meshStandardMaterial color={day ? '#5b4a38' : '#2b2924'} roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={canopyRef} args={[undefined, undefined, TREES.length]} castShadow>
        <icosahedronGeometry args={[0.92, 0]} />
        <meshStandardMaterial color="#ffffff" roughness={0.88} flatShading />
      </instancedMesh>
      <instancedMesh ref={crownRef} args={[undefined, undefined, TREES.length]} castShadow>
        <icosahedronGeometry args={[0.78, 0]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} flatShading />
      </instancedMesh>
    </group>
  )
}

function Benches({ day }: { day: boolean }) {
  const seatRef = useRef<THREE.InstancedMesh>(null)
  const backRef = useRef<THREE.InstancedMesh>(null)
  const legRef = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    if (!seatRef.current || !backRef.current || !legRef.current) return
    const matrix = new THREE.Matrix4()
    const position = new THREE.Vector3()
    const quaternion = new THREE.Quaternion()
    const euler = new THREE.Euler()
    const scale = new THREE.Vector3(1, 1, 1)

    BENCHES.forEach((bench, index) => {
      const x = Math.cos(bench.angle) * bench.radius
      const z = Math.sin(bench.angle) * bench.radius
      const rotation = -bench.angle - Math.PI / 2
      euler.set(0, rotation, 0)
      quaternion.setFromEuler(euler)

      position.set(x, 0.55, z)
      matrix.compose(position, quaternion, scale)
      seatRef.current!.setMatrixAt(index, matrix)

      position.set(x - Math.sin(rotation) * 0.2, 0.93, z - Math.cos(rotation) * 0.2)
      matrix.compose(position, quaternion, scale)
      backRef.current!.setMatrixAt(index, matrix)

      position.set(x + Math.cos(rotation) * 0.9, 0.27, z - Math.sin(rotation) * 0.9)
      matrix.compose(position, quaternion, scale)
      legRef.current!.setMatrixAt(index * 2, matrix)
      position.set(x - Math.cos(rotation) * 0.9, 0.27, z + Math.sin(rotation) * 0.9)
      matrix.compose(position, quaternion, scale)
      legRef.current!.setMatrixAt(index * 2 + 1, matrix)
    })
    seatRef.current.instanceMatrix.needsUpdate = true
    backRef.current.instanceMatrix.needsUpdate = true
    legRef.current.instanceMatrix.needsUpdate = true
  }, [])

  return (
    <group>
      <instancedMesh ref={seatRef} args={[undefined, undefined, BENCHES.length]} castShadow>
        <boxGeometry args={[1.45, 0.13, 0.48]} />
        <meshStandardMaterial color={day ? '#8b6c4a' : '#5a4633'} roughness={0.82} />
      </instancedMesh>
      <instancedMesh ref={backRef} args={[undefined, undefined, BENCHES.length]} castShadow>
        <boxGeometry args={[1.45, 0.48, 0.09]} />
        <meshStandardMaterial color={day ? '#8b6c4a' : '#5a4633'} roughness={0.82} />
      </instancedMesh>
      <instancedMesh ref={legRef} args={[undefined, undefined, BENCHES.length * 2]}>
        <boxGeometry args={[0.09, 0.5, 0.36]} />
        <meshStandardMaterial color={day ? '#4d5c62' : '#2c3a40'} metalness={0.55} roughness={0.5} />
      </instancedMesh>
    </group>
  )
}

function Lamps({ day }: { day: boolean }) {
  const poleRef = useRef<THREE.InstancedMesh>(null)
  const headRef = useRef<THREE.InstancedMesh>(null)
  const glowRef = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    if (!poleRef.current || !headRef.current) return
    const matrix = new THREE.Matrix4()
    const position = new THREE.Vector3()
    const quaternion = new THREE.Quaternion()
    const flat = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0))
    const scale = new THREE.Vector3(1, 1, 1)

    LAMPS.forEach((lamp, index) => {
      const x = Math.cos(lamp.angle) * lamp.radius
      const z = Math.sin(lamp.angle) * lamp.radius
      position.set(x, 2.3, z)
      matrix.compose(position, quaternion, scale)
      poleRef.current!.setMatrixAt(index, matrix)
      position.set(x, 4.55, z)
      matrix.compose(position, quaternion, scale)
      headRef.current!.setMatrixAt(index, matrix)
      if (glowRef.current) {
        position.set(x, 0.1, z)
        scale.set(3.4, 3.4, 3.4)
        matrix.compose(position, flat, scale)
        glowRef.current.setMatrixAt(index, matrix)
        scale.set(1, 1, 1)
      }
    })
    poleRef.current.instanceMatrix.needsUpdate = true
    headRef.current.instanceMatrix.needsUpdate = true
    if (glowRef.current) glowRef.current.instanceMatrix.needsUpdate = true
  }, [day])

  return (
    <group>
      <instancedMesh ref={poleRef} args={[undefined, undefined, LAMPS.length]}>
        <cylinderGeometry args={[0.07, 0.11, 4.6, 7]} />
        <meshStandardMaterial color={day ? '#6f7c82' : '#394850'} metalness={0.6} roughness={0.48} />
      </instancedMesh>
      <instancedMesh ref={headRef} args={[undefined, undefined, LAMPS.length]}>
        <sphereGeometry args={[0.2, 10, 10]} />
        <meshBasicMaterial color={day ? '#e9e2cf' : '#ffdaa3'} toneMapped={false} />
      </instancedMesh>
      {!day && (
        <instancedMesh ref={glowRef} args={[undefined, undefined, LAMPS.length]}>
          <circleGeometry args={[1, 20]} />
          <meshBasicMaterial color="#ffc98a" transparent opacity={0.12} depthWrite={false} />
        </instancedMesh>
      )}
    </group>
  )
}

function Planters({ day }: { day: boolean }) {
  const potRef = useRef<THREE.InstancedMesh>(null)
  const shrubRef = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    if (!potRef.current || !shrubRef.current) return
    const matrix = new THREE.Matrix4()
    const position = new THREE.Vector3()
    const quaternion = new THREE.Quaternion()
    const scale = new THREE.Vector3(1, 1, 1)
    const color = new THREE.Color()
    const palette = day ? ['#3f7552', '#4d8560', '#356a4b'] : ['#214b3f', '#2a5748', '#1b4239']

    PLANTERS.forEach((planter, index) => {
      position.set(planter.x, 0.35, planter.z)
      matrix.compose(position, quaternion, scale)
      potRef.current!.setMatrixAt(index, matrix)
      position.set(planter.x, 0.98, planter.z)
      scale.set(0.92, 0.82, 0.92)
      matrix.compose(position, quaternion, scale)
      shrubRef.current!.setMatrixAt(index, matrix)
      shrubRef.current!.setColorAt(index, color.set(palette[index % palette.length]))
      scale.set(1, 1, 1)
    })
    potRef.current.instanceMatrix.needsUpdate = true
    shrubRef.current.instanceMatrix.needsUpdate = true
    if (shrubRef.current.instanceColor) shrubRef.current.instanceColor.needsUpdate = true
  }, [day])

  return (
    <group>
      <instancedMesh ref={potRef} args={[undefined, undefined, PLANTERS.length]} castShadow>
        <boxGeometry args={[1.5, 0.7, 1.5]} />
        <meshStandardMaterial color={day ? '#7b8588' : '#2f3c42'} roughness={0.85} />
      </instancedMesh>
      <instancedMesh ref={shrubRef} args={[undefined, undefined, PLANTERS.length]} castShadow>
        <icosahedronGeometry args={[0.86, 0]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} flatShading />
      </instancedMesh>
    </group>
  )
}

function Fountain({ day }: { day: boolean }) {
  return (
    <group position={[0, 0.15, 0]}>
      <mesh position={[0, 0.2, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[3.7, 3.9, 0.4, 40]} />
        <meshStandardMaterial color={day ? '#909b99' : '#3d4a4e'} roughness={0.72} metalness={0.18} />
      </mesh>
      <mesh position={[0, 0.31, 0]}>
        <cylinderGeometry args={[3.35, 3.35, 0.12, 40]} />
        <meshStandardMaterial
          color={day ? '#55b7c0' : '#1a4a58'}
          emissive={day ? '#1b6167' : '#2b8294'}
          emissiveIntensity={day ? 0.18 : 0.55}
          roughness={0.18}
          metalness={0.25}
        />
      </mesh>
      <mesh position={[0, 0.46, 0]}>
        <cylinderGeometry args={[0.62, 0.9, 0.75, 16]} />
        <meshStandardMaterial color={day ? '#7d8a89' : '#364449'} roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.96, 0]}>
        <cylinderGeometry args={[1.5, 1.5, 0.14, 28]} />
        <meshStandardMaterial color={day ? '#8d9a98' : '#3b4a4e'} roughness={0.65} metalness={0.2} />
      </mesh>
      <mesh position={[0, 1.55, 0]}>
        <cylinderGeometry args={[0.12, 0.2, 1.2, 8]} />
        <meshStandardMaterial color={day ? '#a5b2af' : '#53656a'} roughness={0.45} metalness={0.35} />
      </mesh>
      <mesh position={[0, 2.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.58, 0.72, 28]} />
        <meshBasicMaterial color={day ? '#bdeef4' : '#8fe9f4'} transparent opacity={0.8} toneMapped={false} />
      </mesh>
      {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((angle) => (
        <mesh
          key={angle}
          position={[Math.cos(angle) * 1.2, 1.65, Math.sin(angle) * 1.2]}
          rotation={[0, -angle, -0.35]}
        >
          <cylinderGeometry args={[0.025, 0.05, 1.1, 6]} />
          <meshBasicMaterial color={day ? '#a9e6ec' : '#8fe9f4'} transparent opacity={0.7} toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[0, 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4.2, 4.5, 48]} />
        <meshBasicMaterial color={day ? '#6cd3df' : '#7de6f2'} transparent opacity={day ? 0.3 : 0.55} toneMapped={false} />
      </mesh>
    </group>
  )
}

function SolarPergola({ day }: { day: boolean }) {
  return (
    <group position={[16, 0, -7]}>
      {[
        [-1.9, 0, -1.5],
        [1.9, 0, -1.5],
        [-1.9, 0, 1.5],
        [1.9, 0, 1.5],
      ].map(([x, y, z]) => (
        <mesh key={`${x}-${z}`} position={[x, y + 1.7, z]} castShadow>
          <cylinderGeometry args={[0.08, 0.1, 3.4, 7]} />
          <meshStandardMaterial color={day ? '#748086' : '#38474e'} metalness={0.6} roughness={0.45} />
        </mesh>
      ))}
      <mesh position={[0, 3.55, 0]} castShadow>
        <boxGeometry args={[4.6, 0.16, 3.7]} />
        <meshStandardMaterial color={day ? '#8f9a9d' : '#2c3d45'} metalness={0.55} roughness={0.42} />
      </mesh>
      {[-1.2, 0.4].map((z) => (
        <mesh key={z} position={[0, 3.78, z]} rotation={[-0.32, 0, 0]} castShadow>
          <boxGeometry args={[3.8, 0.06, 1.35]} />
          <meshStandardMaterial
            color={day ? '#2d5169' : '#0d2d42'}
            emissive="#2f7fa8"
            emissiveIntensity={day ? 0.22 : 0.72}
            metalness={0.4}
            roughness={0.35}
          />
        </mesh>
      ))}
      <mesh position={[0, 0.36, 2.2]} castShadow>
        <boxGeometry args={[3.1, 0.12, 0.6]} />
        <meshStandardMaterial color={day ? '#8b6c4a' : '#5a4633'} roughness={0.82} />
      </mesh>
      {[-1.2, 1.2].map((x) => (
        <mesh key={`bench-leg-${x}`} position={[x, 0.2, 2.2]}>
          <boxGeometry args={[0.08, 0.4, 0.45]} />
          <meshStandardMaterial color={day ? '#4d5c62' : '#2c3a40'} metalness={0.55} roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

export function CentralPlaza({ day = false }: { day?: boolean }) {
  return (
    <group position={[PLAZA_X, 0, PLAZA_Z]}>
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <boxGeometry args={[PLAZA_WIDTH, 0.12, PLAZA_DEPTH]} />
        <meshStandardMaterial color={day ? '#5e6a6c' : '#172227'} roughness={0.9} metalness={0.12} />
      </mesh>
      <mesh position={[0, 0.135, 0]} receiveShadow>
        <boxGeometry args={[PLAZA_WIDTH - 3.6, 0.06, PLAZA_DEPTH - 3.6]} />
        <meshStandardMaterial color={day ? '#6f7b7c' : '#1d2a30'} roughness={0.86} metalness={0.12} />
      </mesh>
      <mesh position={[0, 0.17, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[7.4, 48]} />
        <meshStandardMaterial color={day ? '#7d8888' : '#24343a'} roughness={0.82} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[7.4, 7.9, 48]} />
        <meshBasicMaterial color={day ? '#8edbe2' : '#6edce8'} transparent opacity={day ? 0.28 : 0.55} toneMapped={false} />
      </mesh>
      {[0, Math.PI / 2].map((angle) => (
        <mesh key={angle} position={[0, 0.16, 0]} rotation={[0, angle, 0]}>
          <boxGeometry args={[PLAZA_WIDTH - 2.4, 0.02, 2.4]} />
          <meshStandardMaterial color={day ? '#737f80' : '#223137'} roughness={0.88} />
        </mesh>
      ))}
      {[Math.PI / 4, -Math.PI / 4].map((angle) => (
        <mesh key={angle} position={[0, 0.16, 0]} rotation={[0, angle, 0]}>
          <boxGeometry args={[PLAZA_WIDTH - 7.2, 0.02, 1.7]} />
          <meshStandardMaterial color={day ? '#737f80' : '#223137'} roughness={0.88} />
        </mesh>
      ))}

      <Trees day={day} />
      <Benches day={day} />
      <Lamps day={day} />
      <Planters day={day} />
      <Fountain day={day} />
      <SolarPergola day={day} />

      <mesh position={[0, 0.2, 9.4]}>
        <boxGeometry args={[3.4, 0.28, 0.5]} />
        <meshStandardMaterial color={day ? '#899597' : '#2d3d43'} roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.05, 9.4]}>
        <boxGeometry args={[1.8, 1.15, 0.16]} />
        <meshStandardMaterial
          color={day ? '#2c4b5a' : '#0b2533'}
          emissive="#6fd8e4"
          emissiveIntensity={day ? 0.18 : 0.9}
          metalness={0.45}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[0, 1.05, 9.32]}>
        <boxGeometry args={[1.45, 0.8, 0.04]} />
        <meshBasicMaterial color={day ? '#8edbe2' : '#7ee8f4'} transparent opacity={day ? 0.35 : 0.65} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.55, 9.4]}>
        <cylinderGeometry args={[0.08, 0.1, 1.1, 7]} />
        <meshStandardMaterial color={day ? '#6f7c82' : '#394850'} metalness={0.6} roughness={0.48} />
      </mesh>
    </group>
  )
}
