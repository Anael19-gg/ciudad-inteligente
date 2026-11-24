import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { CameraControls } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { City } from './City'
import { Landmarks } from './Landmarks'
import { Clouds } from './Clouds'
import { Overlays } from './Overlays'
import type { LayerId, Selection, Vec3 } from '../../data/project'

export interface CameraView {
  pos: Vec3
  target: Vec3
}

function CameraRig({ view, nonce }: { view: CameraView; nonce: number }) {
  const controls = useRef<CameraControls>(null)
  const reducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  useEffect(() => {
    const instance = controls.current
    if (!instance) return
    void instance.setLookAt(
      view.pos[0],
      view.pos[1],
      view.pos[2],
      view.target[0],
      view.target[1],
      view.target[2],
      !reducedMotion,
    )
  }, [view, nonce, reducedMotion])

  return (
    <CameraControls
      ref={controls}
      makeDefault
      minDistance={13}
      maxDistance={220}
      minPolarAngle={0.12}
      maxPolarAngle={1.48}
      smoothTime={0.7}
      dollySpeed={0.45}
      truckSpeed={0.7}
      draggingSmoothTime={0.14}
    />
  )
}

function Motes() {
  const group = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const array = new Float32Array(420 * 3)
    for (let i = 0; i < 420; i += 1) {
      array[i * 3] = (Math.random() - 0.5) * 140
      array[i * 3 + 1] = 1 + Math.random() * 32
      array[i * 3 + 2] = (Math.random() - 0.5) * 92
    }
    return array
  }, [])

  useFrame(({ clock }) => {
    if (!group.current) return
    group.current.rotation.y = clock.elapsedTime * 0.006
    group.current.position.y = Math.sin(clock.elapsedTime * 0.12) * 0.4
  })

  return (
    <points ref={group}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#8bdced"
        size={0.09}
        sizeAttenuation
        transparent
        opacity={0.5}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  )
}

function Atmosphere() {
  return (
    <>
      <color attach="background" args={['#05070a']} />
      <fog attach="fog" args={['#05070a', 105, 260]} />
      <ambientLight intensity={0.32} color="#a6c2d8" />
      <hemisphereLight args={['#33566b', '#04070a', 0.6]} />
      <directionalLight position={[38, 62, 42]} intensity={2.1} color="#cfe3f7" />
      <directionalLight position={[-54, 34, -46]} intensity={0.7} color="#7d8dff" />
      <pointLight position={[-14, 12, -24]} intensity={38} distance={32} decay={2} color="#5fd8ff" />
      <pointLight position={[45, 11, -22]} intensity={30} distance={30} decay={2} color="#9080ff" />
      <pointLight position={[-42, 9, -15]} intensity={22} distance={24} decay={2} color="#ffd394" />
      <pointLight position={[-45, 10, 22]} intensity={30} distance={36} decay={2} color="#ffc98f" />
    </>
  )
}

export function AtlasCanvas({
  view,
  nonce,
  activeLayers,
  onSelect,
  onReady,
  showZoneLabels,
  showCloudLabels,
  compact,
}: {
  view: CameraView
  nonce: number
  activeLayers: Set<LayerId>
  onSelect: (selection: Selection) => void
  onReady: () => void
  showZoneLabels: boolean
  showCloudLabels: boolean
  compact: boolean
}) {
  return (
    <div className="canvas-host" aria-label="Modelo 3D interactivo de la ciudad inteligente">
      <Canvas
        camera={{ position: [0, 132, 212], fov: 36, near: 0.8, far: 500 }}
        dpr={compact ? 1 : [1, 1.65]}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        fallback={
          <div className="webgl-fallback">
            <strong>No se pudo iniciar el modelo 3D</strong>
            <span>Activa la aceleración por hardware de tu navegador y recarga la página.</span>
          </div>
        }
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.08
          onReady()
        }}
      >
        <Atmosphere />
        <CameraRig view={view} nonce={nonce} />
        <City />
        <Landmarks onSelect={onSelect} />
        <Clouds onSelect={onSelect} showAnnotations={showCloudLabels} />
        <Overlays activeLayers={activeLayers} onSelect={onSelect} showAnnotations={showZoneLabels} />
        <Motes />
        {!compact && (
          <EffectComposer multisampling={0}>
            <Bloom
              mipmapBlur
              intensity={0.85}
              luminanceThreshold={0.55}
              luminanceSmoothing={0.28}
              radius={0.72}
            />
            <Vignette offset={0.18} darkness={0.55} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  )
}
