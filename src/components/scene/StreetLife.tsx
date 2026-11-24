import { useLayoutEffect, useRef } from 'react'
import * as THREE from 'three'

type Stripe = { x: number; z: number; rotation: number }
type ParkedCar = { x: number; z: number; rotation: number; color: string }

const AVENUE_CROSSINGS = [-180, -140, -100, -62, -28, 28, 62, 100, 140, 180]
const HORIZONTAL_CROSSINGS = [-110, -78, -48, 48, 78, 110]
const VERTICAL_CROSSINGS = [-180, -140, -100, -62, -28, 28, 62, 100, 140, 180]

function buildStripes(): Stripe[] {
  const stripes: Stripe[] = []
  for (const x of AVENUE_CROSSINGS) {
    for (let index = 0; index < 7; index += 1) {
      stripes.push({ x: x + (index - 3) * 1.02, z: 0, rotation: 0 })
    }
  }
  for (const z of HORIZONTAL_CROSSINGS) {
    for (const x of VERTICAL_CROSSINGS) {
      for (let index = 0; index < 6; index += 1) {
        stripes.push({ x, z: z + (index - 2.5) * 1.02, rotation: Math.PI / 2 })
      }
    }
  }
  return stripes
}

const STRIPES = buildStripes()

function Crosswalks() {
  const ref = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    if (!ref.current) return
    const matrix = new THREE.Matrix4()
    const position = new THREE.Vector3()
    const quaternion = new THREE.Quaternion()
    const flat = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0))
    const scale = new THREE.Vector3()

    STRIPES.forEach((stripe, index) => {
      position.set(stripe.x, 0.064, stripe.z)
      quaternion.copy(flat)
      if (stripe.rotation === 0) {
        scale.set(0.52, 9.7, 1)
      } else {
        scale.set(7.8, 0.52, 1)
      }
      matrix.compose(position, quaternion, scale)
      ref.current!.setMatrixAt(index, matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  }, [])

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, STRIPES.length]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial color="#dfeaed" transparent opacity={0.3} depthWrite={false} />
    </instancedMesh>
  )
}

const PARKED_CARS: ParkedCar[] = [
  { x: -137.2, z: -96, rotation: Math.PI / 2, color: '#9fb2ba' },
  { x: -137.2, z: -64, rotation: Math.PI / 2, color: '#b4a17e' },
  { x: -137.2, z: -34, rotation: Math.PI / 2, color: '#8ea4ad' },
  { x: -142.8, z: 34, rotation: -Math.PI / 2, color: '#a8b6bb' },
  { x: -142.8, z: 64, rotation: -Math.PI / 2, color: '#8e9fa7' },
  { x: -142.8, z: 96, rotation: -Math.PI / 2, color: '#b7aa8f' },
  { x: 137.2, z: -96, rotation: Math.PI / 2, color: '#a3b5bc' },
  { x: 137.2, z: -64, rotation: Math.PI / 2, color: '#b8a37d' },
  { x: 137.2, z: -34, rotation: Math.PI / 2, color: '#93a7af' },
  { x: 142.8, z: 34, rotation: -Math.PI / 2, color: '#adbac0' },
  { x: 142.8, z: 64, rotation: -Math.PI / 2, color: '#9babb2' },
  { x: 142.8, z: 96, rotation: -Math.PI / 2, color: '#b4a68b' },
  { x: -97.2, z: -96, rotation: Math.PI / 2, color: '#a8b9bf' },
  { x: -97.2, z: -64, rotation: Math.PI / 2, color: '#bcaa8c' },
  { x: -102.8, z: 34, rotation: -Math.PI / 2, color: '#96a9b1' },
  { x: -102.8, z: 64, rotation: -Math.PI / 2, color: '#aab8bd' },
  { x: 97.2, z: -96, rotation: Math.PI / 2, color: '#b0bdc1' },
  { x: 97.2, z: -64, rotation: Math.PI / 2, color: '#a49170' },
  { x: 102.8, z: 34, rotation: -Math.PI / 2, color: '#9aadb5' },
  { x: 102.8, z: 64, rotation: -Math.PI / 2, color: '#b7a789' },
  { x: -59.2, z: -96, rotation: Math.PI / 2, color: '#9fafb6' },
  { x: -64.8, z: 34, rotation: -Math.PI / 2, color: '#b1a184' },
  { x: -59.2, z: 64, rotation: Math.PI / 2, color: '#92a6ae' },
  { x: 59.2, z: -64, rotation: Math.PI / 2, color: '#a5b6bc' },
  { x: 64.8, z: 34, rotation: -Math.PI / 2, color: '#b8a47f' },
  { x: 59.2, z: 96, rotation: Math.PI / 2, color: '#9babb2' },
]

function ParkedCars({ day }: { day: boolean }) {
  const bodyRef = useRef<THREE.InstancedMesh>(null)
  const cabinRef = useRef<THREE.InstancedMesh>(null)
  const wheelRef = useRef<THREE.InstancedMesh>(null)
  const lightRef = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    if (!bodyRef.current || !cabinRef.current || !wheelRef.current || !lightRef.current) return
    const matrix = new THREE.Matrix4()
    const position = new THREE.Vector3()
    const quaternion = new THREE.Quaternion()
    const scale = new THREE.Vector3(1, 1, 1)
    const color = new THREE.Color()

    PARKED_CARS.forEach((car, index) => {
      quaternion.setFromEuler(new THREE.Euler(0, car.rotation, 0))
      position.set(car.x, 0.55, car.z)
      matrix.compose(position, quaternion, scale)
      bodyRef.current!.setMatrixAt(index, matrix)
      bodyRef.current!.setColorAt(index, color.set(car.color))

      position.set(car.x, 0.99, car.z)
      matrix.compose(position, quaternion, scale)
      cabinRef.current!.setMatrixAt(index, matrix)

      ;[
        [-0.72, -0.58],
        [-0.72, 0.58],
        [0.72, -0.58],
        [0.72, 0.58],
      ].forEach(([dx, dz], wheelIndex) => {
        const cos = Math.cos(car.rotation)
        const sin = Math.sin(car.rotation)
        position.set(car.x + dx * cos + dz * sin, 0.28, car.z - dx * sin + dz * cos)
        quaternion.setFromEuler(new THREE.Euler(Math.PI / 2, car.rotation, 0))
        matrix.compose(position, quaternion, scale)
        wheelRef.current!.setMatrixAt(index * 4 + wheelIndex, matrix)
      })

      const cos = Math.cos(car.rotation)
      const sin = Math.sin(car.rotation)
      ;[-2.28, 2.28].forEach((dx, lightIndex) => {
        position.set(car.x + dx * cos, 0.55, car.z - dx * sin)
        quaternion.setFromEuler(new THREE.Euler(0, car.rotation, 0))
        matrix.compose(position, quaternion, scale)
        lightRef.current!.setMatrixAt(index * 2 + lightIndex, matrix)
      })
    })
    bodyRef.current.instanceMatrix.needsUpdate = true
    cabinRef.current.instanceMatrix.needsUpdate = true
    wheelRef.current.instanceMatrix.needsUpdate = true
    lightRef.current.instanceMatrix.needsUpdate = true
    if (bodyRef.current.instanceColor) bodyRef.current.instanceColor.needsUpdate = true
  }, [day])

  return (
    <group>
      <instancedMesh ref={bodyRef} args={[undefined, undefined, PARKED_CARS.length]} castShadow>
        <boxGeometry args={[4.1, 0.62, 1.02]} />
        <meshStandardMaterial color="#ffffff" roughness={0.36} metalness={0.55} />
      </instancedMesh>
      <instancedMesh ref={cabinRef} args={[undefined, undefined, PARKED_CARS.length]}>
        <boxGeometry args={[1.5, 0.48, 0.88]} />
        <meshStandardMaterial color={day ? '#5c7480' : '#0c2733'} emissive="#2b6a7c" emissiveIntensity={day ? 0.1 : 0.45} roughness={0.24} metalness={0.5} />
      </instancedMesh>
      <instancedMesh ref={wheelRef} args={[undefined, undefined, PARKED_CARS.length * 4]}>
        <cylinderGeometry args={[0.22, 0.22, 0.14, 10]} />
        <meshStandardMaterial color="#080d10" roughness={0.75} />
      </instancedMesh>
      <instancedMesh ref={lightRef} args={[undefined, undefined, PARKED_CARS.length * 2]}>
        <boxGeometry args={[0.05, 0.13, 0.78]} />
        <meshBasicMaterial color={day ? '#d9e3e4' : '#d9f5ff'} toneMapped={false} />
      </instancedMesh>
    </group>
  )
}

export function StreetLife({ day = false }: { day?: boolean }) {
  return (
    <group>
      <Crosswalks />
      <ParkedCars day={day} />
    </group>
  )
}
