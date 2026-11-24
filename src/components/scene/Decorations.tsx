import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

type Vec3 = [number, number, number]
type Placement = { x: number; z: number; scale: number }
type ReedPlacement = { x: number; z: number; height: number }
type FlowerPlacement = { x: number; y: number; z: number; scale: number }
type BenchPlacement = { x: number; z: number; rotation: number }
type LampPlacement = { x: number; z: number; glow: string }
type PotPlacement = { x: number; z: number }
type ParterrePlacement = { x: number; z: number; width: number; depth: number }
type PondPalette = {
  waterDay: string
  waterNight: string
  emissive: string
  bankDay: string
  bankNight: string
  basinDay: string
  basinNight: string
}

const POND_PALETTES: Record<'lagoon' | 'civic', PondPalette> = {
  lagoon: {
    waterDay: '#4f9f95',
    waterNight: '#173f46',
    emissive: '#1f6268',
    bankDay: '#929a94',
    bankNight: '#394548',
    basinDay: '#27534e',
    basinNight: '#071a1f',
  },
  civic: {
    waterDay: '#4fa8b2',
    waterNight: '#183d4b',
    emissive: '#2b7f8e',
    bankDay: '#9aa39e',
    bankNight: '#3f4b4d',
    basinDay: '#244e55',
    basinNight: '#082027',
  },
}

// Vegetation is intentionally kept clear of the road grid and the centre of
// each existing pocket park. Every listed coordinate sits inside its lot.
const SHRUBS: Placement[] = [
  // Zona C · estanque
  { x: -161, z: 71.4, scale: 0.62 },
  { x: -160.9, z: 64.0, scale: 0.55 },
  { x: -157.4, z: 73.4, scale: 0.5 },
  { x: -153.4, z: 73.4, scale: 0.52 },
  { x: -149.6, z: 71.8, scale: 0.48 },
  { x: -149.2, z: 67.8, scale: 0.55 },
  { x: -149.5, z: 64.4, scale: 0.5 },
  { x: -152.6, z: 61.9, scale: 0.55 },
  { x: -159.4, z: 62.0, scale: 0.52 },
  // Zona A · pileta
  { x: 39.4, z: 93.5, scale: 0.5 },
  { x: 44.8, z: 93.3, scale: 0.55 },
  { x: 49.8, z: 93.7, scale: 0.5 },
  { x: 36.9, z: 96.0, scale: 0.48 },
  { x: 36.6, z: 105.2, scale: 0.5 },
  { x: 51.4, z: 97.5, scale: 0.46 },
  { x: 54.6, z: 99.6, scale: 0.52 },
  { x: 54.9, z: 102.5, scale: 0.48 },
  { x: 40.2, z: 105.4, scale: 0.5 },
  { x: 44.8, z: 105.5, scale: 0.52 },
  { x: 48.0, z: 105.2, scale: 0.46 },
  // Zona B · pileta técnica
  { x: 86.2, z: 26.6, scale: 0.48 },
  { x: 86.2, z: 33.4, scale: 0.5 },
  { x: 88.8, z: 23.6, scale: 0.44 },
  { x: 90.8, z: 37.0, scale: 0.5 },
  { x: 94.4, z: 37.0, scale: 0.45 },
  // Grupos adicionales
  { x: -57.0, z: 64.0, scale: 0.55 },
  { x: -57.2, z: 73.2, scale: 0.55 },
  { x: -46.4, z: 64.2, scale: 0.6 },
  { x: -45.8, z: 73.2, scale: 0.6 },
  { x: -54.8, z: 62.9, scale: 0.45 },
  { x: 46.8, z: -64.0, scale: 0.55 },
  { x: 47.2, z: -72.2, scale: 0.55 },
  { x: 57.0, z: -64.2, scale: 0.55 },
  { x: 56.8, z: -72.0, scale: 0.55 },
  { x: 54.2, z: -61.8, scale: 0.45 },
  { x: -168.4, z: 87.4, scale: 0.58 },
  { x: -148.0, z: 87.2, scale: 0.58 },
  { x: -168.2, z: 100.8, scale: 0.55 },
  { x: -148.2, z: 100.9, scale: 0.55 },
  { x: -158.6, z: 84.8, scale: 0.5 },
  { x: -157.4, z: 103.0, scale: 0.48 },
  { x: 106.1, z: 83.2, scale: 0.5 },
  { x: 109.0, z: 83.9, scale: 0.48 },
  { x: 112.4, z: 83.7, scale: 0.5 },
  { x: 114.6, z: 82.3, scale: 0.44 },
  { x: 107.0, z: 85.0, scale: 0.46 },
  { x: -121.2, z: 23.2, scale: 0.5 },
  { x: -120.0, z: 21.6, scale: 0.45 },
  { x: -116.0, z: 22.0, scale: 0.5 },
  { x: -114.4, z: 26.2, scale: 0.5 },
  { x: -115.2, z: 28.8, scale: 0.45 },
  { x: -119.6, z: 28.0, scale: 0.5 },
  { x: 163.4, z: 57.0, scale: 0.5 },
  { x: 163.2, z: 59.2, scale: 0.45 },
  { x: 159.4, z: 59.8, scale: 0.5 },
  { x: 156.8, z: 57.8, scale: 0.5 },
  { x: 156.6, z: 55.0, scale: 0.45 },
  { x: 163.5, z: 53.4, scale: 0.42 },
]

const ROCKS: Placement[] = [
  // Zona C
  { x: -149.7, z: 63.0, scale: 0.35 },
  { x: -149.8, z: 70.2, scale: 0.3 },
  { x: -150.9, z: 72.8, scale: 0.28 },
  { x: -155, z: 74.0, scale: 0.28 },
  { x: -159, z: 72.9, scale: 0.34 },
  { x: -161.3, z: 69.8, scale: 0.32 },
  { x: -161, z: 66.0, scale: 0.3 },
  { x: -154.6, z: 61.6, scale: 0.3 },
  { x: -150.9, z: 62.4, scale: 0.28 },
  { x: -147.8, z: 65.8, scale: 0.3 },
  { x: -147.6, z: 68.8, scale: 0.26 },
  { x: -161.8, z: 72.0, scale: 0.24 },
  // Zona A
  { x: 38.1, z: 97.0, scale: 0.3 },
  { x: 37.8, z: 102.2, scale: 0.28 },
  { x: 38.6, z: 104.8, scale: 0.26 },
  { x: 43.0, z: 105.8, scale: 0.26 },
  { x: 47.0, z: 105.6, scale: 0.24 },
  { x: 50.6, z: 103.9, scale: 0.26 },
  { x: 51.7, z: 98.4, scale: 0.28 },
  { x: 50.6, z: 96.7, scale: 0.3 },
  { x: 47.2, z: 96.3, scale: 0.26 },
  { x: 43.0, z: 96.4, scale: 0.28 },
  { x: 39.5, z: 96.5, scale: 0.26 },
  { x: 37.8, z: 99.6, scale: 0.3 },
  // Zona B
  { x: 87.9, z: 24.5, scale: 0.28 },
  { x: 89.8, z: 24.2, scale: 0.26 },
  { x: 92.6, z: 24.1, scale: 0.3 },
  { x: 95.5, z: 24.4, scale: 0.25 },
  { x: 95.7, z: 26.8, scale: 0.28 },
  { x: 95.8, z: 29.0, scale: 0.3 },
  { x: 95.7, z: 31.2, scale: 0.26 },
  { x: 95.6, z: 33.6, scale: 0.3 },
  { x: 94.2, z: 35.8, scale: 0.28 },
  { x: 91.0, z: 35.9, scale: 0.26 },
  { x: 88.8, z: 35.9, scale: 0.3 },
  { x: 87.8, z: 33.8, scale: 0.26 },
  // Grupos adicionales
  { x: -57.7, z: 69.0, scale: 0.32 },
  { x: -48.6, z: 62.6, scale: 0.28 },
  { x: -50.4, z: 73.9, scale: 0.3 },
  { x: 57.6, z: -69.0, scale: 0.3 },
  { x: 48.8, z: -74.0, scale: 0.28 },
  { x: 45.8, z: -66.0, scale: 0.3 },
  { x: -168.9, z: 89.8, scale: 0.32 },
  { x: -147.2, z: 89.2, scale: 0.3 },
  { x: -147.4, z: 98.6, scale: 0.28 },
  { x: -168.4, z: 98.8, scale: 0.3 },
  { x: -158.2, z: 86.2, scale: 0.26 },
  { x: 104.9, z: 82.4, scale: 0.28 },
  { x: 110.2, z: 82.1, scale: 0.24 },
  { x: 115.0, z: 84.6, scale: 0.3 },
  { x: 112.8, z: 85.2, scale: 0.26 },
  { x: -122.0, z: 25.4, scale: 0.32 },
  { x: -117.6, z: 20.8, scale: 0.28 },
  { x: -113.4, z: 24.0, scale: 0.3 },
  { x: -117.0, z: 30.2, scale: 0.28 },
  { x: 165.0, z: 55.4, scale: 0.32 },
  { x: 161.6, z: 52.2, scale: 0.24 },
  { x: 156.8, z: 52.2, scale: 0.28 },
  { x: 166.0, z: 58.2, scale: 0.28 },
]

const REEDS: ReedPlacement[] = [
  // Zona C
  { x: -157.8, z: 62.7, height: 0.8 },
  { x: -157.2, z: 63.2, height: 1.05 },
  { x: -154.4, z: 62.8, height: 0.9 },
  { x: -153.9, z: 63.3, height: 1.2 },
  { x: -149.7, z: 65.4, height: 0.75 },
  { x: -149.4, z: 66.1, height: 1.1 },
  { x: -149.7, z: 69.2, height: 0.95 },
  { x: -149.3, z: 69.9, height: 0.7 },
  { x: -153, z: 73.2, height: 1.05 },
  { x: -152.4, z: 73.6, height: 0.8 },
  { x: -158.2, z: 73.0, height: 0.95 },
  { x: -158.8, z: 72.6, height: 1.15 },
  { x: -161.6, z: 67.2, height: 0.85 },
  { x: -161.5, z: 68.5, height: 1.0 },
  // Zona A
  { x: 40.2, z: 96.7, height: 0.9 },
  { x: 41.1, z: 96.4, height: 1.15 },
  { x: 47.4, z: 96.6, height: 0.8 },
  { x: 48.0, z: 96.8, height: 1.0 },
  { x: 37.6, z: 99.8, height: 0.85 },
  { x: 37.8, z: 100.8, height: 1.1 },
  { x: 37.7, z: 102.0, height: 0.75 },
  { x: 51.7, z: 97.3, height: 0.95 },
  { x: 51.8, z: 98.1, height: 0.8 },
  { x: 42.4, z: 104.8, height: 1.05 },
  { x: 43.6, z: 105.0, height: 0.8 },
  { x: 46.0, z: 105.1, height: 0.9 },
  // Zona B
  { x: 90.0, z: 24.4, height: 0.8 },
  { x: 90.8, z: 24.3, height: 1.0 },
  { x: 93.4, z: 24.3, height: 0.75 },
  { x: 90.2, z: 35.4, height: 0.95 },
  { x: 91.2, z: 35.4, height: 0.8 },
  { x: 93.0, z: 35.4, height: 1.05 },
  { x: 95.7, z: 27.1, height: 0.9 },
  { x: 95.7, z: 28.3, height: 1.1 },
  { x: 95.7, z: 32.0, height: 0.8 },
]

const BENCHES: BenchPlacement[] = [
  { x: -148.9, z: 66.2, rotation: -Math.PI / 2 },
  { x: -148.9, z: 69.8, rotation: -Math.PI / 2 },
  { x: 37.1, z: 98.3, rotation: Math.PI / 2 },
  { x: 37.1, z: 103.7, rotation: Math.PI / 2 },
  { x: 86.9, z: 28.2, rotation: Math.PI / 2 },
  { x: 86.9, z: 31.8, rotation: Math.PI / 2 },
]

const LAMPS: LampPlacement[] = [
  { x: -160.2, z: 62.5, glow: '#ffd7a0' },
  { x: -152, z: 73.6, glow: '#ffd7a0' },
  { x: 37.0, z: 94.4, glow: '#bdeef8' },
  { x: 53.4, z: 97.2, glow: '#bdeef8' },
]

const POTS: PotPlacement[] = [
  { x: -147.9, z: 62.8 },
  { x: -147.7, z: 72.9 },
  { x: 41.4, z: 95.0 },
  { x: 48.4, z: 95.0 },
  { x: 86.4, z: 23.2 },
  { x: 86.4, z: 36.3 },
]

const PARTERRES: ParterrePlacement[] = [
  { x: -157.2, z: 61.2, width: 2.4, depth: 1.2 },
  { x: 54.6, z: 95.0, width: 2.0, depth: 1.0 },
  { x: 92.0, z: 22.8, width: 4.0, depth: 0.9 },
]

const ACCENT_FLOWERS: FlowerPlacement[] = [
  // Zona C
  { x: -174.6, y: 0.07, z: 63.6, scale: 0.85 },
  { x: -174.4, y: 0.07, z: 72.4, scale: 0.75 },
  { x: -168.2, y: 0.07, z: 73.9, scale: 0.8 },
  { x: -164.4, y: 0.07, z: 63.2, scale: 0.7 },
  // Zona A
  { x: 37.2, y: 0.07, z: 100.5, scale: 0.8 },
  { x: 52.9, y: 0.07, z: 103.0, scale: 0.75 },
  { x: 43.4, y: 0.07, z: 95.9, scale: 0.7 },
  { x: 49.8, y: 0.07, z: 95.9, scale: 0.8 },
  // Zona B
  { x: 95.0, y: 0.07, z: 25.3, scale: 0.75 },
  { x: 88.0, y: 0.07, z: 25.0, scale: 0.7 },
  { x: 94.8, y: 0.07, z: 35.0, scale: 0.8 },
  // Grupos adicionales
  { x: -56.3, y: 0.07, z: 65.6, scale: 0.8 },
  { x: -47.0, y: 0.07, z: 65.9, scale: 0.7 },
  { x: -47.8, y: 0.07, z: 73.7, scale: 0.75 },
  { x: -55.2, y: 0.07, z: 71.8, scale: 0.8 },
  { x: 48.4, y: 0.07, z: -65.5, scale: 0.75 },
  { x: 56.0, y: 0.07, z: -65.8, scale: 0.8 },
  { x: 49.4, y: 0.07, z: -71.0, scale: 0.7 },
  { x: 55.8, y: 0.07, z: -70.8, scale: 0.78 },
  { x: -167.2, y: 0.07, z: 88.0, scale: 0.75 },
  { x: -149.4, y: 0.07, z: 88.6, scale: 0.8 },
  { x: -167.0, y: 0.07, z: 99.8, scale: 0.7 },
  { x: -149.8, y: 0.07, z: 100.2, scale: 0.76 },
  { x: 107.0, y: 0.07, z: 82.2, scale: 0.75 },
  { x: 111.4, y: 0.07, z: 82.6, scale: 0.8 },
  { x: 113.6, y: 0.07, z: 84.4, scale: 0.7 },
  { x: 108.0, y: 0.07, z: 84.8, scale: 0.78 },
  { x: -120.2, y: 0.07, z: 22.8, scale: 0.8 },
  { x: -115.2, y: 0.07, z: 23.4, scale: 0.72 },
  { x: -116.2, y: 0.07, z: 27.8, scale: 0.78 },
  { x: -120.4, y: 0.07, z: 27.4, scale: 0.7 },
  { x: 162.4, y: 0.07, z: 57.8, scale: 0.75 },
  { x: 159.0, y: 0.07, z: 58.8, scale: 0.8 },
  { x: 157.4, y: 0.07, z: 56.2, scale: 0.7 },
  { x: 162.8, y: 0.07, z: 54.2, scale: 0.76 },
]

const SHRUB_DAY = ['#4b7050', '#577e56', '#62875c', '#426546', '#6b8c5e']
const SHRUB_NIGHT = ['#214b43', '#28564c', '#305e4e', '#1b3f39', '#35644f']
const ROCK_DAY = ['#818b88', '#737e7c', '#909995', '#6c7775']
const ROCK_NIGHT = ['#445356', '#39484c', '#526065', '#333f43']
const REED_DAY = ['#5d8048', '#6f9150', '#547742', '#7a995e']
const REED_NIGHT = ['#2d5342', '#366048', '#274a3d', '#3d6a4e']
const FLOWER_DAY = ['#e7a1b4', '#f0cf8d', '#e9e7d6', '#b8a7df', '#d58a8a']
const FLOWER_NIGHT = ['#c494ad', '#d0b27f', '#cfd1c4', '#9f92cb', '#b27b84']

function makeOrganicShape(rx: number, rz: number, phase: number) {
  const shape = new THREE.Shape()
  const segments = 48

  for (let index = 0; index <= segments; index += 1) {
    const angle = (index / segments) * Math.PI * 2
    const wobble = 1 + Math.sin(angle * 3 + phase) * 0.04 + Math.cos(angle * 2 - phase) * 0.02
    const x = Math.cos(angle) * rx * wobble
    const y = Math.sin(angle) * rz * wobble

    if (index === 0) shape.moveTo(x, y)
    else shape.lineTo(x, y)
  }

  shape.closePath()
  return shape
}

function makeRoundedRectShape(width: number, depth: number, radius: number) {
  const shape = new THREE.Shape()
  const x = -width / 2
  const y = -depth / 2

  shape.moveTo(x + radius, y)
  shape.lineTo(x + width - radius, y)
  shape.quadraticCurveTo(x + width, y, x + width, y + radius)
  shape.lineTo(x + width, y + depth - radius)
  shape.quadraticCurveTo(x + width, y + depth, x + width - radius, y + depth)
  shape.lineTo(x + radius, y + depth)
  shape.quadraticCurveTo(x, y + depth, x, y + depth - radius)
  shape.lineTo(x, y + radius)
  shape.quadraticCurveTo(x, y, x + radius, y)
  shape.closePath()
  return shape
}

function bedFlowers(bed: ParterrePlacement, count: number): FlowerPlacement[] {
  return Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2 + 0.6
    const radius = 0.35 + (index % 3) * 0.16

    return {
      x: bed.x + Math.cos(angle) * bed.width * radius * 0.3,
      y: 0.31,
      z: bed.z + Math.sin(angle) * bed.depth * radius * 0.3,
      scale: 0.7 + (index % 3) * 0.18,
    }
  })
}

function potFlowers(pot: PotPlacement): FlowerPlacement[] {
  return [
    { x: pot.x - 0.14, y: 0.66, z: pot.z + 0.06, scale: 0.85 },
    { x: pot.x + 0.12, y: 0.67, z: pot.z - 0.1, scale: 0.7 },
    { x: pot.x + 0.03, y: 0.64, z: pot.z + 0.15, scale: 0.65 },
    { x: pot.x - 0.05, y: 0.68, z: pot.z - 0.15, scale: 0.8 },
  ]
}

const FLOWERS: FlowerPlacement[] = [
  ...PARTERRES.flatMap((bed, index) => bedFlowers(bed, index === 2 ? 9 : 6)),
  ...POTS.flatMap(potFlowers),
  ...ACCENT_FLOWERS,
]

function Fountain({ day }: { day: boolean }) {
  const stone = day ? '#a7b1ad' : '#556366'
  const stoneDark = day ? '#7c8886' : '#374649'
  const water = day ? '#86d7dd' : '#2d7182'
  const emissive = day ? '#0b3335' : '#225e6c'

  return (
    <group position={[0, 0.08, 0]}>
      <mesh position={[0, 0.16, 0]} castShadow>
        <cylinderGeometry args={[1.25, 1.4, 0.32, 18]} />
        <meshStandardMaterial color={stoneDark} roughness={0.75} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0.335, 0]}>
        <cylinderGeometry args={[1.08, 1.12, 0.05, 18]} />
        <meshStandardMaterial
          color={water}
          roughness={0.15}
          metalness={0.25}
          emissive={emissive}
          emissiveIntensity={day ? 0.08 : 0.35}
        />
      </mesh>
      <mesh position={[0, 0.54, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.28, 0.38, 10]} />
        <meshStandardMaterial color={stone} roughness={0.7} metalness={0.12} />
      </mesh>
      <mesh position={[0, 0.76, 0]} castShadow>
        <cylinderGeometry args={[0.7, 0.2, 0.18, 16]} />
        <meshStandardMaterial color={stone} roughness={0.65} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0.87, 0]}>
        <cylinderGeometry args={[0.58, 0.58, 0.04, 16]} />
        <meshStandardMaterial
          color={water}
          roughness={0.15}
          metalness={0.25}
          emissive={emissive}
          emissiveIntensity={day ? 0.08 : 0.35}
        />
      </mesh>
      <mesh position={[0, 1.06, 0]}>
        <cylinderGeometry args={[0.035, 0.075, 0.42, 6]} />
        <meshStandardMaterial color={water} emissive={emissive} emissiveIntensity={day ? 0.1 : 0.45} transparent opacity={0.8} />
      </mesh>
      <mesh position={[0, 1.3, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color={day ? '#dffcff' : '#a8f0fa'} toneMapped={false} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.7, 1.74, 40]} />
        <meshBasicMaterial color="#a9f0f8" transparent opacity={day ? 0.24 : 0.42} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.018, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.25, 2.28, 44]} />
        <meshBasicMaterial color="#a9f0f8" transparent opacity={day ? 0.12 : 0.24} depthWrite={false} />
      </mesh>
    </group>
  )
}

function OrganicPond({
  position,
  rx,
  rz,
  phase,
  tone,
  day,
  fountain = false,
}: {
  position: Vec3
  rx: number
  rz: number
  phase: number
  tone: keyof typeof POND_PALETTES
  day: boolean
  fountain?: boolean
}) {
  const waterShape = useMemo(() => makeOrganicShape(rx, rz, phase), [rx, rz, phase])
  const bankShape = useMemo(() => makeOrganicShape(rx + 0.5, rz + 0.5, phase + 0.45), [rx, rz, phase])
  const palette = POND_PALETTES[tone]

  return (
    <group position={position}>
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <shapeGeometry args={[bankShape, 48]} />
        <meshStandardMaterial color={day ? palette.bankDay : palette.bankNight} roughness={0.88} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0.055, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <shapeGeometry args={[waterShape, 48]} />
        <meshStandardMaterial color={day ? palette.basinDay : palette.basinNight} roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.09, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <shapeGeometry args={[waterShape, 48]} />
        <meshStandardMaterial
          color={day ? palette.waterDay : palette.waterNight}
          roughness={0.16}
          metalness={0.28}
          transparent
          opacity={0.92}
          emissive={palette.emissive}
          emissiveIntensity={day ? 0.045 : 0.28}
        />
      </mesh>
      {fountain && <Fountain day={day} />}
    </group>
  )
}

function TechnicalPool({ position, day }: { position: Vec3; day: boolean }) {
  const rimShape = useMemo(() => makeRoundedRectShape(7.8, 9.8, 1.7), [])
  const waterShape = useMemo(() => makeRoundedRectShape(6.9, 8.9, 1.45), [])

  return (
    <group position={position}>
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <shapeGeometry args={[rimShape, 20]} />
        <meshStandardMaterial
          color={day ? '#5b5682' : '#241d3d'}
          emissive="#7b68ee"
          emissiveIntensity={day ? 0.55 : 1.15}
          roughness={0.4}
          metalness={0.25}
        />
      </mesh>
      <mesh position={[0, 0.058, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <shapeGeometry args={[waterShape, 20]} />
        <meshStandardMaterial color={day ? '#1a3946' : '#07141d'} roughness={0.68} />
      </mesh>
      <mesh position={[0, 0.09, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <shapeGeometry args={[waterShape, 20]} />
        <meshStandardMaterial
          color={day ? '#3d7693' : '#162c4a'}
          roughness={0.16}
          metalness={0.3}
          transparent
          opacity={0.9}
          emissive="#4c3f96"
          emissiveIntensity={day ? 0.06 : 0.3}
        />
      </mesh>
    </group>
  )
}

function Shrubs({ day }: { day: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return

    const matrix = new THREE.Matrix4()
    const position = new THREE.Vector3()
    const scale = new THREE.Vector3()
    const quaternion = new THREE.Quaternion()
    const euler = new THREE.Euler()
    const color = new THREE.Color()
    const palette = day ? SHRUB_DAY : SHRUB_NIGHT

    SHRUBS.forEach((shrub, index) => {
      const size = shrub.scale
      position.set(shrub.x, size * 0.44, shrub.z)
      quaternion.setFromEuler(euler.set(0, index * 1.71, 0))
      scale.set(size * 1.05, size * 0.62, size * 0.9)
      matrix.compose(position, quaternion, scale)
      mesh.setMatrixAt(index, matrix)
      mesh.setColorAt(index, color.set(palette[index % palette.length]))
    })

    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [day])

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, SHRUBS.length]} castShadow receiveShadow>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color="#ffffff"
        roughness={0.9}
        flatShading
        emissive={day ? '#000000' : '#0b1f19'}
        emissiveIntensity={day ? 0 : 0.24}
      />
    </instancedMesh>
  )
}

function Rocks({ day }: { day: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return

    const matrix = new THREE.Matrix4()
    const position = new THREE.Vector3()
    const scale = new THREE.Vector3()
    const quaternion = new THREE.Quaternion()
    const euler = new THREE.Euler()
    const color = new THREE.Color()
    const palette = day ? ROCK_DAY : ROCK_NIGHT

    ROCKS.forEach((rock, index) => {
      const size = rock.scale
      position.set(rock.x, size * 0.28, rock.z)
      quaternion.setFromEuler(euler.set(index * 0.4, index * 1.13, index * 0.2))
      scale.set(size * 1.1, size * 0.68, size * 0.92)
      matrix.compose(position, quaternion, scale)
      mesh.setMatrixAt(index, matrix)
      mesh.setColorAt(index, color.set(palette[index % palette.length]))
    })

    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [day])

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, ROCKS.length]} receiveShadow>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#ffffff" roughness={0.95} flatShading />
    </instancedMesh>
  )
}

function Reeds({ day }: { day: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return

    const matrix = new THREE.Matrix4()
    const position = new THREE.Vector3()
    const scale = new THREE.Vector3()
    const quaternion = new THREE.Quaternion()
    const euler = new THREE.Euler()
    const color = new THREE.Color()
    const palette = day ? REED_DAY : REED_NIGHT

    REEDS.forEach((reed, index) => {
      position.set(reed.x, reed.height * 0.5, reed.z)
      quaternion.setFromEuler(euler.set(0, index * 0.93, ((index % 5) - 2) * 0.025))
      scale.set(1.1, reed.height, 1.1)
      matrix.compose(position, quaternion, scale)
      mesh.setMatrixAt(index, matrix)
      mesh.setColorAt(index, color.set(palette[index % palette.length]))
    })

    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [day])

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, REEDS.length]}>
      <coneGeometry args={[0.05, 1, 4]} />
      <meshStandardMaterial color="#ffffff" roughness={0.82} flatShading />
    </instancedMesh>
  )
}

function Flowers({ day }: { day: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return

    const matrix = new THREE.Matrix4()
    const position = new THREE.Vector3()
    const scale = new THREE.Vector3()
    const quaternion = new THREE.Quaternion()
    const color = new THREE.Color()
    const palette = day ? FLOWER_DAY : FLOWER_NIGHT

    FLOWERS.forEach((flower, index) => {
      position.set(flower.x, flower.y, flower.z)
      scale.setScalar(flower.scale)
      matrix.compose(position, quaternion, scale)
      mesh.setMatrixAt(index, matrix)
      mesh.setColorAt(index, color.set(palette[index % palette.length]))
    })

    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [day])

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, FLOWERS.length]}>
      <icosahedronGeometry args={[0.1, 0]} />
      <meshStandardMaterial
        color="#ffffff"
        roughness={0.6}
        flatShading
        emissive={day ? '#000000' : '#1a1626'}
        emissiveIntensity={day ? 0 : 0.2}
      />
    </instancedMesh>
  )
}

function Benches({ day }: { day: boolean }) {
  const seatRef = useRef<THREE.InstancedMesh>(null)
  const backRef = useRef<THREE.InstancedMesh>(null)
  const legRef = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    const seatMesh = seatRef.current
    const backMesh = backRef.current
    const legMesh = legRef.current
    if (!seatMesh || !backMesh || !legMesh) return

    const root = new THREE.Matrix4()
    const part = new THREE.Matrix4()
    const tilt = new THREE.Matrix4().makeRotationX(-0.08)
    const position = new THREE.Vector3()
    const quaternion = new THREE.Quaternion()
    const euler = new THREE.Euler()
    const one = new THREE.Vector3(1, 1, 1)

    BENCHES.forEach((bench, index) => {
      position.set(bench.x, 0, bench.z)
      quaternion.setFromEuler(euler.set(0, bench.rotation, 0))
      root.compose(position, quaternion, one)

      part.makeTranslation(0, 0.45, 0)
      seatMesh.setMatrixAt(index, root.clone().multiply(part))

      part.makeTranslation(0, 0.82, -0.24).multiply(tilt)
      backMesh.setMatrixAt(index, root.clone().multiply(part))

      part.makeTranslation(-0.68, 0.225, 0)
      legMesh.setMatrixAt(index * 2, root.clone().multiply(part))

      part.makeTranslation(0.68, 0.225, 0)
      legMesh.setMatrixAt(index * 2 + 1, root.clone().multiply(part))
    })

    seatMesh.instanceMatrix.needsUpdate = true
    backMesh.instanceMatrix.needsUpdate = true
    legMesh.instanceMatrix.needsUpdate = true
  }, [day])

  const wood = day ? '#8a6d4d' : '#5b4634'
  const metal = day ? '#5a686e' : '#2d3a40'

  return (
    <group>
      <instancedMesh ref={seatRef} args={[undefined, undefined, BENCHES.length]} castShadow>
        <boxGeometry args={[1.8, 0.1, 0.55]} />
        <meshStandardMaterial color={wood} roughness={0.78} metalness={0.08} />
      </instancedMesh>
      <instancedMesh ref={backRef} args={[undefined, undefined, BENCHES.length]} castShadow>
        <boxGeometry args={[1.8, 0.46, 0.08]} />
        <meshStandardMaterial color={wood} roughness={0.78} metalness={0.08} />
      </instancedMesh>
      <instancedMesh ref={legRef} args={[undefined, undefined, BENCHES.length * 2]} castShadow>
        <boxGeometry args={[0.12, 0.45, 0.48]} />
        <meshStandardMaterial color={metal} roughness={0.55} metalness={0.5} />
      </instancedMesh>
    </group>
  )
}

function Lamps({ day }: { day: boolean }) {
  const poleRef = useRef<THREE.InstancedMesh>(null)
  const headRef = useRef<THREE.InstancedMesh>(null)
  const bulbRef = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    const poleMesh = poleRef.current
    const headMesh = headRef.current
    const bulbMesh = bulbRef.current
    if (!poleMesh || !headMesh || !bulbMesh) return

    const matrix = new THREE.Matrix4()
    const position = new THREE.Vector3()
    const quaternion = new THREE.Quaternion()
    const one = new THREE.Vector3(1, 1, 1)
    const color = new THREE.Color()

    LAMPS.forEach((lamp, index) => {
      position.set(lamp.x, 1.4, lamp.z)
      matrix.compose(position, quaternion, one)
      poleMesh.setMatrixAt(index, matrix)

      position.set(lamp.x, 2.9, lamp.z)
      matrix.compose(position, quaternion, one)
      headMesh.setMatrixAt(index, matrix)

      position.set(lamp.x, 2.74, lamp.z)
      matrix.compose(position, quaternion, one)
      bulbMesh.setMatrixAt(index, matrix)
      bulbMesh.setColorAt(index, color.set(day ? '#f0ead9' : lamp.glow))
    })

    poleMesh.instanceMatrix.needsUpdate = true
    headMesh.instanceMatrix.needsUpdate = true
    bulbMesh.instanceMatrix.needsUpdate = true
    if (bulbMesh.instanceColor) bulbMesh.instanceColor.needsUpdate = true
  }, [day])

  const metal = day ? '#7c8a8e' : '#39474d'

  return (
    <group>
      <instancedMesh ref={poleRef} args={[undefined, undefined, LAMPS.length]} castShadow>
        <cylinderGeometry args={[0.055, 0.085, 2.8, 6]} />
        <meshStandardMaterial color={metal} roughness={0.5} metalness={0.55} />
      </instancedMesh>
      <instancedMesh ref={headRef} args={[undefined, undefined, LAMPS.length]} castShadow>
        <boxGeometry args={[0.36, 0.18, 0.36]} />
        <meshStandardMaterial color={metal} roughness={0.42} metalness={0.6} />
      </instancedMesh>
      <instancedMesh ref={bulbRef} args={[undefined, undefined, LAMPS.length]}>
        <sphereGeometry args={[0.11, 8, 8]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </instancedMesh>
    </group>
  )
}

function Pots({ day }: { day: boolean }) {
  const potRef = useRef<THREE.InstancedMesh>(null)
  const soilRef = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    const potMesh = potRef.current
    const soilMesh = soilRef.current
    if (!potMesh || !soilMesh) return

    const matrix = new THREE.Matrix4()
    const position = new THREE.Vector3()
    const quaternion = new THREE.Quaternion()
    const one = new THREE.Vector3(1, 1, 1)

    POTS.forEach((pot, index) => {
      position.set(pot.x, 0.3, pot.z)
      matrix.compose(position, quaternion, one)
      potMesh.setMatrixAt(index, matrix)

      position.set(pot.x, 0.6, pot.z)
      matrix.compose(position, quaternion, one)
      soilMesh.setMatrixAt(index, matrix)
    })

    potMesh.instanceMatrix.needsUpdate = true
    soilMesh.instanceMatrix.needsUpdate = true
  }, [day])

  return (
    <group>
      <instancedMesh ref={potRef} args={[undefined, undefined, POTS.length]} castShadow>
        <cylinderGeometry args={[0.4, 0.32, 0.6, 10]} />
        <meshStandardMaterial color={day ? '#99705a' : '#4b3831'} roughness={0.82} metalness={0.05} />
      </instancedMesh>
      <instancedMesh ref={soilRef} args={[undefined, undefined, POTS.length]}>
        <cylinderGeometry args={[0.34, 0.34, 0.04, 10]} />
        <meshStandardMaterial color={day ? '#3c3024' : '#17130f'} roughness={0.95} />
      </instancedMesh>
    </group>
  )
}

function Parterres({ day }: { day: boolean }) {
  const borderRef = useRef<THREE.InstancedMesh>(null)
  const soilRef = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    const borderMesh = borderRef.current
    const soilMesh = soilRef.current
    if (!borderMesh || !soilMesh) return

    const matrix = new THREE.Matrix4()
    const position = new THREE.Vector3()
    const quaternion = new THREE.Quaternion()
    const scale = new THREE.Vector3()

    PARTERRES.forEach((bed, index) => {
      position.set(bed.x, 0.12, bed.z)
      scale.set(bed.width, 0.24, bed.depth)
      matrix.compose(position, quaternion, scale)
      borderMesh.setMatrixAt(index, matrix)

      position.set(bed.x, 0.18, bed.z)
      scale.set(bed.width - 0.26, 0.08, bed.depth - 0.26)
      matrix.compose(position, quaternion, scale)
      soilMesh.setMatrixAt(index, matrix)
    })

    borderMesh.instanceMatrix.needsUpdate = true
    soilMesh.instanceMatrix.needsUpdate = true
  }, [day])

  return (
    <group>
      <instancedMesh ref={borderRef} args={[undefined, undefined, PARTERRES.length]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={day ? '#7d8a8b' : '#344044'} roughness={0.82} metalness={0.12} />
      </instancedMesh>
      <instancedMesh ref={soilRef} args={[undefined, undefined, PARTERRES.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={day ? '#382f25' : '#141310'} roughness={0.96} />
      </instancedMesh>
    </group>
  )
}

export function Decorations({ day = false }: { day?: boolean }) {
  return (
    <group>
      <OrganicPond position={[-156, 0, 68]} rx={5.35} rz={3.75} phase={0.7} tone="lagoon" day={day} />
      <OrganicPond position={[45, 0, 101]} rx={5.7} rz={3.05} phase={2.4} tone="civic" day={day} fountain />
      <TechnicalPool position={[92, 0, 30]} day={day} />

      <Shrubs day={day} />
      <Rocks day={day} />
      <Reeds day={day} />
      <Flowers day={day} />
      <Benches day={day} />
      <Lamps day={day} />
      <Pots day={day} />
      <Parterres day={day} />
    </group>
  )
}
