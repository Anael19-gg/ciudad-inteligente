import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Html, Line, useCursor } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { CLOUDS, type Cloud, type Selection } from '../../data/project'
import { ArrowUpRight } from '../ui/icons'

function DataLink({
  from,
  to,
  color,
  count = 5,
  speed = 0.09,
  reverse = true,
}: {
  from: [number, number, number]
  to: [number, number, number]
  color: string
  count?: number
  speed?: number
  reverse?: boolean
}) {
  const curve = useMemo(() => {
    const start = new THREE.Vector3(...from)
    const end = new THREE.Vector3(...to)
    const mid = start.clone().lerp(end, 0.5)
    mid.y += 9 + start.distanceTo(end) * 0.16
    return new THREE.QuadraticBezierCurve3(start, mid, end)
  }, [from, to])
  const points = useMemo(() => curve.getPoints(64), [curve])
  const particles = useRef<(THREE.Mesh | null)[]>([])
  const backParticles = useRef<(THREE.Mesh | null)[]>([])

  useFrame(({ clock }) => {
    const time = clock.elapsedTime
    particles.current.forEach((particle, index) => {
      if (!particle) return
      const t = (time * speed + index / count + 0.12) % 1
      particle.position.copy(curve.getPoint(t))
    })
    backParticles.current.forEach((particle, index) => {
      if (!particle) return
      const t = 1 - ((time * speed * 0.75 + index / 3 + 0.5) % 1)
      particle.position.copy(curve.getPoint(t))
    })
  })

  return (
    <group>
      <Line points={points} color={color} transparent opacity={0.22} lineWidth={1.4} />
      <Line
        points={points}
        color={color}
        transparent
        opacity={0.36}
        lineWidth={0.8}
        dashed
        dashSize={1.4}
        gapSize={2.6}
      />
      {Array.from({ length: count }).map((_, index) => (
        <mesh
          key={`up-${index}`}
          ref={(el) => {
            particles.current[index] = el
          }}
        >
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
      ))}
      {reverse &&
        Array.from({ length: 3 }).map((_, index) => (
          <mesh
            key={`down-${index}`}
            ref={(el) => {
              backParticles.current[index] = el
            }}
          >
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial color="#f4fbff" toneMapped={false} transparent opacity={0.65} />
          </mesh>
        ))}
      <mesh position={from}>
        <sphereGeometry args={[0.24, 10, 10]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh position={from} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.7, 0.85, 32]} />
        <meshBasicMaterial color={color} toneMapped={false} transparent opacity={0.55} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function CloudCore({
  cloud,
  onSelect,
  showAnnotations,
}: {
  cloud: Cloud
  onSelect: (selection: Selection) => void
  showAnnotations: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const groupRef = useRef<THREE.Group>(null)
  const ringRef = useRef<THREE.Group>(null)
  const coreRef = useRef<THREE.Mesh>(null)
  const hovering = hovered
  useCursor(hovering)

  useFrame(({ clock }, delta) => {
    const target = hovering ? 1.045 : 1
    if (groupRef.current) {
      const current = groupRef.current.scale.x
      const next = THREE.MathUtils.damp(current, target, 7, delta)
      groupRef.current.scale.setScalar(next)
    }
    if (ringRef.current) {
      ringRef.current.rotation.y = clock.elapsedTime * 0.06
    }
    if (coreRef.current) {
      const pulse = 1 + Math.sin(clock.elapsedTime * 1.2) * 0.06
      coreRef.current.scale.setScalar(pulse)
      coreRef.current.rotation.y = clock.elapsedTime * 0.18
    }
  })

  return (
    <group position={cloud.position}>
      <group
        ref={groupRef}
        onClick={(event) => {
          event.stopPropagation()
          onSelect({ type: 'cloud', cloud: cloud.id })
        }}
        onPointerOver={(event) => {
          event.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={() => {
          setHovered(false)
        }}
      >
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[4.7, 5.3, 0.5, 6]} />
          <meshStandardMaterial color="#0b1218" roughness={0.4} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.56, 0]}>
          <cylinderGeometry args={[4.2, 4.4, 0.24, 6]} />
          <meshStandardMaterial
            color="#131b25"
            roughness={0.3}
            metalness={0.65}
            emissive={cloud.id === 'us' ? '#2f66b0' : '#6a4ca8'}
            emissiveIntensity={0.4}
          />
        </mesh>
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[5.32, 5.32, 0.06, 6]} />
          <meshBasicMaterial color={cloud.accent} transparent opacity={0.6} toneMapped={false} />
        </mesh>
        {[0, 1, 2, 3, 4, 5].map((index) => {
          const angle = (index / 6) * Math.PI * 2 + Math.PI / 6
          const x = Math.cos(angle) * 3.4
          const z = Math.sin(angle) * 3.4
          return (
            <group key={index} position={[x, 0.75, z]}>
              <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[0.5, 1.1, 0.16]} />
                <meshStandardMaterial color="#16202b" metalness={0.6} roughness={0.35} />
              </mesh>
              <mesh position={[0, 1.02, 0]}>
                <boxGeometry args={[0.5, 0.045, 0.16]} />
                <meshBasicMaterial color={cloud.accent} toneMapped={false} />
              </mesh>
            </group>
          )
        })}
        <group ref={ringRef}>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 1.15, 0]}>
            <torusGeometry args={[5.15, 0.035, 5, 64]} />
            <meshBasicMaterial color={cloud.accent} transparent opacity={0.55} toneMapped={false} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 1.15, 0]}>
            <torusGeometry args={[4.45, 0.02, 5, 64]} />
            <meshBasicMaterial color={cloud.accent} transparent opacity={0.28} toneMapped={false} />
          </mesh>
        </group>
        <mesh ref={coreRef} position={[0, 2.2, 0]}>
          <icosahedronGeometry args={[0.95, 1]} />
          <meshStandardMaterial
            color={cloud.accent}
            emissive={cloud.accent}
            emissiveIntensity={1.8}
            roughness={0.25}
            metalness={0.4}
            flatShading
          />
        </mesh>
        <mesh position={[0, 2.2, 0]}>
          <icosahedronGeometry args={[1.35, 1]} />
          <meshBasicMaterial color={cloud.accent} transparent opacity={0.08} wireframe toneMapped={false} />
        </mesh>
        <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.6, 2.72, 48]} />
          <meshBasicMaterial color={cloud.accent} transparent opacity={0.25} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
        <pointLight color={cloud.accent} intensity={16} distance={24} decay={2} />
      </group>
      <Html
        position={[0, -4.9, 0]}
        center
        zIndexRange={[16, 0]}
        style={{ pointerEvents: 'none', display: showAnnotations ? undefined : 'none' }}
      >
        <button
          type="button"
          className="cloud-tag"
          style={{ pointerEvents: 'auto', '--cloud-accent': cloud.accent } as React.CSSProperties}
          onClick={(event) => {
            event.stopPropagation()
            onSelect({ type: 'cloud', cloud: cloud.id })
          }}
        >
          <span className="cloud-tag__eyebrow">
            {cloud.index} · {cloud.region}
          </span>
          <span className="cloud-tag__name">{cloud.name}</span>
          <span className="cloud-tag__foot">
            {cloud.zones.length} {cloud.zones.length === 1 ? 'zona conectada' : 'zonas conectadas'}
            <span className="cloud-tag__arrow">
              <ArrowUpRight size={13} />
            </span>
          </span>
        </button>
      </Html>
    </group>
  )
}

export function Clouds({
  onSelect,
  showAnnotations,
}: {
  onSelect: (selection: Selection) => void
  showAnnotations: boolean
}) {
  const us = CLOUDS.find((cloud) => cloud.id === 'us')!
  const eu = CLOUDS.find((cloud) => cloud.id === 'eu')!

  return (
    <group>
      <DataLink from={[-14, 9.2, -24]} to={[us.position[0], us.position[1] - 1.5, us.position[2]]} color="#7fb6ff" count={5} />
      <DataLink from={[45, 9.2, -22]} to={[us.position[0] + 2, us.position[1] - 1.5, us.position[2]]} color="#b0a0ff" count={4} />
      <DataLink from={[-42, 5.4, -15.5]} to={[eu.position[0] + 2, eu.position[1] - 1.5, eu.position[2]]} color="#c3a6ff" count={4} />
      <DataLink from={[-46.5, 3, 21]} to={[eu.position[0], eu.position[1] - 1.5, eu.position[2]]} color="#f2c97b" count={4} />
      <CloudCore cloud={us} onSelect={onSelect} showAnnotations={showAnnotations} />
      <CloudCore cloud={eu} onSelect={onSelect} showAnnotations={showAnnotations} />
    </group>
  )
}
