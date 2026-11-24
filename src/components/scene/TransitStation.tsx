import { useMemo } from 'react'
import * as THREE from 'three'

const STATION_X = -19
const STATION_Z = 88

function MetroMark({ day }: { day: boolean }) {
  const glow = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#8fe9f4', toneMapped: false, transparent: true, opacity: day ? 0.7 : 1 }),
    [day],
  )
  const body = useMemo(
    () => new THREE.MeshStandardMaterial({ color: day ? '#233b46' : '#0d2029', roughness: 0.3, metalness: 0.5 }),
    [day],
  )

  return (
    <group position={[0, 4.8, -3.42]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3.8, 2.0, 0.16]} />
        <primitive object={body} attach="material" />
      </mesh>
      <mesh position={[-0.86, 0, -0.1]}>
        <boxGeometry args={[0.22, 1.1, 0.08]} />
        <primitive object={glow} attach="material" />
      </mesh>
      <mesh position={[0.86, 0, -0.1]}>
        <boxGeometry args={[0.22, 1.1, 0.08]} />
        <primitive object={glow} attach="material" />
      </mesh>
      <mesh position={[-0.42, 0, -0.1]} rotation={[0, 0, -0.55]}>
        <boxGeometry args={[0.16, 0.92, 0.08]} />
        <primitive object={glow} attach="material" />
      </mesh>
      <mesh position={[0.42, 0, -0.1]} rotation={[0, 0, 0.55]}>
        <boxGeometry args={[0.16, 0.92, 0.08]} />
        <primitive object={glow} attach="material" />
      </mesh>
    </group>
  )
}

export function TransitStation({ day = false }: { day?: boolean }) {
  return (
    <group position={[STATION_X, 0, STATION_Z]}>
      <mesh position={[0, 0.055, 0]} receiveShadow>
        <boxGeometry args={[9, 0.11, 8]} />
        <meshStandardMaterial color={day ? '#5f6d70' : '#18252b'} roughness={0.9} metalness={0.12} />
      </mesh>
      <mesh position={[0, 0.12, 0]} receiveShadow>
        <boxGeometry args={[8.2, 0.05, 7.2]} />
        <meshStandardMaterial color={day ? '#6f7d7f' : '#1f2d33'} roughness={0.86} metalness={0.12} />
      </mesh>

      {/* Acceso al andén */}
      <mesh position={[0, 0.15, 0.7]}>
        <boxGeometry args={[3.9, 0.12, 2.3]} />
        <meshStandardMaterial color={day ? '#4d5b5f' : '#111c21'} roughness={0.9} />
      </mesh>
      {[0, 1, 2, 3, 4].map((step) => (
        <mesh key={step} position={[0, 0.14 - step * 0.11, 0.7 + step * 0.34]}>
          <boxGeometry args={[3.5 - step * 0.25, 0.1, 0.34]} />
          <meshStandardMaterial color={day ? '#879294' : '#33454c'} roughness={0.85} />
        </mesh>
      ))}
      <mesh position={[0, 0.2, 2.0]}>
        <boxGeometry args={[4.2, 0.14, 0.12]} />
        <meshStandardMaterial color={day ? '#a5b1b2' : '#53666c'} metalness={0.55} roughness={0.35} />
      </mesh>
      {[-1.65, 1.65].map((x) => (
        <mesh key={x} position={[x, 0.75, 0.2]}>
          <boxGeometry args={[0.08, 1.3, 0.08]} />
          <meshStandardMaterial color={day ? '#728186' : '#3a4b52'} metalness={0.6} roughness={0.4} />
        </mesh>
      ))}

      {/* Marquesina y pérgola */}
      {[
        [-2.7, -2.2],
        [2.7, -2.2],
        [-2.7, 2.2],
        [2.7, 2.2],
      ].map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[x, 2.1, z]}>
          <cylinderGeometry args={[0.09, 0.12, 4.2, 8]} />
          <meshStandardMaterial color={day ? '#6a7a80' : '#30434b'} metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 4.2, 0]} receiveShadow>
        <boxGeometry args={[6.4, 0.18, 5.2]} />
        <meshStandardMaterial color={day ? '#899598' : '#20323a'} metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 4.32, 0]}>
        <boxGeometry args={[5.8, 0.06, 4.6]} />
        <meshStandardMaterial
          color={day ? '#2e5368' : '#0b2a3c'}
          emissive="#2f7fa8"
          emissiveIntensity={day ? 0.22 : 0.7}
          metalness={0.45}
          roughness={0.3}
        />
      </mesh>
      <MetroMark day={day} />

      {/* Elevador y mapa */}
      <group position={[-3.1, 0, -1.7]}>
        <mesh position={[0, 1.45, 0]}>
          <boxGeometry args={[1.35, 2.9, 1.35]} />
          <meshStandardMaterial color={day ? '#6b7c82' : '#293b43'} metalness={0.55} roughness={0.35} />
        </mesh>
        <mesh position={[0, 1.45, 0.69]}>
          <boxGeometry args={[1.0, 2.45, 0.05]} />
          <meshStandardMaterial
            color={day ? '#2b5363' : '#0b2835'}
            emissive="#67d8e4"
            emissiveIntensity={day ? 0.2 : 0.8}
            metalness={0.4}
            roughness={0.25}
          />
        </mesh>
      </group>
      <group position={[3.0, 0, -1.9]}>
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[1.5, 2.5, 0.16]} />
          <meshStandardMaterial color={day ? '#33484f' : '#13252d'} emissive="#4fb9c8" emissiveIntensity={day ? 0.16 : 0.65} metalness={0.4} roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.5, 0.09]}>
          <boxGeometry args={[1.2, 2.1, 0.04]} />
          <meshBasicMaterial color={day ? '#8edbe2' : '#7ee8f4'} transparent opacity={day ? 0.26 : 0.5} toneMapped={false} />
        </mesh>
      </group>

      {/* Bancas y luminarias */}
      {[-1.9, 1.9].map((x) => (
        <group key={x} position={[x, 0, 2.6]}>
          <mesh position={[0, 0.42, 0]}>
            <boxGeometry args={[1.5, 0.14, 0.46]} />
            <meshStandardMaterial color={day ? '#8b6c4a' : '#5a4633'} roughness={0.82} />
          </mesh>
          <mesh position={[0, 0.68, -0.2]}>
            <boxGeometry args={[1.5, 0.42, 0.08]} />
            <meshStandardMaterial color={day ? '#8b6c4a' : '#5a4633'} roughness={0.82} />
          </mesh>
          {[-0.55, 0.55].map((lx) => (
            <mesh key={lx} position={[lx, 0.2, 0]}>
              <boxGeometry args={[0.08, 0.4, 0.38]} />
              <meshStandardMaterial color={day ? '#4f5e64' : '#2b3a40'} metalness={0.55} roughness={0.5} />
            </mesh>
          ))}
        </group>
      ))}
      {[-3.3, 3.3].map((x) => (
        <group key={x} position={[x, 0, 3.1]}>
          <mesh position={[0, 1.55, 0]}>
            <cylinderGeometry args={[0.05, 0.08, 3.1, 6]} />
            <meshStandardMaterial color={day ? '#728186' : '#3a4b52'} metalness={0.6} roughness={0.45} />
          </mesh>
          <mesh position={[0, 3.18, 0]}>
            <sphereGeometry args={[0.16, 9, 9]} />
            <meshBasicMaterial color={day ? '#e9e2cf' : '#ffdaa3'} toneMapped={false} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 0.6, -3.0]}>
        <cylinderGeometry args={[0.08, 0.1, 1.0, 6]} />
        <meshStandardMaterial color={day ? '#728186' : '#3a4b52'} metalness={0.6} roughness={0.45} />
      </mesh>
      <mesh position={[0, 1.18, -3.0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.6, 24]} />
        <meshBasicMaterial color="#79e3f2" transparent opacity={day ? 0.35 : 0.7} toneMapped={false} />
      </mesh>
    </group>
  )
}
