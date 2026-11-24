import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Html, Line, RoundedBox, useCursor } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { Selection } from '../../data/project'
import { AVENUE_SIGNALS, getMainSignal } from './signals'

function TrafficLight({ position }: { position: [number, number, number] }) {
  const materials = useRef<THREE.MeshBasicMaterial[]>([])
  const side = position[2] > 0 ? -1 : 1
  useFrame(({ clock }) => {
    const signal = getMainSignal(clock.elapsedTime)
    const values = [
      signal === 'red' ? 1 : 0.08,
      signal === 'amber' ? 1 : 0.08,
      signal === 'green' ? 1 : 0.08,
    ]
    materials.current.forEach((material, index) => {
      if (!material) return
      material.opacity = values[Math.floor(index / 2)]
    })
  })

  return (
    <group position={position}>
      <mesh position={[0, 1.4, 0]}>
        <cylinderGeometry args={[0.065, 0.09, 2.8, 6]} />
        <meshStandardMaterial color="#2b343a" metalness={0.6} roughness={0.5} />
      </mesh>
      <mesh position={[0, 2.8, (1.65 * side) / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 1.65, 6]} />
        <meshStandardMaterial color="#2b343a" metalness={0.6} roughness={0.5} />
      </mesh>
      <mesh position={[0, 3.35, 1.65 * side]}>
        <boxGeometry args={[0.42, 1.42, 0.5]} />
        <meshStandardMaterial color="#0b1014" roughness={0.5} metalness={0.4} />
      </mesh>
      {[0.42, 0, -0.42].map((y, row) =>
        [-1, 1].map((face) => (
          <mesh key={`${row}-${face}`} position={[0.225 * face, 3.35 + y, 1.65 * side]} rotation={[0, 0, 0]}>
            <sphereGeometry args={[0.135, 12, 12]} />
            <meshBasicMaterial
              ref={(material) => {
                if (material) materials.current[row * 2 + (face === 1 ? 0 : 1)] = material
              }}
              color={row === 0 ? '#ff6b6b' : row === 1 ? '#ffc06a' : '#66e6b0'}
              toneMapped={false}
              transparent
              opacity={0.4}
            />
          </mesh>
        )),
      )}
    </group>
  )
}

function LprArch({ x, color = '#6fa8ff' }: { x: number; color?: string }) {
  return (
    <group position={[x, 0, 0]}>
      {[-10.4, 10.4].map((z) => (
        <mesh key={z} position={[0, 3.1, z]}>
          <boxGeometry args={[0.34, 6.2, 0.34]} />
          <meshStandardMaterial color="#2b3740" metalness={0.6} roughness={0.45} />
        </mesh>
      ))}
      <mesh position={[0, 6.1, 0]}>
        <boxGeometry args={[0.42, 0.42, 21]} />
        <meshStandardMaterial color="#2b3740" metalness={0.6} roughness={0.45} />
      </mesh>
      <mesh position={[0, 5.83, 0]}>
        <boxGeometry args={[0.1, 0.1, 19.4]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh position={[0, 3.1, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[19.2, 5.9]} />
        <meshBasicMaterial color={color} transparent opacity={0.04} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {[-3.5, 3.5].map((z) => (
        <mesh key={z} position={[0, 6.1, z]}>
          <boxGeometry args={[0.65, 0.32, 0.8]} />
          <meshStandardMaterial color="#131d24" metalness={0.4} roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

interface BusStopSpec {
  x: number
  z: number
  rotation: number
}

function InstancedBusStops({ stops }: { stops: BusStopSpec[] }) {
  const postsRef = useRef<THREE.InstancedMesh>(null)
  const roofRef = useRef<THREE.InstancedMesh>(null)
  const glowRef = useRef<THREE.InstancedMesh>(null)
  const glassRef = useRef<THREE.InstancedMesh>(null)
  const benchRef = useRef<THREE.InstancedMesh>(null)
  const signFrameRef = useRef<THREE.InstancedMesh>(null)
  const signScreenRef = useRef<THREE.InstancedMesh>(null)
  const poleRef = useRef<THREE.InstancedMesh>(null)
  const ringRef = useRef<THREE.InstancedMesh>(null)
  const bulbRef = useRef<THREE.InstancedMesh>(null)
  const count = stops.length

  useLayoutEffect(() => {
    if (
      !postsRef.current ||
      !roofRef.current ||
      !glowRef.current ||
      !glassRef.current ||
      !benchRef.current ||
      !signFrameRef.current ||
      !signScreenRef.current ||
      !poleRef.current ||
      !ringRef.current ||
      !bulbRef.current
    ) {
      return
    }
    const base = new THREE.Matrix4()
    const rot = new THREE.Matrix4()
    const local = new THREE.Matrix4()
    const out = new THREE.Matrix4()
    const ringRotation = new THREE.Matrix4().makeRotationX(Math.PI / 2)

    stops.forEach((stop, index) => {
      base.makeTranslation(stop.x, 0, stop.z).multiply(rot.makeRotationY(stop.rotation))

      ;[0, 3.3].forEach((x, postIndex) => {
        out.copy(base).multiply(local.makeTranslation(x, 1.75, 0))
        postsRef.current!.setMatrixAt(index * 2 + postIndex, out)
      })

      out.copy(base).multiply(local.makeTranslation(1.65, 3.5, 0))
      roofRef.current!.setMatrixAt(index, out)
      out.copy(base).multiply(local.makeTranslation(1.65, 3.58, 0))
      glowRef.current!.setMatrixAt(index, out)
      out.copy(base).multiply(local.makeTranslation(1.65, 1.5, -0.95))
      glassRef.current!.setMatrixAt(index, out)
      out.copy(base).multiply(local.makeTranslation(1.65, 0.55, -0.4))
      benchRef.current!.setMatrixAt(index, out)
      out.copy(base).multiply(local.makeTranslation(0.25, 1.65, -0.75))
      signFrameRef.current!.setMatrixAt(index, out)
      out.copy(base).multiply(local.makeTranslation(0.25, 1.65, -0.71))
      signScreenRef.current!.setMatrixAt(index, out)
      out.copy(base).multiply(local.makeTranslation(3.9, 2.6, 0))
      poleRef.current!.setMatrixAt(index, out)
      out.copy(base).multiply(local.makeTranslation(3.9, 4.9, 0)).multiply(ringRotation)
      ringRef.current!.setMatrixAt(index * 2, out)
      out.copy(base).multiply(local.makeTranslation(3.9, 5.1, 0)).multiply(ringRotation)
      ringRef.current!.setMatrixAt(index * 2 + 1, out)
      out.copy(base).multiply(local.makeTranslation(3.9, 5.2, 0))
      bulbRef.current!.setMatrixAt(index, out)
    })
    postsRef.current.instanceMatrix.needsUpdate = true
    roofRef.current.instanceMatrix.needsUpdate = true
    glowRef.current.instanceMatrix.needsUpdate = true
    glassRef.current.instanceMatrix.needsUpdate = true
    benchRef.current.instanceMatrix.needsUpdate = true
    signFrameRef.current.instanceMatrix.needsUpdate = true
    signScreenRef.current.instanceMatrix.needsUpdate = true
    poleRef.current.instanceMatrix.needsUpdate = true
    ringRef.current.instanceMatrix.needsUpdate = true
    bulbRef.current.instanceMatrix.needsUpdate = true
  }, [stops])

  return (
    <group>
      <instancedMesh ref={postsRef} args={[undefined, undefined, count * 2]} frustumCulled={false}>
        <boxGeometry args={[0.12, 3.5, 0.12]} />
        <meshStandardMaterial color="#2b3942" metalness={0.6} roughness={0.4} />
      </instancedMesh>
      <instancedMesh ref={roofRef} args={[undefined, undefined, count]} frustumCulled={false}>
        <boxGeometry args={[3.8, 0.14, 2.1]} />
        <meshStandardMaterial color="#141e24" metalness={0.5} roughness={0.5} />
      </instancedMesh>
      <instancedMesh ref={glowRef} args={[undefined, undefined, count]} frustumCulled={false}>
        <boxGeometry args={[3.6, 0.03, 1.9]} />
        <meshBasicMaterial color="#79e3f2" transparent opacity={0.6} toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={glassRef} args={[undefined, undefined, count]} frustumCulled={false}>
        <planeGeometry args={[3.3, 2.5]} />
        <meshPhysicalMaterial color="#7bb9c9" transparent opacity={0.14} roughness={0.1} metalness={0.1} side={THREE.DoubleSide} />
      </instancedMesh>
      <instancedMesh ref={benchRef} args={[undefined, undefined, count]} frustumCulled={false}>
        <boxGeometry args={[2.6, 0.12, 0.55]} />
        <meshStandardMaterial color="#27343b" metalness={0.5} roughness={0.5} />
      </instancedMesh>
      <instancedMesh ref={signFrameRef} args={[undefined, undefined, count]} frustumCulled={false}>
        <boxGeometry args={[0.6, 1.1, 0.06]} />
        <meshBasicMaterial color="#0c2029" />
      </instancedMesh>
      <instancedMesh ref={signScreenRef} args={[undefined, undefined, count]} frustumCulled={false}>
        <planeGeometry args={[0.46, 0.9]} />
        <meshBasicMaterial color="#74e0f2" transparent opacity={0.7} side={THREE.DoubleSide} />
      </instancedMesh>
      <instancedMesh ref={poleRef} args={[undefined, undefined, count]} frustumCulled={false}>
        <cylinderGeometry args={[0.04, 0.06, 5.2, 6]} />
        <meshStandardMaterial color="#3b4a52" metalness={0.7} roughness={0.4} />
      </instancedMesh>
      <instancedMesh ref={ringRef} args={[undefined, undefined, count * 2]} frustumCulled={false}>
        <torusGeometry args={[0.32, 0.012, 6, 28]} />
        <meshBasicMaterial color="#7ff0ff" toneMapped={false} transparent opacity={0.55} />
      </instancedMesh>
      <instancedMesh ref={bulbRef} args={[undefined, undefined, count]} frustumCulled={false}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#b8fbff" toneMapped={false} />
      </instancedMesh>
    </group>
  )
}

function AutonomousShuttle({
  lane,
  direction,
  offset,
  speed = 5.5,
}: {
  lane: number
  direction: 1 | -1
  offset: number
  speed?: number
}) {
  const group = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (!group.current) return
    const travel = (offset + clock.elapsedTime * speed) % 140
    group.current.position.x = -70 + travel
  })

  return (
    <group ref={group} position={[-70, 0, lane]} rotation={[0, direction === 1 ? 0 : Math.PI, 0]}>
      <RoundedBox args={[4.2, 1.35, 1.9]} radius={0.32} smoothness={3} position={[0, 0.92, 0]}>
        <meshStandardMaterial color="#c4d5dc" roughness={0.32} metalness={0.6} />
      </RoundedBox>
      <mesh position={[-0.15, 1.32, 0]}>
        <boxGeometry args={[2.9, 0.72, 1.72]} />
        <meshStandardMaterial color="#0d1d26" roughness={0.16} metalness={0.6} emissive="#154452" emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <boxGeometry args={[3.9, 0.12, 1.78]} />
        <meshBasicMaterial color="#66e6f5" toneMapped={false} transparent opacity={0.85} />
      </mesh>
      {[-1.4, 1.4].map((x) =>
        [-0.82, 0.82].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 0.28, z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.28, 0.28, 0.24, 12]} />
            <meshStandardMaterial color="#0a0f12" roughness={0.7} />
          </mesh>
        )),
      )}
      <mesh position={[2.1, 0.85, 0]}>
        <boxGeometry args={[0.07, 0.26, 1.4]} />
        <meshBasicMaterial color="#eafcff" toneMapped={false} />
      </mesh>
      <mesh position={[-2.1, 0.85, 0]}>
        <boxGeometry args={[0.06, 0.2, 1.2]} />
        <meshBasicMaterial color="#ff7a6b" toneMapped={false} />
      </mesh>
      <mesh position={[0, 1.7, 0]}>
        <sphereGeometry args={[0.22, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#11252e" metalness={0.6} roughness={0.3} emissive="#3bc7e0" emissiveIntensity={0.6} />
      </mesh>
    </group>
  )
}

function MunicipalBuilding({ onSelect }: { onSelect: (selection: Selection) => void }) {
  return (
    <group position={[-14, 0, -24]}>
      <mesh position={[0, 4.5, 0]} castShadow>
        <boxGeometry args={[11.5, 9, 8]} />
        <meshStandardMaterial color="#182732" roughness={0.42} metalness={0.55} />
        <Line
          points={[
            [-5.8, -4.5, 4.05],
            [5.8, -4.5, 4.05],
            [5.8, 4.5, 4.05],
            [-5.8, 4.5, 4.05],
            [-5.8, -4.5, 4.05],
          ]}
          color="#79e3f2"
          transparent
          opacity={0.55}
          lineWidth={1}
        />
      </mesh>
      <mesh position={[0, 3.2, 4.03]}>
        <planeGeometry args={[9.8, 4.6]} />
        <meshStandardMaterial color="#0e2c3a" roughness={0.2} metalness={0.4} emissive="#2e8fae" emissiveIntensity={0.35} />
      </mesh>
      {[-3.9, -1.3, 1.3, 3.9].map((x) => (
        <mesh key={x} position={[x, 4.4, 4.08]}>
          <boxGeometry args={[0.05, 8.2, 0.04]} />
          <meshBasicMaterial color="#85e7f7" transparent opacity={0.5} />
        </mesh>
      ))}
      {[1.8, 3.7, 5.6, 7.5].map((y) => (
        <mesh key={`band-${y}`} position={[0, y, 4.09]}>
          <boxGeometry args={[11.2, 0.05, 0.04]} />
          <meshBasicMaterial color="#79e3f2" transparent opacity={0.25} toneMapped={false} />
        </mesh>
      ))}
      {[-4.04, 4.04].map((z) => (
        <group key={z}>
          {[-3.4, 0, 3.4].map((x) => (
            <mesh key={`${z}-${x}`} position={[x, 5.7, z]}>
              <boxGeometry args={[1.8, 0.8, 0.05]} />
              <meshStandardMaterial color="#1a3040" roughness={0.3} metalness={0.4} emissive="#2e8fae" emissiveIntensity={0.3} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[0, 1.3, 4.2]}>
        <boxGeometry args={[3.6, 2.6, 0.15]} />
        <meshStandardMaterial color="#0c1a22" roughness={0.3} metalness={0.5} emissive="#2c7f95" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 2.8, 4.5]}>
        <boxGeometry args={[5.2, 0.18, 1.4]} />
        <meshBasicMaterial color="#9cefff" transparent opacity={0.75} toneMapped={false} />
      </mesh>
      <mesh position={[0, 7.9, 4.13]}>
        <boxGeometry args={[10.4, 0.9, 0.06]} />
        <meshBasicMaterial color="#123c4c" transparent opacity={0.9} />
      </mesh>
      <mesh position={[3.4, 9.8, -1.8]}>
        <cylinderGeometry args={[0.05, 0.08, 2.4, 6]} />
        <meshStandardMaterial color="#42525a" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[3.4, 11.05, -1.8]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color="#ff9a82" toneMapped={false} />
      </mesh>
      <mesh position={[0, 9.06, 0]}>
        <boxGeometry args={[11.8, 0.12, 8.3]} />
        <meshStandardMaterial color="#0c171d" roughness={0.7} />
      </mesh>
    </group>
  )
}

function SecurityHQ({ onSelect }: { onSelect: (selection: Selection) => void }) {
  return (
    <group position={[160, 0, -30]} scale={[1.1, 1.3, 1.1]}>
      <mesh position={[0, 4.5, 0]} castShadow>
        <boxGeometry args={[14, 9, 10]} />
        <meshStandardMaterial color="#191e2b" roughness={0.4} metalness={0.55} />
      </mesh>
      <mesh position={[0, 4.4, 5.04]}>
        <planeGeometry args={[12.8, 7.4]} />
        <meshStandardMaterial color="#17122a" roughness={0.2} metalness={0.4} emissive="#5f4fd0" emissiveIntensity={0.28} />
      </mesh>
      {[-5.4, -3.2, -1, 1.2, 3.4, 5.6].map((x) => (
        <mesh key={x} position={[x, 4.5, 5.12]}>
          <boxGeometry args={[0.06, 8.4, 0.06]} />
          <meshBasicMaterial color="#b8aaff" transparent opacity={0.35} />
        </mesh>
      ))}
      {[2.1, 4.2, 6.3].map((y) => (
        <mesh key={`floor-${y}`} position={[0, y, 5.1]}>
          <boxGeometry args={[12.9, 0.07, 0.05]} />
          <meshBasicMaterial color="#8d7dff" transparent opacity={0.4} toneMapped={false} />
        </mesh>
      ))}
      {[-4.6, -2.3, 0, 2.3, 4.6].map((x) =>
        [2.9, 5, 7.1].map((y) => (
          <mesh key={`${x}-${y}`} position={[x, y, 5.09]}>
            <boxGeometry args={[1.15, 0.6, 0.04]} />
            <meshStandardMaterial color="#27203f" roughness={0.25} metalness={0.4} emissive="#7c68ff" emissiveIntensity={0.35} />
          </mesh>
        )),
      )}
      <mesh position={[0, 6.6, 5.2]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.5, 0.07, 6, 40]} />
        <meshBasicMaterial color="#cabfff" toneMapped={false} transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, 6.6, 5.23]}>
        <circleGeometry args={[1.3, 6]} />
        <meshBasicMaterial color="#4336a8" toneMapped={false} transparent opacity={0.4} />
      </mesh>
      {[-7.8, 7.8].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 3.4, 0]}>
            <boxGeometry args={[1.5, 6.8, 1.5]} />
            <meshStandardMaterial color="#161b27" roughness={0.35} metalness={0.6} />
          </mesh>
          <mesh position={[0, 5.2, 0.78]}>
            <boxGeometry args={[0.7, 1.6, 0.04]} />
            <meshBasicMaterial color="#b0a0ff" transparent opacity={0.7} toneMapped={false} />
          </mesh>
          <mesh position={[0, 7.1, 0]}>
            <cylinderGeometry args={[0.05, 0.08, 1.4, 6]} />
            <meshStandardMaterial color="#8a9298" metalness={0.7} roughness={0.4} />
          </mesh>
          <mesh position={[0, 7.85, 0]}>
            <sphereGeometry args={[0.08, 6, 6]} />
            <meshBasicMaterial color="#ff8b8b" toneMapped={false} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 9.1, 0]} castShadow>
        <boxGeometry args={[14.3, 0.16, 10.3]} />
        <meshStandardMaterial color="#0c1118" roughness={0.7} />
      </mesh>
      <mesh position={[-3.8, 10.1, -1.4]}>
        <cylinderGeometry args={[0.07, 0.12, 2.1, 6]} />
        <meshStandardMaterial color="#4d5560" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[-3.8, 11.2, -1.4]}>
        <sphereGeometry args={[0.11, 8, 8]} />
        <meshBasicMaterial color="#ff8b8b" toneMapped={false} />
      </mesh>
      <mesh position={[3.7, 10.05, 1.5]} rotation={[-0.5, 0.7, 0]}>
        <cylinderGeometry args={[0.85, 0.2, 0.25, 16]} />
        <meshStandardMaterial color="#767f8c" metalness={0.65} roughness={0.35} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.1, 6.4]}>
        <boxGeometry args={[14.6, 0.2, 2.6]} />
        <meshStandardMaterial color="#111820" metalness={0.3} roughness={0.7} />
      </mesh>
    </group>
  )
}

function PtzCamera({
  position,
  rotation = 0,
  beam = false,
}: {
  position: [number, number, number]
  rotation?: number
  beam?: boolean
}) {
  const lens = useMemo(() => new THREE.Vector3(0, 6.95, 0.7), [])
  const target = useMemo(() => new THREE.Vector3(Math.cos(rotation) * 7, 0, Math.sin(rotation) * 7 + 0.7), [rotation])

  return (
    <group position={position}>
      <mesh position={[0, 3.25, 0]}>
        <cylinderGeometry args={[0.07, 0.12, 6.5, 6]} />
        <meshStandardMaterial color="#252d3a" metalness={0.65} roughness={0.45} />
      </mesh>
      <group position={[0, 6.7, 0]} rotation={[0.5, rotation, 0]}>
        <mesh>
          <boxGeometry args={[0.7, 0.5, 1.05]} />
          <meshStandardMaterial color="#171d27" metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.62]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.25, 0.28, 12]} />
          <meshStandardMaterial color="#0b1117" metalness={0.6} roughness={0.25} />
        </mesh>
        <mesh position={[0.28, 0.18, 0.35]}>
          <sphereGeometry args={[0.055, 8, 8]} />
          <meshBasicMaterial color="#ff6b6b" toneMapped={false} />
        </mesh>
      </group>
      {beam && <Line points={[lens.toArray(), target.toArray()]} color="#ff7c8a" transparent opacity={0.16} lineWidth={0.7} />}
    </group>
  )
}

function Drone({ center, radius, height, speed, phase }: { center: [number, number]; radius: number; height: number; speed: number; phase: number }) {
  const group = useRef<THREE.Group>(null)
  const rotors = useRef<THREE.Group[]>([])
  useFrame(({ clock }) => {
    if (!group.current) return
    const t = clock.elapsedTime * speed + phase
    group.current.position.set(center[0] + Math.cos(t) * radius, height + Math.sin(t * 2.1) * 0.45, center[1] + Math.sin(t) * radius)
    group.current.rotation.y = -t
    rotors.current.forEach((rotor) => {
      if (rotor) rotor.rotation.y = clock.elapsedTime * 8
    })
  })

  return (
    <group ref={group} position={[center[0] + radius, height, center[1]]}>
      <RoundedBox args={[1.5, 0.32, 1.2]} radius={0.14} smoothness={2}>
        <meshStandardMaterial color="#252b39" roughness={0.35} metalness={0.7} />
      </RoundedBox>
      {[
        [-0.8, -0.72],
        [-0.8, 0.72],
        [0.8, -0.72],
        [0.8, 0.72],
      ].map(([x, z], index) => (
        <group key={index} position={[x, 0.12, z]}>
          <mesh rotation={[0, Math.atan2(z, x), 0]} position={[x * -0.28, 0, z * -0.28]}>
            <boxGeometry args={[0.7, 0.06, 0.08]} />
            <meshStandardMaterial color="#333b4b" metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.32, 0.025, 5, 20]} />
            <meshBasicMaterial color="#6e7a91" transparent opacity={0.6} />
          </mesh>
          <group ref={(el) => { if (el) rotors.current[index] = el }} position={[0, 0.14, 0]}>
            <mesh rotation={[0, 0, 0]}>
              <boxGeometry args={[0.6, 0.012, 0.035]} />
              <meshBasicMaterial color="#aeb9cc" transparent opacity={0.65} />
            </mesh>
            <mesh rotation={[0, Math.PI / 2, 0]}>
              <boxGeometry args={[0.6, 0.012, 0.035]} />
              <meshBasicMaterial color="#aeb9cc" transparent opacity={0.65} />
            </mesh>
          </group>
        </group>
      ))}
      <mesh position={[0, -0.23, 0.25]}>
        <sphereGeometry args={[0.18, 10, 10]} />
        <meshStandardMaterial color="#11151c" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.23, 0.4]}>
        <circleGeometry args={[0.08, 10]} />
        <meshBasicMaterial color="#ff6b6b" toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.15, -0.45]}>
        <sphereGeometry args={[0.055, 8, 8]} />
        <meshBasicMaterial color="#7ff0ff" toneMapped={false} />
      </mesh>
      <mesh position={[0, -2.6, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[1.6, 5, 20, 1, true]} />
        <meshBasicMaterial color="#a395ff" transparent opacity={0.035} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  )
}

function LightsaberEgg({ position }: { position: [number, number, number] }) {
  const [active, setActive] = useState(false)
  const [hovered, setHovered] = useState(false)
  const blade = useRef<THREE.Group>(null)
  const light = useRef<THREE.PointLight>(null)
  useCursor(hovered)

  useFrame(({ clock }, delta) => {
    if (!blade.current) return
    const target = active ? 1 : 0.001
    const next = THREE.MathUtils.damp(blade.current.scale.y, target, 18, delta)
    const flicker = active ? 0.97 + Math.sin(clock.elapsedTime * 38) * 0.018 + Math.sin(clock.elapsedTime * 11) * 0.012 : 1
    blade.current.scale.set(flicker, next, flicker)
    if (light.current) light.current.intensity = 22 * next * flicker
  })

  return (
    <group position={position} scale={0.72}>
      {/* Peana de exhibición */}
      <mesh position={[0, 0.035, 0]}>
        <boxGeometry args={[0.62, 0.07, 0.48]} />
        <meshStandardMaterial color="#1b262c" metalness={0.6} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.075, 0.18]}>
        <boxGeometry args={[0.42, 0.018, 0.05]} />
        <meshBasicMaterial color="#77d7e7" transparent opacity={0.65} toneMapped={false} />
      </mesh>
      {[-0.18, 0.18].map((x) => (
        <mesh key={x} position={[x, 0.22, 0]} rotation={[0, 0, x < 0 ? -0.22 : 0.22]}>
          <boxGeometry args={[0.035, 0.28, 0.18]} />
          <meshStandardMaterial color="#32434b" metalness={0.65} roughness={0.4} />
        </mesh>
      ))}

      {/* Empuñadura */}
      <mesh position={[0, 0.37, 0]}>
        <cylinderGeometry args={[0.062, 0.075, 0.54, 14]} />
        <meshStandardMaterial color="#b7c2c7" metalness={0.85} roughness={0.22} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.083, 0.083, 0.045, 14]} />
        <meshStandardMaterial color="#7e8b91" metalness={0.8} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.077, 0.081, 0.13, 14]} />
        <meshStandardMaterial color="#10161a" roughness={0.65} metalness={0.35} />
      </mesh>
      {[0.13, 0.18, 0.23].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.081, 0.011, 6, 20]} />
          <meshStandardMaterial color="#8e9da3" metalness={0.7} roughness={0.35} />
        </mesh>
      ))}
      <mesh position={[0, 0.36, 0]}>
        <cylinderGeometry args={[0.072, 0.072, 0.06, 14]} />
        <meshStandardMaterial color="#20282d" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[0.075, 0.47, 0.045]}>
        <boxGeometry args={[0.05, 0.11, 0.04]} />
        <meshStandardMaterial color="#1a2329" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0.1, 0.49, 0.055]}>
        <boxGeometry args={[0.018, 0.03, 0.012]} />
        <meshBasicMaterial color={active ? '#ff6a5f' : '#8e3a34'} toneMapped={false} />
      </mesh>
      <mesh position={[-0.06, 0.53, 0.06]}>
        <boxGeometry args={[0.026, 0.026, 0.02]} />
        <meshBasicMaterial color="#79d7ee" toneMapped={false} transparent opacity={0.9} />
      </mesh>

      {/* Emisor con aletas */}
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.112, 0.076, 0.14, 14]} />
        <meshStandardMaterial color="#26333a" metalness={0.78} roughness={0.28} />
      </mesh>
      {[0, 1, 2].map((index) => {
        const angle = (index / 3) * Math.PI * 2
        return (
          <mesh
            key={index}
            position={[Math.cos(angle) * 0.088, 0.7, Math.sin(angle) * 0.088]}
            rotation={[0, -angle, 0.16]}
          >
            <boxGeometry args={[0.028, 0.18, 0.055]} />
            <meshStandardMaterial color="#9ba8ae" metalness={0.85} roughness={0.22} />
          </mesh>
        )
      })}
      <mesh position={[0, 0.725, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.106, 0.017, 6, 26]} />
        <meshStandardMaterial color="#b6c1c6" metalness={0.85} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.735, 0]}>
        <cylinderGeometry args={[0.075, 0.09, 0.035, 14]} />
        <meshBasicMaterial color={active ? '#bdefff' : '#25343b'} toneMapped={false} />
      </mesh>

      {/* Hoja */}
      <group ref={blade} position={[0, 0.74, 0]} scale={[1, 0.001, 1]}>
        <mesh position={[0, 2.2, 0]}>
          <cylinderGeometry args={[0.023, 0.026, 4.3, 10]} />
          <meshBasicMaterial color="#f6fdff" toneMapped={false} />
        </mesh>
        <mesh position={[0, 2.2, 0]}>
          <cylinderGeometry args={[0.058, 0.063, 4.3, 12]} />
          <meshBasicMaterial color="#7bcfff" toneMapped={false} transparent opacity={0.8} />
        </mesh>
        <mesh position={[0, 2.2, 0]}>
          <cylinderGeometry args={[0.17, 0.17, 4.3, 12]} />
          <meshBasicMaterial color="#5cb9ef" toneMapped={false} transparent opacity={0.1} depthWrite={false} />
        </mesh>
        <mesh position={[0, 4.37, 0]}>
          <coneGeometry args={[0.062, 0.24, 12]} />
          <meshBasicMaterial color="#c8f4ff" toneMapped={false} />
        </mesh>
      </group>
      <pointLight ref={light} position={[0, 2.2, 0]} color="#7ed6ff" intensity={0} distance={18} decay={2} />

      <mesh
        position={[0, 0.9, 0]}
        onPointerOver={(event) => {
          event.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={() => setHovered(false)}
        onClick={(event) => {
          event.stopPropagation()
          setActive((value) => !value)
        }}
      >
        <sphereGeometry args={[1.15, 12, 12]} />
        <meshBasicMaterial transparent opacity={0.001} depthWrite={false} />
      </mesh>

      {active && (
        <Html position={[0, 5.9, 0]} center zIndexRange={[18, 0]} style={{ pointerEvents: 'none' }}>
          <div className="easter-tip">Que la Fuerza te acompañe.</div>
        </Html>
      )}
    </group>
  )
}

function XWingModel() {
  return (
    <group>
      {/* Fuselaje principal */}
      <mesh position={[0.15, 0.82, 0]}>
        <boxGeometry args={[3.2, 0.38, 0.62]} />
        <meshStandardMaterial color="#c9d2d5" roughness={0.4} metalness={0.55} />
      </mesh>
      <mesh position={[-1.42, 0.82, 0]}>
        <boxGeometry args={[1.1, 0.32, 0.54]} />
        <meshStandardMaterial color="#aeb9bd" roughness={0.45} metalness={0.5} />
      </mesh>
      <mesh position={[2.05, 0.82, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.29, 1.25, 12]} />
        <meshStandardMaterial color="#d8e0e2" roughness={0.38} metalness={0.5} />
      </mesh>
      <mesh position={[2.68, 0.82, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.16, 0.18, 10]} />
        <meshStandardMaterial color="#7d898e" roughness={0.35} metalness={0.7} />
      </mesh>
      <mesh position={[0.15, 0.82, 0.32]}>
        <boxGeometry args={[2.9, 0.06, 0.02]} />
        <meshStandardMaterial color="#8a969a" roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[0.15, 0.82, -0.32]}>
        <boxGeometry args={[2.9, 0.06, 0.02]} />
        <meshStandardMaterial color="#8a969a" roughness={0.4} metalness={0.5} />
      </mesh>

      {/* Cabina y marcos */}
      <mesh position={[0.72, 1.06, 0]}>
        <boxGeometry args={[0.92, 0.3, 0.56]} />
        <meshStandardMaterial color="#17303d" roughness={0.12} metalness={0.55} emissive="#2b6a82" emissiveIntensity={0.35} />
      </mesh>
      {[0.32, 0.72, 1.12].map((x) => (
        <mesh key={x} position={[x, 1.06, 0]}>
          <boxGeometry args={[0.035, 0.34, 0.6]} />
          <meshStandardMaterial color="#9eaaae" roughness={0.4} metalness={0.6} />
        </mesh>
      ))}
      <mesh position={[0.72, 1.22, 0]}>
        <boxGeometry args={[0.94, 0.04, 0.6]} />
        <meshStandardMaterial color="#b7c2c6" roughness={0.4} metalness={0.55} />
      </mesh>

      {/* Astromecánico R2 */}
      <mesh position={[-0.32, 1.04, 0]}>
        <cylinderGeometry args={[0.19, 0.21, 0.32, 14]} />
        <meshStandardMaterial color="#c8d3d7" roughness={0.35} metalness={0.5} />
      </mesh>
      <mesh position={[-0.32, 1.22, 0]}>
        <sphereGeometry args={[0.19, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#b9c6cb" roughness={0.32} metalness={0.55} />
      </mesh>
      <mesh position={[-0.32, 1.2, 0.18]}>
        <cylinderGeometry args={[0.055, 0.055, 0.025, 10]} />
        <meshStandardMaterial color="#2c6ea0" roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[-0.39, 1.07, 0.19]}>
        <boxGeometry args={[0.09, 0.09, 0.02]} />
        <meshBasicMaterial color="#ff5e4d" toneMapped={false} />
      </mesh>
      {[-0.07, 0.07].map((offset) => (
        <mesh key={offset} position={[-0.32 + offset, 1.1, 0.19]}>
          <boxGeometry args={[0.05, 0.08, 0.02]} />
          <meshStandardMaterial color="#2e6b9e" roughness={0.35} metalness={0.45} />
        </mesh>
      ))}

      {/* Cuatro alas en S-foil */}
      {[-1, 1].map((zSign) =>
        [-1, 1].map((ySign) => (
          <group
            key={`${zSign}-${ySign}`}
            position={[-0.48, 0.84, zSign * 0.42]}
            rotation={[zSign * ySign * 0.58, -zSign * 0.34, 0]}
          >
            {/* Panel alar */}
            <mesh position={[0.5, 0, zSign * 0.55]}>
              <boxGeometry args={[2.72, 0.05, 0.86]} />
              <meshStandardMaterial color="#c6d0d3" roughness={0.44} metalness={0.42} />
            </mesh>
            <mesh position={[0.5, 0.035, zSign * 0.55]}>
              <boxGeometry args={[2.3, 0.02, 0.7]} />
              <meshStandardMaterial color="#acb8bc" roughness={0.5} metalness={0.35} />
            </mesh>
            <mesh position={[0.22, 0.045, zSign * 0.6]}>
              <boxGeometry args={[0.9, 0.02, 0.34]} />
              <meshStandardMaterial color="#a84f3d" roughness={0.55} metalness={0.25} />
            </mesh>
            <mesh position={[-0.68, 0.045, zSign * 0.55]}>
              <boxGeometry args={[0.3, 0.02, 0.32]} />
              <meshStandardMaterial color="#9d4a3b" roughness={0.55} metalness={0.3} />
            </mesh>

            {/* Motor en la raíz */}
            <mesh position={[-0.1, 0.02, zSign * 0.16]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.18, 0.2, 1.05, 12]} />
              <meshStandardMaterial color="#33434b" roughness={0.35} metalness={0.65} />
            </mesh>
            <mesh position={[-0.1, 0.02, zSign * 0.16]} rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[0.19, 0.025, 6, 18]} />
              <meshStandardMaterial color="#95a3a8" roughness={0.3} metalness={0.75} />
            </mesh>
            <mesh position={[-0.64, 0.02, zSign * 0.16]} rotation={[0, 0, Math.PI / 2]}>
              <circleGeometry args={[0.15, 12]} />
              <meshBasicMaterial color="#ff9a55" toneMapped={false} />
            </mesh>
            <mesh position={[0.52, 0.02, zSign * 0.16]} rotation={[0, 0, -Math.PI / 2]}>
              <circleGeometry args={[0.12, 12]} />
              <meshBasicMaterial color="#f4a277" toneMapped={false} transparent opacity={0.85} />
            </mesh>

            {/* Cañón de punta alar */}
            <mesh position={[1.48, 0.02, zSign * 0.94]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.032, 0.048, 1.9, 8]} />
              <meshStandardMaterial color="#46555d" roughness={0.35} metalness={0.7} />
            </mesh>
            <mesh position={[2.37, 0.02, zSign * 0.94]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.055, 0.055, 0.12, 8]} />
              <meshStandardMaterial color="#98a5aa" roughness={0.3} metalness={0.7} />
            </mesh>
            <mesh position={[2.48, 0.02, zSign * 0.94]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.011, 0.011, 0.24, 5]} />
              <meshBasicMaterial color="#ffd4a6" toneMapped={false} />
            </mesh>
            <mesh position={[0.95, 0.02, zSign * 0.94]}>
              <boxGeometry args={[0.5, 0.08, 0.09]} />
              <meshStandardMaterial color="#b6c1c5" roughness={0.4} metalness={0.45} />
            </mesh>
            <mesh position={[1.6, 0.11, zSign * 0.94]}>
              <boxGeometry args={[1.2, 0.05, 0.05]} />
              <meshStandardMaterial color="#89969b" roughness={0.45} metalness={0.45} />
            </mesh>
          </group>
        )),
      )}

      {/* Aletas y detalle trasero */}
      <mesh position={[-1.82, 1.02, 0]}>
        <boxGeometry args={[0.6, 0.5, 0.05]} />
        <meshStandardMaterial color="#98a5aa" roughness={0.45} metalness={0.5} />
      </mesh>
      <mesh position={[-1.98, 0.82, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.17, 0.2, 0.18, 12]} />
        <meshStandardMaterial color="#5d6b72" roughness={0.35} metalness={0.7} />
      </mesh>
      <mesh position={[-2.08, 0.82, 0]} rotation={[0, 0, Math.PI / 2]}>
        <circleGeometry args={[0.13, 12]} />
        <meshBasicMaterial color="#ffb47a" toneMapped={false} />
      </mesh>
    </group>
  )
}

function XWingEgg({ position }: { position: [number, number, number] }) {
  const [flying, setFlying] = useState(false)
  const [hovered, setHovered] = useState(false)
  const group = useRef<THREE.Group>(null)
  const started = useRef(0)
  useCursor(hovered)

  useFrame(({ clock }, delta) => {
    if (!group.current) return
    if (!flying) {
      group.current.position.x = THREE.MathUtils.damp(group.current.position.x, 0, 5, delta)
      group.current.position.z = THREE.MathUtils.damp(group.current.position.z, 0, 5, delta)
      group.current.position.y = THREE.MathUtils.damp(group.current.position.y, 0, 5, delta)
      group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, 0.35, 5, delta)
      group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, 0, 5, delta)
      group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, 0, 5, delta)
      group.current.position.y = Math.sin(clock.elapsedTime * 1.4) * 0.035
      started.current = 0
      return
    }

    if (started.current === 0) started.current = clock.elapsedTime
    const t = clock.elapsedTime - started.current
    if (t > 12) {
      setFlying(false)
      return
    }
    const height = Math.min(2 + t * 4.8, 32)
    const orbit = Math.min(t * 0.8, 8)
    group.current.position.set(Math.sin(t * 0.65) * (4 + orbit), height, Math.cos(t * 0.65) * (4 + orbit) - 4)
    group.current.rotation.y = t * 0.85
    group.current.rotation.x = Math.sin(t * 0.85) * 0.16
    group.current.rotation.z = Math.sin(t * 0.8) * 0.24
  })

  return (
    <group position={position}>
      {/* Plataforma de aterrizaje */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[4.1, 48]} />
        <meshStandardMaterial color="#202b31" roughness={0.8} metalness={0.25} />
      </mesh>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.82, 4.08, 48]} />
        <meshBasicMaterial color="#7fb2c0" transparent opacity={0.55} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.55, 2.62, 40]} />
        <meshBasicMaterial color="#b0a0ff" transparent opacity={0.35} toneMapped={false} />
      </mesh>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => {
        const angle = (index / 8) * Math.PI * 2
        return (
          <mesh key={index} position={[Math.cos(angle) * 3.55, 0.045, Math.sin(angle) * 3.55]}>
            <sphereGeometry args={[0.07, 6, 6]} />
            <meshBasicMaterial color="#c9f2ff" toneMapped={false} />
          </mesh>
        )
      })}

      <group
        ref={group}
        rotation={[0, 0.35, 0]}
        scale={1.65}
        onPointerOver={(event) => {
          event.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={() => setHovered(false)}
        onClick={(event) => {
          event.stopPropagation()
          if (!flying) {
            started.current = 0
            setFlying(true)
          }
        }}
      >
        <XWingModel />
        <mesh position={[0, 0.85, 0]}>
          <sphereGeometry args={[3.6, 12, 12]} />
          <meshBasicMaterial transparent opacity={0.001} depthWrite={false} />
        </mesh>
      </group>

      {flying && (
        <Html position={[0, 7.5, 0]} center zIndexRange={[18, 0]} style={{ pointerEvents: 'none' }}>
          <div className="easter-tip">Despegue autorizado.</div>
        </Html>
      )}
    </group>
  )
}

const BUS_STOPS: BusStopSpec[] = [
  { x: 7, z: 12.7, rotation: Math.PI },
  { x: -8, z: -12.7, rotation: 0 },
  { x: -68, z: 12.7, rotation: Math.PI },
  { x: -40, z: -12.7, rotation: 0 },
  { x: 40, z: 12.7, rotation: Math.PI },
  { x: 68, z: -12.7, rotation: 0 },
  { x: -120, z: -12.7, rotation: 0 },
  { x: -160, z: 12.7, rotation: Math.PI },
  { x: -80, z: -12.7, rotation: 0 },
  { x: 80, z: 12.7, rotation: Math.PI },
  { x: 120, z: -12.7, rotation: 0 },
  { x: 160, z: -12.7, rotation: 0 },
]

export function Landmarks({ onSelect }: { onSelect: (selection: Selection) => void }) {
  return (
    <group>
      <MunicipalBuilding onSelect={onSelect} />
      <LightsaberEgg position={[-17.4, 9.13, -21.5]} />
      <InstancedBusStops stops={BUS_STOPS} />
      <LprArch x={-23.5} />
      <LprArch x={23.5} />
      <LprArch x={-160} />
      <LprArch x={-80} />
      <LprArch x={80} />
      {AVENUE_SIGNALS.map((x, index) => (
        <TrafficLight key={x} position={[x + (index % 2 === 0 ? 4.5 : -4.5), 0, index % 2 === 0 ? 6.9 : -6.9]} />
      ))}
      {[
        [-100, 48],
        [100, 48],
        [-100, -48],
        [100, -48],
        [-140, 78],
        [140, 78],
      ].map(([x, z], index) => (
        <TrafficLight
          key={`side-${x}-${z}`}
          position={[x + (index % 2 === 0 ? 4.5 : -4.5), 0, z + (z > 0 ? -6.9 : 6.9)]}
        />
      ))}

      <SecurityHQ onSelect={onSelect} />
      <XWingEgg position={[157, 12.0, -28]} />
      <LprArch x={120} color="#b0a0ff" />
      <PtzCamera position={[148, 0, -44]} rotation={2.1} beam />
      <PtzCamera position={[174, 0, -42]} rotation={2.8} />
      <PtzCamera position={[176, 0, 10]} rotation={4.1} />
      <PtzCamera position={[146, 0, 24]} rotation={0.8} beam />
      <PtzCamera position={[170, 0, 40]} rotation={3.1} beam />
      <PtzCamera position={[185, 0, 118]} rotation={4.4} />
      <PtzCamera position={[200, 0, -90]} rotation={2.3} />
      <PtzCamera position={[110, 0, -90]} rotation={1.1} beam />
      <PtzCamera position={[96, 0, 62]} rotation={1.7} />
      <PtzCamera position={[220, 0, 58]} rotation={4.9} beam />
      <PtzCamera position={[95, 0, -38]} rotation={1.3} beam />
      <PtzCamera position={[230, 0, 18]} rotation={3.6} />
      <PtzCamera position={[130, 0, 118]} rotation={5.2} />
      <PtzCamera position={[226, 0, -36]} rotation={2.7} beam />
      <Drone center={[160, -20]} radius={11} height={16} speed={0.18} phase={0} />
      <Drone center={[146, 6]} radius={8} height={20} speed={-0.13} phase={2.4} />
      <Drone center={[150, 60]} radius={14} height={18} speed={0.11} phase={1.2} />
      <Drone center={[110, -70]} radius={10} height={22} speed={-0.12} phase={4.1} />
      <Drone center={[196, 20]} radius={12} height={17} speed={-0.16} phase={3.1} />
      <Drone center={[96, 108]} radius={9} height={24} speed={0.15} phase={5.2} />
      <Drone center={[220, -38]} radius={11} height={19} speed={-0.1} phase={1.8} />
      <Drone center={[182, 82]} radius={8} height={21} speed={0.13} phase={3.7} />
      <LprArch x={160} color="#b0a0ff" />
    </group>
  )
}
