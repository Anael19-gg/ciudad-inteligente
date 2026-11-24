import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

interface OrbitConfig {
  center: [number, number]
  radiusX: number
  radiusZ: number
  height: number
  speed: number
  direction: 1 | -1
  phase: number
  bank: number
}

const ORBITS: OrbitConfig[] = [
  {
    center: [130, 10],
    radiusX: 55,
    radiusZ: 40,
    height: 52,
    speed: 0.08,
    direction: 1,
    phase: 0.55,
    bank: 0.26,
  },
  {
    center: [-125, 10],
    radiusX: 50,
    radiusZ: 35,
    height: 38,
    speed: 0.09,
    direction: -1,
    phase: 3.6,
    bank: 0.34,
  },
]

const TAU = Math.PI * 2

function damp(current: number, target: number, lambda: number, delta: number) {
  return current + (target - current) * (1 - Math.exp(-lambda * delta))
}

function dampAngle(current: number, target: number, lambda: number, delta: number) {
  const difference = Math.atan2(Math.sin(target - current), Math.cos(target - current))
  return current + difference * (1 - Math.exp(-lambda * delta))
}

function Helicopter({ orbit, day }: { orbit: OrbitConfig; day: boolean }) {
  const flight = useRef<THREE.Group>(null)
  const tilt = useRef<THREE.Group>(null)
  const mainRotor = useRef<THREE.Group>(null)
  const tailRotor = useRef<THREE.Group>(null)

  const angle = useRef(orbit.phase)

  const geometries = useMemo(
    () => ({
      box: new THREE.BoxGeometry(1, 1, 1),
      sphere: new THREE.SphereGeometry(1, 12, 8),
      hull: new THREE.CylinderGeometry(0.6, 0.86, 3, 10),
      nose: new THREE.ConeGeometry(0.6, 1.4, 10),
      boom: new THREE.CylinderGeometry(0.3, 0.15, 2, 8),
      pod: new THREE.CylinderGeometry(0.3, 0.4, 1.7, 8),
      exhaust: new THREE.CylinderGeometry(0.16, 0.2, 0.32, 8),
      mast: new THREE.CylinderGeometry(0.09, 0.13, 0.6, 8),
      hub: new THREE.CylinderGeometry(0.3, 0.36, 0.2, 10),
      tailHub: new THREE.CylinderGeometry(0.09, 0.09, 0.16, 8),
      strut: new THREE.CylinderGeometry(0.05, 0.065, 1, 6),
      skid: new THREE.CylinderGeometry(0.06, 0.06, 3.3, 6),
      podIntake: new THREE.TorusGeometry(0.3, 0.028, 5, 16),
      band: new THREE.TorusGeometry(0.84, 0.018, 4, 20),
      tailGuard: new THREE.TorusGeometry(0.8, 0.024, 4, 18),
      canopyHoop: new THREE.TorusGeometry(0.62, 0.02, 4, 18),
      light: new THREE.SphereGeometry(0.1, 8, 8),
      disc: new THREE.CircleGeometry(3.85, 32),
      beam: new THREE.ConeGeometry(2.2, 8.2, 16, 1, true),
      lens: new THREE.CylinderGeometry(0.075, 0.09, 0.14, 8),
      search: new THREE.CylinderGeometry(0.15, 0.2, 0.28, 8),
    }),
    [],
  )

  const materials = useMemo(
    () => ({
      hull: new THREE.MeshStandardMaterial({
        color: day ? '#8fa1a9' : '#435863',
        metalness: day ? 0.5 : 0.72,
        roughness: day ? 0.42 : 0.32,
        flatShading: true,
      }),
      hullDark: new THREE.MeshStandardMaterial({
        color: day ? '#4f6069' : '#243541',
        metalness: 0.75,
        roughness: 0.38,
        flatShading: true,
      }),
      trim: new THREE.MeshStandardMaterial({
        color: day ? '#b7c7cd' : '#7f98a3',
        metalness: 0.8,
        roughness: 0.3,
      }),
      glass: new THREE.MeshStandardMaterial({
        color: day ? '#174653' : '#071e27',
        metalness: 0.45,
        roughness: 0.12,
        emissive: day ? '#1f5b69' : '#3fbfd8',
        emissiveIntensity: day ? 0.4 : 1.15,
      }),
      blade: new THREE.MeshStandardMaterial({
        color: day ? '#30393f' : '#1b2a31',
        metalness: 0.55,
        roughness: 0.4,
        emissive: day ? '#000000' : '#0b2630',
        emissiveIntensity: day ? 0 : 0.35,
      }),
      glow: new THREE.MeshStandardMaterial({
        color: day ? '#c7f6ff' : '#5ce8ff',
        emissive: day ? '#4fc7dd' : '#63eaff',
        emissiveIntensity: day ? 1.4 : 2.6,
        metalness: 0.1,
        roughness: 0.35,
      }),
      cyan: new THREE.MeshBasicMaterial({ color: day ? '#c9f8ff' : '#83f4ff', toneMapped: false }),
      red: new THREE.MeshBasicMaterial({ color: day ? '#ff8a80' : '#ff5a4f', toneMapped: false }),
      green: new THREE.MeshBasicMaterial({ color: day ? '#92f2b2' : '#46ff8d', toneMapped: false }),
      white: new THREE.MeshBasicMaterial({ color: day ? '#f3fbff' : '#dff8ff', toneMapped: false }),
      disc: new THREE.MeshBasicMaterial({
        color: day ? '#cfe4ea' : '#9fdbe6',
        transparent: true,
        opacity: day ? 0.07 : 0.045,
        side: THREE.DoubleSide,
        depthWrite: false,
        toneMapped: false,
      }),
      beam: new THREE.MeshBasicMaterial({
        color: day ? '#b9f1ff' : '#8ceeff',
        transparent: true,
        opacity: day ? 0.045 : 0.11,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    }),
    [day],
  )

  const initial = useMemo(() => {
    const tangentX = -Math.sin(orbit.phase) * orbit.radiusX * orbit.direction
    const tangentZ = Math.cos(orbit.phase) * orbit.radiusZ * orbit.direction
    return {
      x: orbit.center[0] + Math.cos(orbit.phase) * orbit.radiusX,
      z: orbit.center[1] + Math.sin(orbit.phase) * orbit.radiusZ,
      yaw: Math.atan2(-tangentZ, tangentX),
      bank: orbit.direction * (orbit.bank + Math.sin(orbit.phase * 2 + 0.7) * 0.045),
    }
  }, [orbit])

  useFrame(({ clock }, delta) => {
    const step = Math.min(delta, 0.1)
    angle.current = (angle.current + orbit.speed * orbit.direction * step) % TAU
    const a = angle.current

    const x = orbit.center[0] + Math.cos(a) * orbit.radiusX
    const z = orbit.center[1] + Math.sin(a) * orbit.radiusZ
    const y = orbit.height + Math.sin(a * 2 + orbit.phase) * 0.55

    if (flight.current) {
      flight.current.position.set(x, y, z)
      const tangentX = -Math.sin(a) * orbit.radiusX * orbit.direction
      const tangentZ = Math.cos(a) * orbit.radiusZ * orbit.direction
      const targetYaw = Math.atan2(-tangentZ, tangentX)
      flight.current.rotation.y = dampAngle(flight.current.rotation.y, targetYaw, 4, step)
    }

    if (tilt.current) {
      const targetBank = orbit.direction * (orbit.bank + Math.sin(a * 2 + 0.7) * 0.045)
      tilt.current.rotation.x = damp(tilt.current.rotation.x, targetBank, 2.4, step)
      tilt.current.rotation.z = damp(tilt.current.rotation.z, -0.035 + Math.sin(a * 2.1 + 1.3) * 0.012, 2, step)
      tilt.current.position.y = Math.sin(a * 3.4 + orbit.phase) * 0.06
    }

    if (mainRotor.current) mainRotor.current.rotation.y = clock.elapsedTime * 16.5
    if (tailRotor.current) tailRotor.current.rotation.z = clock.elapsedTime * 36
  })

  return (
    <group ref={flight} position={[initial.x, orbit.height, initial.z]} rotation={[0, initial.yaw, 0]} scale={2.2}>
      <group ref={tilt} rotation={[initial.bank, 0, -0.035]}>
        {/* Fuselaje, morro y panza */}
        <mesh geometry={geometries.hull} material={materials.hull} position={[0, 0.12, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow />
        <mesh
          geometry={geometries.nose}
          material={materials.hull}
          position={[2.2, 0.14, 0]}
          rotation={[0, 0, -Math.PI / 2 - 0.05]}
          castShadow
        />
        <mesh geometry={geometries.sphere} material={materials.hullDark} position={[0.15, -0.42, 0]} scale={[1.35, 0.42, 0.68]} />

        {/* Cabina de vidrio y arcos estructurales */}
        <mesh geometry={geometries.sphere} material={materials.glass} position={[1.05, 0.66, 0]} scale={[1.05, 0.54, 0.62]} />
        <mesh
          geometry={geometries.canopyHoop}
          material={materials.hullDark}
          position={[0.8, 0.66, 0]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[0.97, 0.85, 1]}
        />
        <mesh
          geometry={geometries.canopyHoop}
          material={materials.hullDark}
          position={[1.55, 0.66, 0]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[0.88, 0.77, 1]}
        />

        {/* Cola, aleta y estabilizador */}
        <mesh geometry={geometries.boom} material={materials.hull} position={[-2.35, 0.24, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow />
        <mesh
          geometry={geometries.box}
          material={materials.hullDark}
          position={[-3.16, 0.82, 0]}
          rotation={[0, 0, 0.32]}
          scale={[0.5, 1.1, 0.1]}
        />
        <mesh
          geometry={geometries.box}
          material={materials.trim}
          position={[-3.02, 0.12, 0]}
          rotation={[0, 0, -0.42]}
          scale={[0.3, 0.48, 0.08]}
        />
        <mesh geometry={geometries.box} material={materials.hullDark} position={[-2.72, 0.3, 0]} scale={[0.44, 0.06, 1.45]} />

        {/* Rotor de cola */}
        <group position={[-3.24, 0.98, 0.18]}>
          <mesh geometry={geometries.tailGuard} material={materials.trim} />
          <mesh geometry={geometries.tailHub} material={materials.hullDark} rotation={[Math.PI / 2, 0, 0]} />
          <group ref={tailRotor}>
            <mesh geometry={geometries.box} material={materials.blade} scale={[0.055, 1.5, 0.035]} />
          </group>
        </group>

        {/* Mástil, buje y rotor principal de cuatro aspas */}
        <mesh geometry={geometries.mast} material={materials.trim} position={[0, 1.15, 0]} />
        <mesh geometry={geometries.hub} material={materials.hullDark} position={[0, 1.5, 0]} />
        <group ref={mainRotor} position={[0, 1.6, 0]}>
          {[0, 1, 2, 3].map((index) => (
            <group key={index} rotation={[0, (index * Math.PI) / 2, 0]}>
              <mesh geometry={geometries.box} material={materials.blade} position={[1.95, 0, 0]} scale={[3.7, 0.045, 0.27]} />
            </group>
          ))}
          <mesh geometry={geometries.disc} material={materials.disc} rotation={[-Math.PI / 2, 0, 0]} />
        </group>

        {/* Pods laterales con tomas y escapes */}
        {[-1, 1].map((side) => (
          <group key={side} position={[0.3, 0.02, side * 0.86]}>
            <mesh geometry={geometries.pod} material={materials.hullDark} rotation={[0, 0, -Math.PI / 2]} castShadow />
            <mesh geometry={geometries.podIntake} material={materials.trim} position={[0.82, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
            <mesh geometry={geometries.exhaust} material={materials.blade} position={[-0.9, 0, 0]} rotation={[0, 0, -Math.PI / 2]} />
            <mesh geometry={geometries.box} material={materials.glow} position={[0.05, 0.12, side * 0.36]} scale={[1.05, 0.035, 0.04]} />
          </group>
        ))}

        {/* Patines de aterrizaje */}
        {[-1, 1].map((side) => (
          <group key={side}>
            <mesh
              geometry={geometries.skid}
              material={materials.trim}
              position={[0, -1.04, side * 0.8]}
              rotation={[0, 0, -Math.PI / 2]}
            />
            {[-0.85, 0.85].map((x) => (
              <mesh
                key={x}
                geometry={geometries.strut}
                material={materials.trim}
                position={[x, -0.58, side * 0.76]}
                rotation={[side * 0.08, 0, 0]}
              />
            ))}
          </group>
        ))}

        {/* Luces de navegación y balizas */}
        <mesh geometry={geometries.light} material={materials.red} position={[1.62, 0.2, 0.74]} scale={2.1} />
        <mesh geometry={geometries.light} material={materials.green} position={[1.62, 0.2, -0.74]} scale={2.1} />
        <mesh geometry={geometries.light} material={materials.white} position={[-2.6, 0.46, 0]} scale={1.8} />
        <mesh geometry={geometries.light} material={materials.cyan} position={[-3.33, 1.4, 0]} scale={1.8} />
        <mesh geometry={geometries.light} material={materials.cyan} position={[0.4, -0.88, 0]} scale={2.2} />
        <mesh geometry={geometries.box} material={materials.cyan} position={[0.15, -0.82, 0]} scale={[2.8, 0.035, 0.18]} />

        {/* Torreta de sensores y foco de búsqueda */}
        <mesh geometry={geometries.sphere} material={materials.hullDark} position={[1.55, -0.5, 0]} scale={[0.22, 0.2, 0.22]} />
        <mesh geometry={geometries.lens} material={materials.cyan} position={[1.76, -0.5, 0]} rotation={[0, 0, -Math.PI / 2]} />
        <group position={[0.55, -0.86, 0]} rotation={[0, 0, 0.32]}>
          <mesh geometry={geometries.search} material={materials.trim} />
          <mesh geometry={geometries.beam} material={materials.beam} position={[0, -4.1, 0]} />
        </group>

        {/* Anillos de acento */}
        <mesh
          geometry={geometries.band}
          material={materials.glow}
          position={[-0.35, 0.12, 0]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[0.9, 0.9, 1]}
        />
        <mesh
          geometry={geometries.band}
          material={materials.glow}
          position={[-1.15, 0.12, 0]}
          rotation={[0, Math.PI / 2, 0]}
        />
      </group>
    </group>
  )
}

export function AirTraffic({ day = false }: { day?: boolean }) {
  return (
    <group>
      {ORBITS.map((orbit) => (
        <Helicopter key={`${orbit.center[0]}-${orbit.center[1]}`} orbit={orbit} day={day} />
      ))}
    </group>
  )
}
