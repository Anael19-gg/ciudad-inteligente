import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { CameraControls } from '@react-three/drei'
import { City } from './City'
import { Landmarks } from './Landmarks'
import { Clouds } from './Clouds'
import { Overlays } from './Overlays'
import type { Selection, Vec3 } from '../../data/project'

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
      minDistance={14}
      maxDistance={900}
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
    const array = new Float32Array(260 * 3)
    for (let i = 0; i < 260; i += 1) {
      array[i * 3] = (Math.random() - 0.5) * 470
      array[i * 3 + 1] = 2 + Math.random() * 46
      array[i * 3 + 2] = (Math.random() - 0.5) * 290
    }
    return array
  }, [])

  useFrame(({ clock }) => {
    if (!group.current) return
    group.current.rotation.y = clock.elapsedTime * 0.004
  })

  return (
    <points ref={group}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#93aeb8"
        size={0.11}
        sizeAttenuation
        transparent
        opacity={0.32}
        depthWrite={false}
        toneMapped={false}
      />
    </points>
  )
}

function Atmosphere({ day }: { day: boolean }) {
  if (day) {
    return (
      <>
        <color attach="background" args={['#aebfc7']} />
        <fog attach="fog" args={['#aebfc7', 500, 1500]} />
        <ambientLight intensity={0.95} color="#f4f8f6" />
        <hemisphereLight args={['#e8f0f2', '#7b898d', 1.05]} />
        <directionalLight position={[90, 120, 80]} intensity={3.2} color="#fff0d7" />
        <directionalLight position={[-80, 50, -60]} intensity={0.75} color="#d6e8ff" />
        <pointLight position={[-14, 12, -24]} intensity={16} distance={32} decay={2} color="#5fd8ff" />
        <pointLight position={[45, 11, -22]} intensity={14} distance={30} decay={2} color="#9080ff" />
        <pointLight position={[-42, 9, -15]} intensity={10} distance={24} decay={2} color="#ffd394" />
        <pointLight position={[-45, 10, 22]} intensity={14} distance={36} decay={2} color="#ffc98f" />
      </>
    )
  }

  return (
    <>
      <color attach="background" args={['#05070a']} />
      <fog attach="fog" args={['#05070a', 360, 1200]} />
      <ambientLight intensity={0.46} color="#b4cbd9" />
      <hemisphereLight args={['#3c5d6c', '#04070a', 0.7]} />
      <directionalLight position={[38, 72, 52]} intensity={2.5} color="#d7e8f7" />
      <directionalLight position={[-54, 34, -46]} intensity={0.6} color="#7d8dff" />
      <pointLight position={[-14, 12, -24]} intensity={32} distance={32} decay={2} color="#5fd8ff" />
      <pointLight position={[45, 11, -22]} intensity={26} distance={30} decay={2} color="#9080ff" />
      <pointLight position={[-42, 9, -15]} intensity={18} distance={24} decay={2} color="#ffd394" />
      <pointLight position={[-45, 10, 22]} intensity={26} distance={36} decay={2} color="#ffc98f" />
    </>
  )
}

export function AtlasCanvas({
  view,
  nonce,
  onSelect,
  onReady,
  showZoneLabels,
  showCloudLabels,
  day,
}: {
  view: CameraView
  nonce: number
  onSelect: (selection: Selection) => void
  onReady: () => void
  showZoneLabels: boolean
  showCloudLabels: boolean
  day: boolean
}) {
  return (
    <div className="canvas-host" aria-label="Modelo 3D interactivo de la ciudad inteligente">
      <Canvas
        camera={{ position: [0, 300, 560], fov: 36, near: 0.8, far: 1800 }}
        dpr={[1, 1.35]}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        fallback={
          <div className="webgl-fallback">
            <strong>No se pudo iniciar el modelo 3D</strong>
            <span>Activa la aceleración por hardware de tu navegador y recarga la página.</span>
          </div>
        }
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.1
          onReady()
        }}
      >
        <Atmosphere day={day} />
        <CameraRig view={view} nonce={nonce} />
        <City day={day} />
        <Landmarks onSelect={onSelect} />
        <Clouds onSelect={onSelect} showAnnotations={showCloudLabels} />
        <Overlays onSelect={onSelect} showAnnotations={showZoneLabels} />
        {!day && <Motes />}
      </Canvas>
    </div>
  )
}
