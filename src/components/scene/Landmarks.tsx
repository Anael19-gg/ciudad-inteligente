import { useMemo, useRef, useState } from 'react'
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
      {[-7.4, 7.4].map((z) => (
        <mesh key={z} position={[0, 3.1, z]}>
          <boxGeometry args={[0.34, 6.2, 0.34]} />
          <meshStandardMaterial color="#2b3740" metalness={0.6} roughness={0.45} />
        </mesh>
      ))}
      <mesh position={[0, 6.1, 0]}>
        <boxGeometry args={[0.42, 0.42, 15.1]} />
        <meshStandardMaterial color="#2b3740" metalness={0.6} roughness={0.45} />
      </mesh>
      <mesh position={[0, 5.83, 0]}>
        <boxGeometry args={[0.1, 0.1, 13.4]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh position={[0, 3.1, 0]} rotation={[0, 0, 0]}>
        <planeGeometry args={[13.2, 5.9]} />
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

function BusStop({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 1.75, 0]}>
        <boxGeometry args={[0.12, 3.5, 0.12]} />
        <meshStandardMaterial color="#2b3942" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[3.3, 1.75, 0]}>
        <boxGeometry args={[0.12, 3.5, 0.12]} />
        <meshStandardMaterial color="#2b3942" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[1.65, 3.5, 0]}>
        <boxGeometry args={[3.8, 0.14, 2.1]} />
        <meshStandardMaterial color="#141e24" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[1.65, 3.58, 0]}>
        <boxGeometry args={[3.6, 0.03, 1.9]} />
        <meshBasicMaterial color="#79e3f2" transparent opacity={0.6} toneMapped={false} />
      </mesh>
      <mesh position={[1.65, 1.5, -0.95]}>
        <planeGeometry args={[3.3, 2.5]} />
        <meshPhysicalMaterial color="#7bb9c9" transparent opacity={0.14} roughness={0.1} metalness={0.1} />
      </mesh>
      <mesh position={[1.65, 0.55, -0.4]}>
        <boxGeometry args={[2.6, 0.12, 0.55]} />
        <meshStandardMaterial color="#27343b" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0.25, 1.65, -0.75]}>
        <boxGeometry args={[0.6, 1.1, 0.06]} />
        <meshBasicMaterial color="#0c2029" />
      </mesh>
      <mesh position={[0.25, 1.65, -0.71]}>
        <planeGeometry args={[0.46, 0.9]} />
        <meshBasicMaterial color="#74e0f2" transparent opacity={0.7} />
      </mesh>
      <mesh position={[3.9, 2.6, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 5.2, 6]} />
        <meshStandardMaterial color="#3b4a52" metalness={0.7} roughness={0.4} />
      </mesh>
      {[4.9, 5.1].map((y, index) => (
        <mesh key={y} position={[3.9, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.26 + index * 0.12, 0.012, 6, 28]} />
          <meshBasicMaterial color="#7ff0ff" toneMapped={false} transparent opacity={index === 0 ? 0.85 : 0.4} />
        </mesh>
      ))}
      <mesh position={[3.9, 5.2, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#b8fbff" toneMapped={false} />
      </mesh>
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
      <mesh position={[0, 4.5, 0]}>
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
    <group position={[45, 0, -22]}>
      <mesh position={[0, 4.5, 0]}>
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
      <mesh position={[0, 9.1, 0]}>
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
  const rotors = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (!group.current) return
    const t = clock.elapsedTime * speed + phase
    group.current.position.set(center[0] + Math.cos(t) * radius, height + Math.sin(t * 2.1) * 0.45, center[1] + Math.sin(t) * radius)
    group.current.rotation.y = -t + Math.PI / 2
    if (rotors.current) rotors.current.rotation.y = clock.elapsedTime * 8
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
          <mesh position={[0, 0.12, 0]}>
            <torusGeometry args={[0.32, 0.025, 5, 20]} />
            <meshBasicMaterial color="#6e7a91" transparent opacity={0.6} />
          </mesh>
          <group ref={index === 0 ? rotors : undefined} position={[0, 0.14, 0]}>
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

  useFrame((_, delta) => {
    if (!blade.current) return
    const target = active ? 1 : 0.001
    const next = THREE.MathUtils.damp(blade.current.scale.y, target, 18, delta)
    blade.current.scale.y = next
    if (light.current) light.current.intensity = 20 * next
  })

  return (
    <group position={position}>
      {/* Peana pequeña de exhibición */}
      <mesh position={[0, 0.035, 0]}>
        <boxGeometry args={[0.52, 0.07, 0.4]} />
        <meshStandardMaterial color="#1b262c" metalness={0.6} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.075, 0.145]}>
        <boxGeometry args={[0.34, 0.018, 0.05]} />
        <meshBasicMaterial color="#77d7e7" transparent opacity={0.6} />
      </mesh>

      {/* Empuñadura */}
      <mesh position={[0, 0.37, 0]}>
        <cylinderGeometry args={[0.062, 0.075, 0.54, 12]} />
        <meshStandardMaterial color="#b7c2c7" metalness={0.85} roughness={0.22} />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.077, 0.077, 0.2, 12]} />
        <meshStandardMaterial color="#10161a" roughness={0.65} metalness={0.35} />
      </mesh>
      {[0.14, 0.19, 0.24].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.078, 0.012, 6, 20]} />
          <meshStandardMaterial color="#8e9da3" metalness={0.7} roughness={0.35} />
        </mesh>
      ))}
      <mesh position={[0, 0.64, 0]}>
        <cylinderGeometry args={[0.11, 0.075, 0.13, 12]} />
        <meshStandardMaterial color="#26333a" metalness={0.75} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.71, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.105, 0.018, 6, 24]} />
        <meshStandardMaterial color="#a9b5ba" metalness={0.8} roughness={0.22} />
      </mesh>
      <mesh position={[0.075, 0.47, 0.045]}>
        <boxGeometry args={[0.045, 0.08, 0.03]} />
        <meshBasicMaterial color={active ? '#ff5c52' : '#7c3530'} toneMapped={false} />
      </mesh>

      {/* Hoja */}
      <group ref={blade} position={[0, 0.72, 0]} scale={[1, 0.001, 1]}>
        <mesh position={[0, 2.2, 0]}>
          <cylinderGeometry args={[0.022, 0.024, 4.3, 8]} />
          <meshBasicMaterial color="#f6fdff" toneMapped={false} />
        </mesh>
        <mesh position={[0, 2.2, 0]}>
          <cylinderGeometry args={[0.055, 0.06, 4.3, 10]} />
          <meshBasicMaterial color="#7bcfff" toneMapped={false} transparent opacity={0.8} />
        </mesh>
        <mesh position={[0, 2.2, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 4.3, 10]} />
          <meshBasicMaterial color="#5cb9ef" toneMapped={false} transparent opacity={0.1} depthWrite={false} />
        </mesh>
        <mesh position={[0, 4.37, 0]}>
          <coneGeometry args={[0.06, 0.22, 10]} />
          <meshBasicMaterial color="#c8f4ff" toneMapped={false} />
        </mesh>
      </group>
      <pointLight ref={light} position={[0, 2.2, 0]} color="#7ed6ff" intensity={0} distance={16} decay={2} />

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
      <mesh position={[0.2, 0.72, 0]}>
        <boxGeometry args={[3.1, 0.4, 0.58]} />
        <meshStandardMaterial color="#c8d1d4" roughness={0.42} metalness={0.5} />
      </mesh>
      <mesh position={[2.0, 0.72, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.32, 0.95, 8]} />
        <meshStandardMaterial color="#d6dee0" roughness={0.4} metalness={0.45} />
      </mesh>
      <mesh position={[0.65, 0.98, 0]}>
        <boxGeometry args={[0.85, 0.34, 0.62]} />
        <meshStandardMaterial color="#101b23" roughness={0.15} metalness={0.55} emissive="#284654" emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[-0.85, 0.98, 0.16]}>
        <sphereGeometry args={[0.18, 10, 10]} />
        <meshStandardMaterial color="#9fb1b8" roughness={0.4} metalness={0.4} />
      </mesh>

      {[-1, 1].map((zSign) =>
        [-1, 1].map((ySign) => (
          <group key={`${zSign}-${ySign}`} position={[-0.55, 0.72 + ySign * 0.12, zSign * 0.85]} rotation={[0, zSign * 0.72, ySign * 0.08]}>
            <mesh>
              <boxGeometry args={[2.15, 0.055, 0.55]} />
              <meshStandardMaterial color="#cbd4d6" roughness={0.45} metalness={0.4} />
            </mesh>
            <mesh position={[0.35, 0.035, 0]}>
              <boxGeometry args={[0.65, 0.02, 0.4]} />
              <meshStandardMaterial color="#a84f3d" roughness={0.5} metalness={0.3} />
            </mesh>
            <mesh position={[1.1, 0.035, 0]}>
              <boxGeometry args={[0.06, 0.06, 0.06]} />
              <meshBasicMaterial color="#d9e5e8" toneMapped={false} />
            </mesh>
            <mesh position={[-0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.16, 0.18, 0.62, 10]} />
              <meshStandardMaterial color="#26343b" roughness={0.4} metalness={0.6} />
            </mesh>
            <mesh position={[-0.52, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
              <circleGeometry args={[0.12, 10]} />
              <meshBasicMaterial color="#e59359" toneMapped={false} />
            </mesh>
          </group>
        )),
      )}
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
      started.current = 0
      return
    }

    if (started.current === 0) started.current = clock.elapsedTime
    const t = clock.elapsedTime - started.current
    if (t > 11) {
      setFlying(false)
      return
    }
    const height = Math.min(2 + t * 4.8, 30)
    const orbit = Math.min(t * 0.8, 8)
    group.current.position.set(Math.sin(t * 0.65) * (4 + orbit), height, Math.cos(t * 0.65) * (4 + orbit) - 4)
    group.current.rotation.y = t * 0.85
    group.current.rotation.z = Math.sin(t * 0.8) * 0.22
  })

  return (
    <group position={position}>
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.6, 40]} />
        <meshStandardMaterial color="#202b31" roughness={0.8} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.35, 3.6, 40]} />
        <meshBasicMaterial color="#7fb2c0" transparent opacity={0.5} />
      </mesh>

      <group
        ref={group}
        rotation={[0, 0.35, 0]}
        scale={1.45}
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
        <mesh position={[0, 0.7, 0]}>
          <sphereGeometry args={[2.7, 12, 12]} />
          <meshBasicMaterial transparent opacity={0.001} depthWrite={false} />
        </mesh>
      </group>
    </group>
  )
}

export function Landmarks({ onSelect }: { onSelect: (selection: Selection) => void }) {
  return (
    <group>
      <MunicipalBuilding onSelect={onSelect} />
      <LightsaberEgg position={[-17.4, 9.13, -21.5]} />
      <LprArch x={-23.5} />
      <LprArch x={23.5} />
      <BusStop position={[7, 0, 8.6]} rotation={Math.PI} />
      <BusStop position={[-8, 0, -8.6]} rotation={0} />
      <BusStop position={[-160, 0, 8.6]} rotation={Math.PI} />
      <BusStop position={[-80, 0, -8.6]} rotation={0} />
      <BusStop position={[80, 0, 8.6]} rotation={Math.PI} />
      <BusStop position={[160, 0, -8.6]} rotation={0} />
      <LprArch x={-100} />
      <LprArch x={100} />
      {AVENUE_SIGNALS.map((x, index) => (
        <TrafficLight key={x} position={[x, 0, index % 2 === 0 ? 6.9 : -6.9]} />
      ))}

      <SecurityHQ onSelect={onSelect} />
      <XWingEgg position={[42, 9.2, -20]} />
      <LprArch x={33.5} color="#b0a0ff" />
      <PtzCamera position={[31, 0, -31]} rotation={2.1} beam />
      <PtzCamera position={[59, 0, -30]} rotation={2.8} />
      <PtzCamera position={[59.5, 0, 19]} rotation={4.1} />
      <PtzCamera position={[31, 0, 28]} rotation={0.8} beam />
      <PtzCamera position={[200, 0, 40]} rotation={3.1} beam />
      <PtzCamera position={[160, 0, 90]} rotation={4.4} />
      <PtzCamera position={[200, 0, -80]} rotation={2.3} />
      <PtzCamera position={[110, 0, -90]} rotation={1.1} beam />
      <Drone center={[46, -4]} radius={12} height={15} speed={0.18} phase={0} />
      <Drone center={[44, 8]} radius={8} height={19} speed={-0.13} phase={2.4} />
      <Drone center={[150, 60]} radius={14} height={18} speed={0.11} phase={1.2} />
      <Drone center={[110, -70]} radius={10} height={22} speed={-0.12} phase={4.1} />
      <LprArch x={200} color="#b0a0ff" />
    </group>
  )
}
