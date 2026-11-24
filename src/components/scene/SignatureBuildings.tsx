import { Line } from '@react-three/drei'
import * as THREE from 'three'

const CYAN = '#7fe8f6'
const VIOLET = '#b5a6ff'
const AMBER = '#f3ca86'

type Vec3 = [number, number, number]

/** Light values are chosen independently for day and night. */
function pick(day: boolean, night: string, light: string) {
  return day ? light : night
}

function Plaza({ day, accent, width, depth }: { day: boolean; accent: string; width: number; depth: number }) {
  const halfW = width / 2
  const halfD = depth / 2
  const beacons: { position: Vec3; rotation: number; length: number }[] = [
    { position: [0, 0.17, -halfD + 1.2], rotation: 0, length: width * 0.34 },
    { position: [0, 0.17, halfD - 1.2], rotation: 0, length: width * 0.34 },
    { position: [-halfW + 1.2, 0.17, 0], rotation: Math.PI / 2, length: depth * 0.34 },
    { position: [halfW - 1.2, 0.17, 0], rotation: Math.PI / 2, length: depth * 0.34 },
  ]

  return (
    <group>
      <mesh position={[0, 0.07, 0]} receiveShadow>
        <boxGeometry args={[width, 0.14, depth]} />
        <meshStandardMaterial color={day ? '#455156' : '#090f13'} roughness={0.95} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.27, 0]} receiveShadow>
        <boxGeometry args={[width - 3.2, 0.42, depth - 3.2]} />
        <meshStandardMaterial color={day ? '#596468' : '#101a20'} roughness={0.85} metalness={0.24} />
      </mesh>
      <Line
        points={[
          [-halfW + 1.1, 0.15, -halfD + 1.1],
          [halfW - 1.1, 0.15, -halfD + 1.1],
          [halfW - 1.1, 0.15, halfD - 1.1],
          [-halfW + 1.1, 0.15, halfD - 1.1],
          [-halfW + 1.1, 0.15, -halfD + 1.1],
        ]}
        color={accent}
        transparent
        opacity={day ? 0.25 : 0.65}
        lineWidth={0.8}
      />
      {beacons.map((beacon, index) => (
        <mesh key={index} position={beacon.position} rotation={[0, beacon.rotation, 0]}>
          <boxGeometry args={[beacon.length, 0.07, 0.16]} />
          <meshBasicMaterial color={accent} toneMapped={false} transparent opacity={day ? 0.4 : 1} />
        </mesh>
      ))}
    </group>
  )
}

function LitPanel({
  day,
  position,
  size,
  accent,
  intensity = 1.2,
}: {
  day: boolean
  position: Vec3
  size: Vec3
  accent: string
  intensity?: number
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={pick(day, '#101b21', '#93a7ae')}
        emissive={accent}
        emissiveIntensity={day ? 0.08 : intensity}
        metalness={0.35}
        roughness={0.3}
      />
    </mesh>
  )
}

function GlowBar({
  day,
  position,
  size,
  color,
  rotation,
  dayOpacity = 0.28,
  nightOpacity = 0.9,
}: {
  day: boolean
  position: Vec3
  size: Vec3
  color: string
  rotation?: Vec3
  dayOpacity?: number
  nightOpacity?: number
}) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={size} />
      <meshBasicMaterial color={color} toneMapped={false} transparent opacity={day ? dayOpacity : nightOpacity} />
    </mesh>
  )
}

function Beacon({
  day,
  position,
  color = CYAN,
  size = 0.09,
}: {
  day: boolean
  position: Vec3
  color?: string
  size?: number
}) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshBasicMaterial color={color} toneMapped={false} transparent opacity={day ? 0.5 : 1} />
    </mesh>
  )
}

function squareOutline(size: number, y: number): Vec3[] {
  const half = size / 2
  return [
    [-half, y, -half],
    [half, y, -half],
    [half, y, half],
    [-half, y, half],
    [-half, y, -half],
  ]
}

/* ------------------------------------------------------------------ */
/* 1 · Torre circular de vidrio · Zona A                              */
/* ------------------------------------------------------------------ */
function GlassTower({ day }: { day: boolean }) {
  return (
    <group position={[0, 0, 94]}>
      <mesh position={[0, 0.07, 0]} receiveShadow>
        <cylinderGeometry args={[12.5, 12.5, 0.14, 48]} />
        <meshStandardMaterial color={day ? '#455156' : '#090f13'} roughness={0.95} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.27, 0]} receiveShadow>
        <cylinderGeometry args={[11, 11.4, 0.42, 48]} />
        <meshStandardMaterial color={day ? '#596468' : '#101a20'} roughness={0.85} metalness={0.24} />
      </mesh>
      <mesh position={[0, 0.49, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[9.8, 10.15, 64]} />
        <meshBasicMaterial color={CYAN} toneMapped={false} transparent opacity={day ? 0.24 : 0.7} />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((index) => {
        const angle = (index / 6) * Math.PI * 2
        return <Beacon key={index} day={day} position={[Math.cos(angle) * 11.5, 0.2, Math.sin(angle) * 11.5]} size={0.1} />
      })}

      <group position={[0, 0.48, 0]}>
        <mesh position={[0, 14, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[4.8, 5.15, 28, 24]} />
          <meshStandardMaterial
            color={pick(day, '#122e39', '#8aa8b3')}
            emissive={CYAN}
            emissiveIntensity={day ? 0.06 : 0.22}
            metalness={day ? 0.35 : 0.68}
            roughness={day ? 0.32 : 0.22}
          />
        </mesh>

        {[0, 1, 2, 3, 4, 5].map((index) => {
          const angle = (index / 6) * Math.PI * 2
          return (
            <mesh
              key={`fin-${index}`}
              position={[Math.cos(angle) * 5.02, 14, Math.sin(angle) * 5.02]}
              rotation={[0, -angle, 0]}
              castShadow
            >
              <boxGeometry args={[0.2, 27.2, 0.62]} />
              <meshStandardMaterial
                color={pick(day, '#50666e', '#263f48')}
                emissive={CYAN}
                emissiveIntensity={day ? 0.06 : 0.75}
                metalness={0.7}
                roughness={0.3}
              />
            </mesh>
          )
        })}

        {[6, 12, 18, 24].map((y, index) => (
          <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[5.15 - (y / 28) * 0.35 + 0.06, 0.055, 5, 40]} />
            <meshBasicMaterial
              color={CYAN}
              toneMapped={false}
              transparent
              opacity={day ? 0.3 : index % 2 === 0 ? 0.9 : 0.55}
            />
          </mesh>
        ))}

        <mesh position={[0, 28.55, 0]} castShadow>
          <cylinderGeometry args={[5.0, 5.35, 1.1, 24]} />
          <meshStandardMaterial color={pick(day, '#66757b', '#7b8c93')} metalness={0.82} roughness={0.28} />
        </mesh>
        <mesh position={[0, 29.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[4.7, 0.06, 5, 40]} />
          <meshBasicMaterial color={CYAN} toneMapped={false} transparent opacity={day ? 0.32 : 0.9} />
        </mesh>
        <mesh position={[0, 29.5, 0]} castShadow>
          <cylinderGeometry args={[3.55, 4.35, 0.7, 24]} />
          <meshStandardMaterial color={pick(day, '#77878d', '#8ba0a8')} metalness={0.8} roughness={0.3} />
        </mesh>

        <mesh position={[0, 29.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[3.35, 32]} />
          <meshStandardMaterial color={pick(day, '#3e4e55', '#122229')} roughness={0.82} metalness={0.3} />
        </mesh>
        <mesh position={[0, 29.93, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[3.1, 0.05, 5, 36]} />
          <meshBasicMaterial color={CYAN} toneMapped={false} transparent opacity={day ? 0.4 : 0.95} />
        </mesh>
        <GlowBar day position={[-0.65, 29.96, 0]} size={[0.34, 0.05, 2.0]} color="#d9fbff" dayOpacity={0.8} nightOpacity={1} />
        <GlowBar day position={[0.65, 29.96, 0]} size={[0.34, 0.05, 2.0]} color="#d9fbff" dayOpacity={0.8} nightOpacity={1} />
        <GlowBar day position={[0, 29.96, 0]} size={[1.64, 0.05, 0.34]} color="#d9fbff" dayOpacity={0.8} nightOpacity={1} />
        {[0, 1, 2, 3].map((index) => {
          const angle = (index / 4) * Math.PI * 2 + Math.PI / 4
          return <Beacon key={index} day={day} position={[Math.cos(angle) * 4.7, 29.3, Math.sin(angle) * 4.7]} />
        })}

        <LitPanel day position={[0, 1.5, -5.1]} size={[4.4, 2.9, 0.16]} accent={CYAN} intensity={1.3} />
        <mesh position={[0, 3.18, -5.4]}>
          <boxGeometry args={[6.0, 0.18, 1.7]} />
          <meshStandardMaterial
            color={pick(day, '#3d5158', '#2c424b')}
            emissive={CYAN}
            emissiveIntensity={day ? 0.06 : 0.4}
            metalness={0.6}
            roughness={0.4}
          />
        </mesh>
        <mesh position={[0, 3.06, -5.4]}>
          <boxGeometry args={[5.4, 0.06, 1.2]} />
          <meshBasicMaterial color={CYAN} toneMapped={false} transparent opacity={day ? 0.35 : 0.95} />
        </mesh>
        <mesh position={[0, 4.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[5.24, 0.04, 4, 48]} />
          <meshBasicMaterial color={CYAN} toneMapped={false} transparent opacity={day ? 0.22 : 0.7} />
        </mesh>
      </group>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* 2 · Zigurat escalonado · Zona A                                    */
/* ------------------------------------------------------------------ */
function SteppedZiggurat({ day }: { day: boolean }) {
  const levels = [
    { width: 18, height: 7.6, base: 0 },
    { width: 14, height: 6.0, base: 7.6 },
    { width: 10.2, height: 4.8, base: 13.6 },
    { width: 6.4, height: 3.6, base: 18.4 },
  ]
  const frontWindows: { position: Vec3; size: Vec3 }[] = [
    { position: [-5.2, 4.8, 9.06], size: [2.2, 1.0, 0.09] },
    { position: [0, 4.8, 9.06], size: [2.2, 1.0, 0.09] },
    { position: [5.2, 4.8, 9.06], size: [2.2, 1.0, 0.09] },
    { position: [-3.5, 10.4, 7.06], size: [2.1, 1.0, 0.09] },
    { position: [3.5, 10.4, 7.06], size: [2.1, 1.0, 0.09] },
    { position: [-2.4, 15.4, 5.16], size: [1.8, 0.85, 0.09] },
    { position: [2.4, 15.4, 5.16], size: [1.8, 0.85, 0.09] },
    { position: [0, 19.8, 3.26], size: [1.9, 0.9, 0.09] },
  ]

  return (
    <group position={[45, 0, -95]}>
      <Plaza day={day} accent={CYAN} width={25} depth={22} />

      <group position={[0, 0.48, 0]}>
        {levels.map((level) => (
          <mesh
            key={level.width}
            position={[0, level.base + level.height / 2, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[level.width, level.height, level.width]} />
            <meshStandardMaterial
              color={pick(day, '#141f25', '#9aa6aa')}
              roughness={day ? 0.7 : 0.48}
              metalness={day ? 0.2 : 0.45}
            />
          </mesh>
        ))}

        {levels.map((level) => (
          <GlowBar
            key={`band-${level.width}`}
            day
            position={[0, level.base + level.height - 0.72, 0]}
            size={[level.width + 0.16, 0.1, level.width + 0.16]}
            color={CYAN}
            dayOpacity={0.22}
            nightOpacity={0.8}
          />
        ))}

        {frontWindows.map((window, index) => (
          <LitPanel
            key={`front-${index}`}
            day
            position={window.position}
            size={window.size}
            accent={AMBER}
            intensity={1.2}
          />
        ))}
        <LitPanel day position={[-9.06, 4.8, 0]} size={[0.09, 1.0, 3.4]} accent={AMBER} intensity={1.1} />
        <LitPanel day position={[9.06, 4.8, 0]} size={[0.09, 1.0, 3.4]} accent={AMBER} intensity={1.1} />
        <LitPanel day position={[-7.06, 10.2, -0.5]} size={[0.09, 0.9, 2.6]} accent={AMBER} intensity={1.05} />
        <LitPanel day position={[7.06, 10.2, -0.5]} size={[0.09, 0.9, 2.6]} accent={AMBER} intensity={1.05} />

        <LitPanel day position={[0, 1.35, 9.07]} size={[3.8, 2.7, 0.1]} accent={CYAN} intensity={1.5} />
        <mesh position={[0, 3.05, 9.65]}>
          <boxGeometry args={[5.6, 0.18, 1.9]} />
          <meshStandardMaterial
            color={pick(day, '#465a61', '#2a414a')}
            emissive={CYAN}
            emissiveIntensity={day ? 0.08 : 0.5}
            metalness={0.6}
            roughness={0.4}
          />
        </mesh>
        <mesh position={[0, 0.15, 9.5]} receiveShadow>
          <boxGeometry args={[6.2, 0.3, 2.2]} />
          <meshStandardMaterial color={pick(day, '#6f7a7e', '#253238')} roughness={0.8} metalness={0.2} />
        </mesh>

        <mesh position={[0, 22.1, 0]} castShadow>
          <boxGeometry args={[6.8, 0.25, 6.8]} />
          <meshStandardMaterial color={pick(day, '#667378', '#32454e')} metalness={0.55} roughness={0.4} />
        </mesh>
        <mesh position={[1.8, 22.72, -1.6]} castShadow>
          <boxGeometry args={[1.6, 1.0, 1.6]} />
          <meshStandardMaterial
            color={pick(day, '#5d6d72', '#24373f')}
            emissive={AMBER}
            emissiveIntensity={day ? 0.04 : 0.25}
            metalness={0.4}
            roughness={0.55}
          />
        </mesh>

        <mesh position={[0, 23.85, 0]}>
          <cylinderGeometry args={[0.1, 0.15, 3.2, 6]} />
          <meshStandardMaterial color="#7a8d94" metalness={0.72} roughness={0.35} />
        </mesh>
        <mesh position={[0, 23.9, 0]}>
          <boxGeometry args={[2.6, 0.08, 0.08]} />
          <meshStandardMaterial color="#7a8d94" metalness={0.72} roughness={0.35} />
        </mesh>
        <mesh position={[0, 24.7, 0]}>
          <boxGeometry args={[0.08, 0.08, 1.8]} />
          <meshStandardMaterial color="#7a8d94" metalness={0.72} roughness={0.35} />
        </mesh>
        <Beacon day position={[0, 25.55, 0]} color={CYAN} size={0.13} />

        <Line points={squareOutline(14.15, 13.68)} color={CYAN} transparent opacity={day ? 0.16 : 0.55} lineWidth={0.7} />
        <Line points={squareOutline(10.35, 18.48)} color={CYAN} transparent opacity={day ? 0.16 : 0.55} lineWidth={0.7} />
        <Line points={squareOutline(6.55, 22.05)} color={CYAN} transparent opacity={day ? 0.16 : 0.55} lineWidth={0.7} />
      </group>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* 3 · Centro de operaciones con cúpula · Zona B                      */
/* ------------------------------------------------------------------ */
function OperationsDome({ day }: { day: boolean }) {
  return (
    <group position={[158, 0, 92]}>
      <Plaza day={day} accent={VIOLET} width={28} depth={12} />

      <group position={[0, 0.48, 0]}>
        <mesh position={[0, 3, 0]} castShadow receiveShadow>
          <boxGeometry args={[18, 6, 12]} />
          <meshStandardMaterial
            color={pick(day, '#1a1c2c', '#9493a8')}
            roughness={day ? 0.62 : 0.4}
            metalness={day ? 0.25 : 0.55}
            emissive={VIOLET}
            emissiveIntensity={day ? 0.03 : 0.12}
          />
        </mesh>
        <mesh position={[0, 6.08, 0]}>
          <boxGeometry args={[18.5, 0.26, 12.5]} />
          <meshStandardMaterial color={pick(day, '#313241', '#6f7482')} metalness={0.6} roughness={0.5} />
        </mesh>

        <Line
          points={[
            [-9.15, 6.23, -6.15],
            [9.15, 6.23, -6.15],
            [9.15, 6.23, 6.15],
            [-9.15, 6.23, 6.15],
            [-9.15, 6.23, -6.15],
          ]}
          color={VIOLET}
          transparent
          opacity={day ? 0.2 : 0.7}
          lineWidth={0.8}
        />

        <LitPanel day position={[-5.4, 4.3, -6.06]} size={[4.2, 1.3, 0.09]} accent={VIOLET} intensity={1.0} />
        <LitPanel day position={[5.4, 4.3, -6.06]} size={[4.2, 1.3, 0.09]} accent={VIOLET} intensity={1.0} />
        <GlowBar day position={[-8.7, 3, -6.03]} size={[0.14, 5.4, 0.1]} color={VIOLET} dayOpacity={0.22} nightOpacity={0.85} />
        <GlowBar day position={[8.7, 3, -6.03]} size={[0.14, 5.4, 0.1]} color={VIOLET} dayOpacity={0.22} nightOpacity={0.85} />

        <mesh position={[0, 6.6, 0]} castShadow>
          <cylinderGeometry args={[8.9, 9.25, 0.8, 32]} />
          <meshStandardMaterial color={pick(day, '#3a354e', '#8a86a0')} metalness={0.62} roughness={0.35} />
        </mesh>
        <mesh position={[0, 7.0, 0]} scale={[1, 0.48, 1]} castShadow receiveShadow>
          <sphereGeometry args={[9, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial
            color={pick(day, '#22203a', '#b3aecb')}
            emissive={VIOLET}
            emissiveIntensity={day ? 0.05 : 0.25}
            metalness={0.65}
            roughness={0.25}
          />
        </mesh>

        {[0, Math.PI / 4, Math.PI / 2, (Math.PI * 3) / 4].map((angle) => (
          <mesh key={angle} position={[0, 7.0, 0]} rotation={[0, angle, 0]} scale={[1, 0.48, 1]}>
            <torusGeometry args={[9.0, 0.055, 4, 30, Math.PI]} />
            <meshBasicMaterial color={VIOLET} toneMapped={false} transparent opacity={day ? 0.2 : 0.8} />
          </mesh>
        ))}
        <mesh position={[0, 7.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[8.96, 0.05, 4, 48]} />
          <meshBasicMaterial color={VIOLET} toneMapped={false} transparent opacity={day ? 0.2 : 0.7} />
        </mesh>
        <mesh position={[0, 9.78, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[6.9, 0.045, 4, 40]} />
          <meshBasicMaterial color={VIOLET} toneMapped={false} transparent opacity={day ? 0.16 : 0.6} />
        </mesh>

        <mesh position={[0, 11.5, 0]} castShadow>
          <cylinderGeometry args={[1.0, 1.5, 0.5, 16]} />
          <meshStandardMaterial color={pick(day, '#52526a', '#8f96a8')} metalness={0.72} roughness={0.3} />
        </mesh>
        <Beacon day position={[0, 11.83, 0]} color={VIOLET} size={0.12} />
        <mesh position={[0, 13.2, 0]}>
          <cylinderGeometry args={[0.06, 0.12, 3.0, 6]} />
          <meshStandardMaterial color="#7d879c" metalness={0.7} roughness={0.4} />
        </mesh>
        <Beacon day position={[0, 14.85, 0]} color={VIOLET} size={0.12} />

        {[
          { position: [-7.0, 7.52, -3.2] as Vec3, height: 2.6, tip: 8.9 },
          { position: [7.0, 7.82, 3.0] as Vec3, height: 3.2, tip: 9.5 },
        ].map((mast) => (
          <group key={mast.position[0]}>
            <mesh position={mast.position}>
              <cylinderGeometry args={[0.07, 0.12, mast.height, 6]} />
              <meshStandardMaterial color="#818b9e" metalness={0.7} roughness={0.4} />
            </mesh>
            <Beacon day position={[mast.position[0], mast.tip, mast.position[2]]} color={VIOLET} size={0.1} />
          </group>
        ))}

        <mesh position={[6.6, 6.75, -3.0]}>
          <cylinderGeometry args={[0.08, 0.12, 1.0, 6]} />
          <meshStandardMaterial color="#6d788c" metalness={0.7} roughness={0.4} />
        </mesh>
        <mesh position={[6.6, 7.4, -3.0]} rotation={[-0.9, 0.6, 0]}>
          <cylinderGeometry args={[0.95, 0.18, 0.3, 18, 1, true]} />
          <meshStandardMaterial
            color="#8e95a8"
            metalness={0.65}
            roughness={0.35}
            side={THREE.DoubleSide}
          />
        </mesh>

        <LitPanel day position={[0, 1.45, -6.07]} size={[3.8, 2.7, 0.1]} accent={VIOLET} intensity={1.7} />
        <mesh position={[0, 3.2, -7.0]}>
          <boxGeometry args={[7.0, 0.2, 2.2]} />
          <meshStandardMaterial
            color={pick(day, '#3b3850', '#2a2a3e')}
            emissive={VIOLET}
            emissiveIntensity={day ? 0.06 : 0.45}
            metalness={0.55}
            roughness={0.4}
          />
        </mesh>
        <mesh position={[0, 3.08, -7.0]}>
          <boxGeometry args={[6.4, 0.07, 1.5]} />
          <meshBasicMaterial color={VIOLET} toneMapped={false} transparent opacity={day ? 0.3 : 0.95} />
        </mesh>
        <mesh position={[0, 0.15, -6.7]} receiveShadow>
          <boxGeometry args={[8.0, 0.3, 2.8]} />
          <meshStandardMaterial color={pick(day, '#666b7c', '#262838')} roughness={0.82} metalness={0.2} />
        </mesh>
        <GlowBar day position={[-2.6, 1.5, -6.12]} size={[0.12, 2.8, 0.1]} color={VIOLET} dayOpacity={0.28} nightOpacity={0.9} />
        <GlowBar day position={[2.6, 1.5, -6.12]} size={[0.12, 2.8, 0.1]} color={VIOLET} dayOpacity={0.28} nightOpacity={0.9} />
      </group>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* 4 · Torres gemelas con puente · Zona B                             */
/* ------------------------------------------------------------------ */
function TwinTowers({ day }: { day: boolean }) {
  const towers = [
    { x: -7.2, height: 34, bands: [11.5, 23.5] },
    { x: 7.2, height: 30, bands: [10.0, 20.0] },
  ]

  return (
    <group position={[205, 0, 93]}>
      <Plaza day={day} accent={VIOLET} width={34} depth={20} />

      <group position={[0, 0.48, 0]}>
        {towers.map((tower) => (
          <group key={tower.x}>
            <mesh position={[tower.x, 0.35, 0]} receiveShadow>
              <boxGeometry args={[6.6, 0.7, 6.4]} />
              <meshStandardMaterial color={pick(day, '#626874', '#161a26')} roughness={0.78} metalness={0.25} />
            </mesh>
            <mesh position={[tower.x, tower.height / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[5.8, tower.height, 5.6]} />
              <meshStandardMaterial
                color={pick(day, '#191c2d', '#9bb1ba')}
                emissive={VIOLET}
                emissiveIntensity={day ? 0.04 : 0.14}
                metalness={day ? 0.45 : 0.75}
                roughness={day ? 0.45 : 0.26}
              />
            </mesh>

            {[-1.9, 1.9].map((offset) => (
              <GlowBar
                key={`strip-${offset}`}
                day
                position={[tower.x + offset, tower.height / 2, -2.86]}
                size={[0.14, tower.height - 4, 0.1]}
                color={VIOLET}
                dayOpacity={0.24}
                nightOpacity={0.9}
              />
            ))}
            {tower.bands.map((y) => (
              <GlowBar
                key={`band-${y}`}
                day
                position={[tower.x, y, 0]}
                size={[6.0, 0.12, 5.8]}
                color={VIOLET}
                dayOpacity={0.18}
                nightOpacity={0.7}
              />
            ))}

            <mesh position={[tower.x, tower.height + 0.35, 0]} castShadow>
              <boxGeometry args={[6.2, 0.7, 6.0]} />
              <meshStandardMaterial color={pick(day, '#6b7280', '#5f6b82')} metalness={0.7} roughness={0.35} />
            </mesh>
            <mesh position={[tower.x, tower.height + 1.9, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
              <boxGeometry args={[0.3, 2.4, 4.6]} />
              <meshStandardMaterial
                color={pick(day, '#8e95a4', '#5f6d86')}
                emissive={VIOLET}
                emissiveIntensity={day ? 0.02 : 0.3}
                metalness={0.74}
                roughness={0.3}
              />
            </mesh>
            <Beacon day position={[tower.x, tower.height + 3.2, 0]} color={VIOLET} size={0.11} />

            <LitPanel day position={[tower.x, 1.4, -2.88]} size={[2.8, 2.6, 0.1]} accent={VIOLET} intensity={1.5} />
            <mesh position={[tower.x, 3.2, -3.25]}>
              <boxGeometry args={[4.2, 0.16, 1.4]} />
              <meshStandardMaterial
                color={pick(day, '#4a495c', '#282b3c')}
                emissive={VIOLET}
                emissiveIntensity={day ? 0.05 : 0.35}
                metalness={0.55}
                roughness={0.4}
              />
            </mesh>
          </group>
        ))}

        <mesh position={[0, 22.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[9.2, 2.5, 3.3]} />
          <meshStandardMaterial
            color={pick(day, '#26253a', '#b2a8d8')}
            emissive={VIOLET}
            emissiveIntensity={day ? 0.08 : 0.55}
            metalness={0.62}
            roughness={0.18}
            transparent
            opacity={0.88}
          />
        </mesh>
        <GlowBar day position={[0, 23.8, 0]} size={[9.4, 0.1, 3.5]} color={VIOLET} dayOpacity={0.3} nightOpacity={0.95} />
        <GlowBar day position={[0, 21.2, 0]} size={[9.4, 0.1, 3.5]} color={VIOLET} dayOpacity={0.24} nightOpacity={0.8} />
        {[-2.4, 0, 2.4].map((x) => (
          <mesh key={x} position={[x, 22.5, -1.68]}>
            <boxGeometry args={[0.1, 2.5, 0.12]} />
            <meshStandardMaterial color={pick(day, '#6a6a7c', '#3a3e52')} metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
        <Beacon day position={[-4.3, 23.9, 0]} color={VIOLET} size={0.09} />
        <Beacon day position={[4.3, 23.9, 0]} color={VIOLET} size={0.09} />
      </group>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* 5 · Terrazas verdes · Zona C                                       */
/* ------------------------------------------------------------------ */
function GreenTerraces({ day }: { day: boolean }) {
  const levels = [
    { width: 24, depth: 18, height: 7.0, base: 0, z: 0 },
    { width: 20, depth: 14, height: 5.2, base: 7.26, z: -0.8 },
    { width: 15, depth: 11, height: 4.2, base: 12.72, z: -1.8 },
    { width: 10, depth: 7, height: 2.82, base: 17.18, z: -2.8 },
  ]
  const frontWindows: { position: Vec3; size: Vec3 }[] = [
    { position: [-5.2, 4.4, 9.06], size: [2.6, 1.1, 0.09] },
    { position: [5.2, 4.4, 9.06], size: [2.6, 1.1, 0.09] },
    { position: [-3.8, 9.9, 6.26], size: [2.4, 1.0, 0.09] },
    { position: [3.8, 9.9, 6.26], size: [2.4, 1.0, 0.09] },
    { position: [-2.6, 14.8, 3.76], size: [2.0, 0.9, 0.09] },
    { position: [2.6, 14.8, 3.76], size: [2.0, 0.9, 0.09] },
    { position: [0, 18.5, 0.76], size: [2.2, 0.85, 0.09] },
  ]

  return (
    <group position={[-160, 0, 35]}>
      <Plaza day={day} accent={AMBER} width={30} depth={18} />

      <group position={[0, 0.48, 0]}>
        {levels.map((level) => (
          <mesh key={level.width} position={[0, level.base + level.height / 2, level.z]} castShadow receiveShadow>
            <boxGeometry args={[level.width, level.height, level.depth]} />
            <meshStandardMaterial
              color={pick(day, '#1a1813', '#aa9d89')}
              emissive={AMBER}
              emissiveIntensity={day ? 0.02 : 0.08}
              roughness={day ? 0.74 : 0.55}
              metalness={day ? 0.28 : 0.36}
            />
          </mesh>
        ))}

        {levels.map((level) => (
          <mesh key={`green-${level.width}`} position={[0, level.base + level.height + 0.14, level.z]} receiveShadow>
            <boxGeometry args={[level.width + 0.7, 0.28, level.depth + 0.7]} />
            <meshStandardMaterial
              color={pick(day, '#15382a', '#638c67')}
              emissive="#1f4a35"
              emissiveIntensity={day ? 0.04 : 0.2}
              roughness={0.92}
              metalness={0.02}
            />
          </mesh>
        ))}

        {levels.map((level) => (
          <GlowBar
            key={`edge-${level.width}`}
            day
            position={[0, level.base + level.height + 0.16, level.z + level.depth / 2 + 0.42]}
            size={[level.width + 0.3, 0.06, 0.12]}
            color={AMBER}
            dayOpacity={0.26}
            nightOpacity={0.9}
          />
        ))}

        {frontWindows.map((window, index) => (
          <LitPanel
            key={`window-${index}`}
            day
            position={window.position}
            size={window.size}
            accent={AMBER}
            intensity={1.1}
          />
        ))}
        <LitPanel day position={[-12.06, 4.4, 2.0]} size={[0.09, 1.1, 3.0]} accent={AMBER} intensity={1.0} />
        <LitPanel day position={[12.06, 4.4, 2.0]} size={[0.09, 1.1, 3.0]} accent={AMBER} intensity={1.0} />
        <LitPanel day position={[-10.06, 9.9, -0.8]} size={[0.09, 1.0, 2.4]} accent={AMBER} intensity={0.95} />
        <LitPanel day position={[10.06, 9.9, -0.8]} size={[0.09, 1.0, 2.4]} accent={AMBER} intensity={0.95} />

        <LitPanel day position={[0, 1.5, 9.06]} size={[4.2, 3.0, 0.1]} accent={AMBER} intensity={1.6} />
        <mesh position={[0, 3.35, 9.7]}>
          <boxGeometry args={[5.8, 0.2, 2.0]} />
          <meshStandardMaterial
            color={pick(day, '#584a35', '#3c3224')}
            emissive={AMBER}
            emissiveIntensity={day ? 0.05 : 0.42}
            metalness={0.5}
            roughness={0.45}
          />
        </mesh>
        <mesh position={[0, 3.22, 9.7]}>
          <boxGeometry args={[5.0, 0.06, 1.5]} />
          <meshBasicMaterial color={AMBER} toneMapped={false} transparent opacity={day ? 0.3 : 0.95} />
        </mesh>
        <GlowBar day position={[-2.55, 1.7, 9.11]} size={[0.12, 3.4, 0.08]} color={AMBER} dayOpacity={0.24} nightOpacity={0.9} />
        <GlowBar day position={[2.55, 1.7, 9.11]} size={[0.12, 3.4, 0.08]} color={AMBER} dayOpacity={0.24} nightOpacity={0.9} />

        {[-3, 0, 3].map((x) => (
          <mesh key={`solar-${x}`} position={[x, 20.72, -1.2]} rotation={[-0.42, 0, 0]} castShadow>
            <boxGeometry args={[2.6, 0.08, 1.6]} />
            <meshStandardMaterial
              color={pick(day, '#13253a', '#22384c')}
              emissive="#2b5f86"
              emissiveIntensity={day ? 0.1 : 0.32}
              metalness={0.62}
              roughness={0.3}
            />
          </mesh>
        ))}
        <mesh position={[3.0, 20.92, -4.4]} castShadow>
          <boxGeometry args={[2.2, 1.2, 1.8]} />
          <meshStandardMaterial
            color={pick(day, '#6b5d46', '#2c2a22')}
            emissive={AMBER}
            emissiveIntensity={day ? 0.02 : 0.16}
            metalness={0.35}
            roughness={0.6}
          />
        </mesh>
      </group>
    </group>
  )
}

export function SignatureBuildings({ day = false }: { day?: boolean }) {
  return (
    <group>
      <GlassTower day={day} />
      <SteppedZiggurat day={day} />
      <OperationsDome day={day} />
      <TwinTowers day={day} />
      <GreenTerraces day={day} />
    </group>
  )
}
