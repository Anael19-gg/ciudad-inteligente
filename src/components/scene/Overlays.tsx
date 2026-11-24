import { useRef, useState } from 'react'
import * as THREE from 'three'
import { Html, useCursor } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import {
  LAYER_BY_ID,
  ZONES,
  type LayerId,
  type Selection,
  type Zone,
  type ZoneId,
} from '../../data/project'
import { ArrowUpRight } from '../ui/icons'

function ZoneTag({
  zone,
  onSelect,
  visible,
}: {
  zone: Zone
  onSelect: (selection: Selection) => void
  visible: boolean
}) {
  return (
    <Html
      position={zone.markerAnchor}
      center
      zIndexRange={[13, 0]}
      style={{ pointerEvents: 'none', display: visible ? undefined : 'none' }}
    >
      <button
        type="button"
        className="zone-tag"
        style={{ pointerEvents: 'auto', '--zone-accent': zone.accent } as React.CSSProperties}
        onClick={(event) => {
          event.stopPropagation()
          onSelect({ type: 'zone', zone: zone.id })
        }}
      >
        <span className="zone-tag__top">
          <span className="zone-tag__index">Zona {zone.code}</span>
          <span className="zone-tag__pulse" />
        </span>
        <span className="zone-tag__name">{zone.name}</span>
        <span className="zone-tag__meta">Abrir ficha</span>
        <span className="zone-tag__arrow">
          <ArrowUpRight size={13} />
        </span>
      </button>
    </Html>
  )
}

function Beacon({
  zoneId,
  layer,
  position,
  onSelect,
}: {
  zoneId: ZoneId
  layer: LayerId
  position: [number, number, number]
  onSelect: (selection: Selection) => void
}) {
  const [hovered, setHovered] = useState(false)
  const meta = LAYER_BY_ID[layer]
  const zone = ZONES.find((item) => item.id === zoneId)!
  const gem = useRef<THREE.Mesh>(null)
  const ring = useRef<THREE.Mesh>(null)
  const group = useRef<THREE.Group>(null)
  useCursor(hovered)

  useFrame(({ clock }, delta) => {
    const time = clock.elapsedTime
    if (gem.current) {
      gem.current.rotation.y = time * 0.65
      gem.current.position.y = 2.9 + Math.sin(time * 1.6 + position[0]) * 0.12
      const targetScale = hovered ? 1.35 : 1
      gem.current.scale.setScalar(THREE.MathUtils.damp(gem.current.scale.x, targetScale, 8, delta))
    }
    if (ring.current) {
      const pulse = 1 + ((time * 0.55 + position[2] * 0.1) % 1) * 0.7
      ring.current.scale.set(pulse, 1, pulse)
      const material = ring.current.material as THREE.MeshBasicMaterial
      material.opacity = 0.45 * (1 - ((time * 0.55 + position[2] * 0.1) % 1))
    }
    if (group.current) {
      group.current.rotation.y = Math.sin(time * 0.3 + position[0]) * 0.08
    }
  })

  return (
    <group position={position} ref={group}>
      <group
        onClick={(event) => {
          event.stopPropagation()
          onSelect({ type: 'zone', zone: zoneId, layer })
        }}
        onPointerOver={(event) => {
          event.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={() => setHovered(false)}
      >
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.028, 0.06, 3, 6]} />
          <meshBasicMaterial color={meta.color} transparent opacity={0.45} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.6, 24]} />
          <meshBasicMaterial color={meta.color} transparent opacity={0.18} toneMapped={false} depthWrite={false} />
        </mesh>
        <mesh ref={ring} position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.58, 0.66, 32]} />
          <meshBasicMaterial color={meta.color} transparent opacity={0.45} toneMapped={false} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        <mesh ref={gem} position={[0, 2.9, 0]}>
          <octahedronGeometry args={[hovered ? 0.38 : 0.3, 0]} />
          <meshBasicMaterial color={meta.color} toneMapped={false} />
        </mesh>
        <mesh position={[0, 2.9, 0]}>
          <sphereGeometry args={[0.55, 12, 12]} />
          <meshBasicMaterial color={meta.color} transparent opacity={0.07} toneMapped={false} depthWrite={false} />
        </mesh>
      </group>
      {hovered && (
        <Html position={[0, 4.15, 0]} center distanceFactor={18} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
          <div className="beacon-tip" style={{ '--tip-color': meta.color } as React.CSSProperties}>
            <span>{meta.short}</span>
            <em>Zona {zone.code}</em>
          </div>
        </Html>
      )}
    </group>
  )
}

export function Overlays({
  activeLayers,
  onSelect,
  showAnnotations,
}: {
  activeLayers: Set<LayerId>
  onSelect: (selection: Selection) => void
  showAnnotations: boolean
}) {
  return (
    <group>
      {ZONES.map((zone) => (
        <ZoneTag key={zone.id} zone={zone} onSelect={onSelect} visible={showAnnotations} />
      ))}
      {ZONES.flatMap((zone) =>
        zone.markers
          .filter((marker) => activeLayers.has(marker.layer))
          .map((marker) => (
            <Beacon
              key={`${zone.id}-${marker.layer}`}
              zoneId={zone.id}
              layer={marker.layer}
              position={marker.position}
              onSelect={onSelect}
            />
          )),
      )}
    </group>
  )
}
