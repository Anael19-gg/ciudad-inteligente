import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Html, Line } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { LAYER_BY_ID, ZONE_BY_ID, type LayerId, type Selection, type ZoneId } from '../../data/project'
import { DOCUMENT_POINTS, type DocumentPoint } from '../../data/annotations'

function DocLabel({
  point,
  hovered,
  onSelect,
}: {
  point: DocumentPoint
  hovered: boolean
  onSelect: (selection: Selection) => void
}) {
  const layer = LAYER_BY_ID[point.layer]
  const zone = ZONE_BY_ID[point.zone]

  return (
    <group position={point.anchor}>
      <Line points={[[0, 0, 0], point.offset]} color={layer.color} transparent opacity={hovered ? 0.9 : 0.45} lineWidth={1} />
      <Html position={point.offset} center zIndexRange={[26, 4]} style={{ pointerEvents: 'none' }}>
        <button
          type="button"
          className={`doc-tag ${hovered ? 'is-hovered' : ''}`}
          style={{ '--doc-color': layer.color } as React.CSSProperties}
          onClick={(event) => {
            event.stopPropagation()
            onSelect({ type: 'zone', zone: point.zone, layer: point.layer })
          }}
          aria-label={`${zone.name}: ${point.label}. Abrir ${layer.short}.`}
        >
          <span className="doc-tag__head">
            <span className="doc-tag__layer">
              <span className="doc-tag__dot" />
              {layer.short}
            </span>
            <span className="doc-tag__zone">{zone.code}</span>
          </span>
          <span className="doc-tag__label">{point.label}</span>
        </button>
      </Html>
    </group>
  )
}

export function Annotations({
  activeZone,
  visible,
  layers,
  onSelect,
}: {
  activeZone: ZoneId | null
  visible: boolean
  layers: Record<LayerId, boolean>
  onSelect: (selection: Selection) => void
}) {
  const [hovered, setHovered] = useState<string | null>(null)
  const dotsRef = useRef<THREE.InstancedMesh>(null)
  const ringsRef = useRef<THREE.InstancedMesh>(null)
  const hitRef = useRef<THREE.InstancedMesh>(null)

  const points = useMemo(
    () =>
      DOCUMENT_POINTS.filter((point) =>
        activeZone ? point.zone === activeZone : layers[point.layer],
      ),
    [activeZone, layers],
  )

  const expandedPoints = useMemo(
    () =>
      points.filter(
        (point) => hovered === point.id || Boolean(activeZone && layers[point.layer]),
      ),
    [points, activeZone, layers, hovered],
  )

  useLayoutEffect(() => {
    if (!dotsRef.current || !ringsRef.current || !hitRef.current) return
    const matrix = new THREE.Matrix4()
    const position = new THREE.Vector3()
    const quaternion = new THREE.Quaternion()
    const flat = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0))
    const scale = new THREE.Vector3()
    const color = new THREE.Color()
    const size = activeZone ? 1 : 3.6

    points.forEach((point, index) => {
      const layer = LAYER_BY_ID[point.layer]
      position.set(...point.anchor)
      scale.setScalar(size)
      matrix.compose(position, quaternion, scale)
      dotsRef.current!.setMatrixAt(index, matrix)
      dotsRef.current!.setColorAt(index, color.set(layer.color))
      matrix.compose(position, flat, scale)
      ringsRef.current!.setMatrixAt(index, matrix)
      ringsRef.current!.setColorAt(index, color.set(layer.color))
      matrix.compose(position, quaternion, scale)
      hitRef.current!.setMatrixAt(index, matrix)
    })
    dotsRef.current.instanceMatrix.needsUpdate = true
    ringsRef.current.instanceMatrix.needsUpdate = true
    hitRef.current.instanceMatrix.needsUpdate = true
    if (dotsRef.current.instanceColor) dotsRef.current.instanceColor.needsUpdate = true
    if (ringsRef.current.instanceColor) ringsRef.current.instanceColor.needsUpdate = true
  }, [points, activeZone, visible])

  if (!visible) return null

  const onPointerMove = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    if (event.instanceId === undefined) return
    setHovered(points[event.instanceId]?.id ?? null)
  }

  const onClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    if (event.instanceId === undefined) return
    const point = points[event.instanceId]
    if (point) onSelect({ type: 'zone', zone: point.zone, layer: point.layer })
  }

  return (
    <group>
      <instancedMesh ref={dotsRef} args={[undefined, undefined, points.length]}>
        <sphereGeometry args={[0.14, 10, 10]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={ringsRef} args={[undefined, undefined, points.length]}>
        <ringGeometry args={[0.28, 0.36, 24]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} transparent opacity={0.7} side={THREE.DoubleSide} />
      </instancedMesh>
      <instancedMesh
        ref={hitRef}
        args={[undefined, undefined, points.length]}
        onPointerMove={onPointerMove}
        onPointerOut={() => setHovered(null)}
        onClick={onClick}
      >
        <sphereGeometry args={[0.75, 8, 8]} />
        <meshBasicMaterial transparent opacity={0.001} depthWrite={false} />
      </instancedMesh>
      {expandedPoints.map((point) => (
        <DocLabel
          key={point.id}
          point={point}
          hovered={hovered === point.id}
          onSelect={onSelect}
        />
      ))}
    </group>
  )
}
