import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
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

function Exposure({ day }: { day: boolean }) {
  const gl = useThree((state) => state.gl)
  useEffect(() => {
    gl.toneMappingExposure = day ? 1.02 : 1.12
  }, [gl, day])
  return null
}

function SkyDome({ day }: { day: boolean }) {
  const geometry = useMemo(() => {
    const sphere = new THREE.SphereGeometry(1450, 40, 24)
    const position = sphere.getAttribute('position')
    const colors = new Float32Array(position.count * 3)
    const top = new THREE.Color(day ? '#5f9bc4' : '#010308')
    const horizon = new THREE.Color(day ? '#d7e7e9' : '#0a1824')
    const bottom = new THREE.Color(day ? '#6c7f85' : '#020509')
    const color = new THREE.Color()
    for (let i = 0; i < position.count; i += 1) {
      const y = position.getY(i) / 1450
      if (y >= 0) {
        color.copy(horizon).lerp(top, Math.min(1, Math.pow(y, 0.62) * 1.35))
      } else {
        color.copy(horizon).lerp(bottom, Math.min(1, Math.abs(y) * 3.2))
      }
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }
    sphere.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return sphere
  }, [day])

  return (
    <mesh geometry={geometry} frustumCulled={false}>
      <meshBasicMaterial vertexColors side={THREE.BackSide} depthWrite={false} toneMapped={false} fog={false} />
    </mesh>
  )
}

function Atmosphere({ day }: { day: boolean }) {
  if (day) {
    return (
      <>
        <color attach="background" args={['#a9c0c9']} />
        <fog attach="fog" args={['#c3d6dc', 720, 1750]} />
        <ambientLight intensity={0.42} color="#f6faf8" />
        <hemisphereLight args={['#eef5f6', '#6c7d81', 0.68]} />
        <directionalLight
          position={[110, 140, 90]}
          intensity={3.1}
          color="#fff2da"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-300}
          shadow-camera-right={300}
          shadow-camera-top={260}
          shadow-camera-bottom={-260}
          shadow-camera-near={20}
          shadow-camera-far={520}
          shadow-bias={-0.0006}
        />
        <directionalLight position={[-90, 55, -70]} intensity={0.95} color="#cfe6ff" />
        <pointLight position={[-14, 12, -24]} intensity={16} distance={32} decay={2} color="#5fd8ff" />
        <pointLight position={[160, 15, -30]} intensity={14} distance={30} decay={2} color="#9080ff" />
        <pointLight position={[-155, 38, 55]} intensity={90} distance={150} decay={2} color="#ffcf9b" />
        <pointLight position={[-155, 38, -85]} intensity={80} distance={140} decay={2} color="#ffd9b0" />
        <pointLight position={[180, 38, 55]} intensity={85} distance={150} decay={2} color="#b4a8ff" />
        <pointLight position={[180, 38, -85]} intensity={75} distance={140} decay={2} color="#a9b8ff" />
      </>
    )
  }

  return (
    <>
      <color attach="background" args={['#05080d']} />
      <fog attach="fog" args={['#05080d', 380, 1250]} />
      <ambientLight intensity={0.62} color="#b4cbd9" />
      <hemisphereLight args={['#3c5d6c', '#05080b', 0.95]} />
      <directionalLight position={[38, 72, 52]} intensity={2.3} color="#d7e8f7" />
      <directionalLight position={[-54, 34, -46]} intensity={0.7} color="#7d8dff" />
      <pointLight position={[-14, 12, -24]} intensity={32} distance={32} decay={2} color="#5fd8ff" />
      <pointLight position={[160, 15, -30]} intensity={26} distance={32} decay={2} color="#9080ff" />
      <pointLight position={[-155, 38, 55]} intensity={150} distance={160} decay={2} color="#ffcf9b" />
      <pointLight position={[-155, 38, -85]} intensity={130} distance={150} decay={2} color="#ffd9b0" />
      <pointLight position={[180, 38, 55]} intensity={140} distance={160} decay={2} color="#b4a8ff" />
      <pointLight position={[180, 38, -85]} intensity={120} distance={150} decay={2} color="#a9b8ff" />
      {[-140, -12, 60, 140].map((x, index) => (
        <pointLight
          key={x}
          position={[x, 5.6, index % 2 === 0 ? 9 : -9]}
          intensity={16}
          distance={22}
          decay={2}
          color="#ffd9a8"
        />
      ))}
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
        camera={{ position: [0, 300, 560], fov: 36, near: 0.8, far: 4000 }}
        dpr={[1, 1.35]}
        shadows
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
        <SkyDome day={day} />
        <Exposure day={day} />
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
