import { useLayoutEffect, useRef } from 'react'
import * as THREE from 'three'

interface Placement {
  x: number
  z: number
  y?: number
  rotation: number
}

const HALF_PI = Math.PI / 2

// Las piezas de mobiliario se mantienen sobre la franja peatonal de la avenida
// (z ≈ ±12.6), las plazas de las tres zonas y los accesos peatonales. Ninguna
// coordenada cae sobre la calzada ni sobre la acera de una parada de autobús.
const BENCHES: Placement[] = [
  // Avenida principal · aceras norte y sur
  { x: -166, z: -12.6, rotation: 0 },
  { x: -130, z: 12.6, rotation: Math.PI },
  { x: -110, z: -12.6, rotation: 0 },
  { x: -52, z: 12.6, rotation: Math.PI },
  { x: 20, z: 12.6, rotation: Math.PI },
  { x: 48, z: -12.6, rotation: 0 },
  { x: 128, z: 12.6, rotation: Math.PI },
  { x: 170, z: -12.6, rotation: 0 },
  // Zona A · plazas interiores
  { x: -44, z: 62, rotation: 0 },
  { x: 34, z: 62.5, rotation: HALF_PI },
  { x: 44, z: -61.5, rotation: Math.PI },
  { x: -55, z: 104, rotation: Math.PI },
  // Zona B · plaza este
  { x: 92, z: 96, y: 0.45, rotation: 0 },
  // Zona C · plaza del parque oeste
  { x: -170, z: 93, rotation: HALF_PI },
]

const TRASH_BINS: Placement[] = [
  // Avenida principal
  { x: -171, z: -12.7, rotation: 0 },
  { x: -133.5, z: 12.7, rotation: 0 },
  { x: -113.5, z: -12.7, rotation: 0 },
  { x: -48.5, z: 12.7, rotation: 0 },
  { x: 16.5, z: 12.7, rotation: 0 },
  { x: 55.5, z: -12.7, rotation: 0 },
  { x: 132, z: 12.7, rotation: 0 },
  { x: 166.5, z: -12.7, rotation: 0 },
  // Plazas
  { x: 37, z: 60.5, y: 0.45, rotation: 0 },
  { x: 94, z: 90, rotation: 0 },
  { x: -112.5, z: 64, rotation: 0 },
]

const PLANTERS: Placement[] = [
  // Avenida principal
  { x: -166, z: 12.6, rotation: 0 },
  { x: -126, z: 12.6, rotation: 0 },
  { x: -89, z: -12.6, rotation: 0 },
  { x: 47.5, z: 12.6, rotation: 0 },
  { x: 107, z: 12.6, rotation: 0 },
  { x: 166, z: 12.6, rotation: 0 },
  // Plazas A, B y C
  { x: -58, z: 98, rotation: 0 },
  { x: 94, z: 104, rotation: 0 },
  { x: 43, z: 65.8, y: 0.45, rotation: 0 },
  { x: 94, z: 104, rotation: 0 },
  { x: 235, z: 106, rotation: 0 },
  { x: -152, z: 91, rotation: 0 },
]

const BIKE_RACKS: Placement[] = [
  { x: 36.5, z: 66.5, y: 0.45, rotation: HALF_PI },
  { x: 154, z: -16, rotation: HALF_PI },
  { x: 53, z: -60, rotation: HALF_PI },
  { x: -92, z: 70, rotation: 0 },
]

const KIOSKS: Placement[] = [
  { x: 36, z: 53.5, y: 0.45, rotation: -0.55 },
  { x: 94, z: 84, rotation: -0.6 },
  { x: -80, z: 68, y: 0.45, rotation: -0.2 },
]

const PEDESTRIAN_SIGNS: Placement[] = [
  { x: -14.5, z: -12.85, rotation: 0 },
  { x: 50, z: 55, y: 0.45, rotation: -2.05 },
  { x: 92, z: 104, y: 0.45, rotation: -2.87 },
  { x: 235, z: 80, rotation: -2.65 },
  { x: -110, z: 56.5, rotation: -0.72 },
  { x: -168, z: 25, rotation: -0.38 },
  { x: -96, z: -89.5, rotation: -2.74 },
]

const BOLLARDS: Placement[] = [
  { x: 14.5, z: 13.1, rotation: 0 },
  { x: -14.8, z: -11.8, rotation: 0 },
  { x: 43, z: 54, y: 0.45, rotation: 0 },
  { x: -220, z: 24, rotation: 0 },
  { x: -171, z: 102.5, rotation: 0 },
]

const WOOD_DAY = ['#9b7650', '#8d6847', '#a47c53']
const WOOD_NIGHT = ['#4c3928', '#433225', '#55402c']
const SHRUB_DAY = ['#4c7a50', '#5a8558', '#447348', '#648b5b']
const SHRUB_NIGHT = ['#20443c', '#285046', '#1b3b35', '#315948']

const IDENTITY = new THREE.Quaternion()
const scratchPosition = new THREE.Vector3()
const scratchScale = new THREE.Vector3()
const scratchMatrix = new THREE.Matrix4()

function writePart(
  mesh: THREE.InstancedMesh,
  index: number,
  root: THREE.Matrix4,
  x: number,
  y: number,
  z: number,
  scaleX: number,
  scaleY: number,
  scaleZ: number,
  rotation: THREE.Quaternion = IDENTITY,
) {
  scratchMatrix.compose(
    scratchPosition.set(x, y, z),
    rotation,
    scratchScale.set(scaleX, scaleY, scaleZ),
  )
  scratchMatrix.premultiply(root)
  mesh.setMatrixAt(index, scratchMatrix)
}

function Benches({ day }: { day: boolean }) {
  const woodRef = useRef<THREE.InstancedMesh>(null)
  const metalRef = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    const woodMesh = woodRef.current
    const metalMesh = metalRef.current
    if (!woodMesh || !metalMesh) return

    const root = new THREE.Matrix4()
    const backTilt = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.09, 0, 0))
    const color = new THREE.Color()
    const wood = day ? WOOD_DAY : WOOD_NIGHT
    let cursor = 0

    BENCHES.forEach((bench, benchIndex) => {
      root.makeRotationY(bench.rotation).setPosition(bench.x, bench.y ?? 0, bench.z)

      for (let slat = 0; slat < 3; slat += 1) {
        writePart(woodMesh, cursor, root, 0, 0.47, -0.2 + slat * 0.2, 1.9, 0.06, 0.16)
        woodMesh.setColorAt(cursor, color.set(wood[(benchIndex + slat) % wood.length]))
        cursor += 1
      }

      for (let slat = 0; slat < 2; slat += 1) {
        writePart(woodMesh, cursor, root, 0, 0.78 + slat * 0.18, -0.28, 1.9, 0.14, 0.055, backTilt)
        woodMesh.setColorAt(cursor, color.set(wood[(benchIndex + slat + 1) % wood.length]))
        cursor += 1
      }

      writePart(metalMesh, benchIndex * 4, root, -0.72, 0.235, 0, 0.1, 0.47, 0.5)
      writePart(metalMesh, benchIndex * 4 + 1, root, 0.72, 0.235, 0, 0.1, 0.47, 0.5)
      writePart(metalMesh, benchIndex * 4 + 2, root, -0.84, 0.7, -0.27, 0.08, 0.55, 0.08, backTilt)
      writePart(metalMesh, benchIndex * 4 + 3, root, 0.84, 0.7, -0.27, 0.08, 0.55, 0.08, backTilt)
    })

    woodMesh.instanceMatrix.needsUpdate = true
    metalMesh.instanceMatrix.needsUpdate = true
    if (woodMesh.instanceColor) woodMesh.instanceColor.needsUpdate = true
  }, [day])

  return (
    <group>
      <instancedMesh
        ref={woodRef}
        args={[undefined, undefined, BENCHES.length * 5]}
        castShadow
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.76} metalness={0.06} />
      </instancedMesh>

      <instancedMesh
        ref={metalRef}
        args={[undefined, undefined, BENCHES.length * 4]}
        castShadow
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={day ? '#59686f' : '#26343a'}
          roughness={0.46}
          metalness={0.56}
        />
      </instancedMesh>
    </group>
  )
}

function TrashBins({ day }: { day: boolean }) {
  const bodyRef = useRef<THREE.InstancedMesh>(null)
  const lidRef = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    const bodyMesh = bodyRef.current
    const lidMesh = lidRef.current
    if (!bodyMesh || !lidMesh) return

    const root = new THREE.Matrix4()

    TRASH_BINS.forEach((bin, index) => {
      root.makeRotationY(bin.rotation).setPosition(bin.x, bin.y ?? 0, bin.z)
      writePart(bodyMesh, index, root, 0, 0.38, 0, 1, 1, 1)
      writePart(lidMesh, index, root, 0, 0.79, 0, 1, 1, 1)
    })

    bodyMesh.instanceMatrix.needsUpdate = true
    lidMesh.instanceMatrix.needsUpdate = true
  }, [])

  return (
    <group>
      <instancedMesh
        ref={bodyRef}
        args={[undefined, undefined, TRASH_BINS.length]}
        castShadow
        frustumCulled={false}
      >
        <cylinderGeometry args={[0.3, 0.26, 0.76, 10]} />
        <meshStandardMaterial
          color={day ? '#708489' : '#2a3a40'}
          roughness={0.38}
          metalness={0.58}
        />
      </instancedMesh>

      <instancedMesh
        ref={lidRef}
        args={[undefined, undefined, TRASH_BINS.length]}
        frustumCulled={false}
      >
        <cylinderGeometry args={[0.32, 0.32, 0.08, 10]} />
        <meshStandardMaterial
          color={day ? '#94a4a5' : '#405157'}
          roughness={0.4}
          metalness={0.5}
        />
      </instancedMesh>
    </group>
  )
}

function Planters({ day }: { day: boolean }) {
  const potRef = useRef<THREE.InstancedMesh>(null)
  const soilRef = useRef<THREE.InstancedMesh>(null)
  const shrubRef = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    const potMesh = potRef.current
    const soilMesh = soilRef.current
    const shrubMesh = shrubRef.current
    if (!potMesh || !soilMesh || !shrubMesh) return

    const root = new THREE.Matrix4()
    const color = new THREE.Color()
    const palette = day ? SHRUB_DAY : SHRUB_NIGHT

    PLANTERS.forEach((planter, index) => {
      root.makeRotationY(planter.rotation).setPosition(planter.x, planter.y ?? 0, planter.z)

      writePart(potMesh, index, root, 0, 0.275, 0, 1, 1, 1)
      writePart(soilMesh, index, root, 0, 0.56, 0, 1, 1, 1)

      writePart(shrubMesh, index * 2, root, -0.11, 0.76, 0.04, 1.2, 0.85, 1.1)
      shrubMesh.setColorAt(index * 2, color.set(palette[index % palette.length]))

      writePart(shrubMesh, index * 2 + 1, root, 0.14, 0.8, -0.07, 0.95, 0.72, 0.9)
      shrubMesh.setColorAt(index * 2 + 1, color.set(palette[(index + 2) % palette.length]))
    })

    potMesh.instanceMatrix.needsUpdate = true
    soilMesh.instanceMatrix.needsUpdate = true
    shrubMesh.instanceMatrix.needsUpdate = true
    if (shrubMesh.instanceColor) shrubMesh.instanceColor.needsUpdate = true
  }, [day])

  return (
    <group>
      <instancedMesh
        ref={potRef}
        args={[undefined, undefined, PLANTERS.length]}
        castShadow
        frustumCulled={false}
      >
        <cylinderGeometry args={[0.52, 0.42, 0.55, 10]} />
        <meshStandardMaterial color={day ? '#8a8274' : '#3a3833'} roughness={0.87} metalness={0.08} />
      </instancedMesh>

      <instancedMesh
        ref={soilRef}
        args={[undefined, undefined, PLANTERS.length]}
        frustumCulled={false}
      >
        <cylinderGeometry args={[0.43, 0.43, 0.05, 10]} />
        <meshStandardMaterial color={day ? '#3a2f24' : '#14120f'} roughness={0.95} />
      </instancedMesh>

      <instancedMesh
        ref={shrubRef}
        args={[undefined, undefined, PLANTERS.length * 2]}
        castShadow
        frustumCulled={false}
      >
        <icosahedronGeometry args={[0.42, 0]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.88}
          flatShading
          emissive={day ? '#000000' : '#0a1b16'}
          emissiveIntensity={day ? 0 : 0.2}
        />
      </instancedMesh>
    </group>
  )
}

function BikeRacks({ day }: { day: boolean }) {
  const hoopRef = useRef<THREE.InstancedMesh>(null)
  const railRef = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    const hoopMesh = hoopRef.current
    const railMesh = railRef.current
    if (!hoopMesh || !railMesh) return

    const root = new THREE.Matrix4()

    BIKE_RACKS.forEach((rack, index) => {
      root.makeRotationY(rack.rotation).setPosition(rack.x, rack.y ?? 0, rack.z)

      for (let hoop = 0; hoop < 3; hoop += 1) {
        writePart(hoopMesh, index * 3 + hoop, root, 0, 0.06, -0.75 + hoop * 0.75, 1.05, 1.35, 1)
      }

      writePart(railMesh, index, root, 0, 0.045, 0, 0.36, 0.06, 2.3)
    })

    hoopMesh.instanceMatrix.needsUpdate = true
    railMesh.instanceMatrix.needsUpdate = true
  }, [])

  return (
    <group>
      <instancedMesh
        ref={hoopRef}
        args={[undefined, undefined, BIKE_RACKS.length * 3]}
        castShadow
        frustumCulled={false}
      >
        <torusGeometry args={[0.43, 0.045, 6, 16, Math.PI]} />
        <meshStandardMaterial
          color={day ? '#77868b' : '#35464c'}
          roughness={0.36}
          metalness={0.68}
        />
      </instancedMesh>

      <instancedMesh
        ref={railRef}
        args={[undefined, undefined, BIKE_RACKS.length]}
        castShadow
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={day ? '#46555b' : '#1c282d'}
          roughness={0.44}
          metalness={0.6}
        />
      </instancedMesh>
    </group>
  )
}

function Kiosks({ day }: { day: boolean }) {
  const bodyRef = useRef<THREE.InstancedMesh>(null)
  const roofRef = useRef<THREE.InstancedMesh>(null)
  const windowRef = useRef<THREE.InstancedMesh>(null)
  const signRef = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    const bodyMesh = bodyRef.current
    const roofMesh = roofRef.current
    const windowMesh = windowRef.current
    const signMesh = signRef.current
    if (!bodyMesh || !roofMesh || !windowMesh || !signMesh) return

    const root = new THREE.Matrix4()

    KIOSKS.forEach((kiosk, index) => {
      root.makeRotationY(kiosk.rotation).setPosition(kiosk.x, kiosk.y ?? 0, kiosk.z)
      writePart(bodyMesh, index, root, 0, 1.08, 0, 2.15, 2.16, 1.55)
      writePart(roofMesh, index, root, 0, 2.23, 0, 2.7, 0.16, 2.02)
      writePart(windowMesh, index, root, 0, 1.36, 0.795, 1.52, 0.92, 0.05)
      writePart(signMesh, index, root, 0, 2.0, 0.81, 1.75, 0.3, 0.06)
    })

    bodyMesh.instanceMatrix.needsUpdate = true
    roofMesh.instanceMatrix.needsUpdate = true
    windowMesh.instanceMatrix.needsUpdate = true
    signMesh.instanceMatrix.needsUpdate = true
  }, [])

  return (
    <group>
      <instancedMesh
        ref={bodyRef}
        args={[undefined, undefined, KIOSKS.length]}
        castShadow
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={day ? '#36655b' : '#17302d'}
          roughness={0.54}
          metalness={0.18}
        />
      </instancedMesh>

      <instancedMesh
        ref={roofRef}
        args={[undefined, undefined, KIOSKS.length]}
        castShadow
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={day ? '#1f3836' : '#0b1919'}
          roughness={0.48}
          metalness={0.26}
        />
      </instancedMesh>

      <instancedMesh
        ref={windowRef}
        args={[undefined, undefined, KIOSKS.length]}
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={day ? '#a8d2c8' : '#f7c97f'}
          emissive={day ? '#cdeee4' : '#ffb95e'}
          emissiveIntensity={day ? 0.12 : 1.1}
          roughness={0.26}
          metalness={0.22}
        />
      </instancedMesh>

      <instancedMesh
        ref={signRef}
        args={[undefined, undefined, KIOSKS.length]}
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={day ? '#e7d6aa' : '#ffdb93'}
          emissive="#ffc978"
          emissiveIntensity={day ? 0.1 : 1.15}
          roughness={0.4}
          metalness={0.1}
        />
      </instancedMesh>
    </group>
  )
}

function PedestrianSigns({ day }: { day: boolean }) {
  const poleRef = useRef<THREE.InstancedMesh>(null)
  const frameRef = useRef<THREE.InstancedMesh>(null)
  const faceRef = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    const poleMesh = poleRef.current
    const frameMesh = frameRef.current
    const faceMesh = faceRef.current
    if (!poleMesh || !frameMesh || !faceMesh) return

    const root = new THREE.Matrix4()

    PEDESTRIAN_SIGNS.forEach((sign, index) => {
      root.makeRotationY(sign.rotation).setPosition(sign.x, sign.y ?? 0, sign.z)
      writePart(poleMesh, index, root, 0, 1.175, 0, 1, 1, 1)
      writePart(frameMesh, index, root, 0, 2, 0, 0.56, 0.68, 0.05)
      writePart(faceMesh, index, root, 0, 2, 0.035, 0.46, 0.58, 0.02)
    })

    poleMesh.instanceMatrix.needsUpdate = true
    frameMesh.instanceMatrix.needsUpdate = true
    faceMesh.instanceMatrix.needsUpdate = true
  }, [])

  return (
    <group>
      <instancedMesh
        ref={poleRef}
        args={[undefined, undefined, PEDESTRIAN_SIGNS.length]}
        castShadow
        frustumCulled={false}
      >
        <cylinderGeometry args={[0.035, 0.045, 2.35, 6]} />
        <meshStandardMaterial
          color={day ? '#59686c' : '#2b393e'}
          roughness={0.42}
          metalness={0.62}
        />
      </instancedMesh>

      <instancedMesh
        ref={frameRef}
        args={[undefined, undefined, PEDESTRIAN_SIGNS.length]}
        castShadow
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={day ? '#d5ded8' : '#59686b'}
          roughness={0.48}
          metalness={0.24}
        />
      </instancedMesh>

      <instancedMesh
        ref={faceRef}
        args={[undefined, undefined, PEDESTRIAN_SIGNS.length]}
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={day ? '#2e6f60' : '#2a6a5c'}
          emissive="#4fd6b8"
          emissiveIntensity={day ? 0.1 : 0.85}
          roughness={0.4}
          metalness={0.12}
        />
      </instancedMesh>
    </group>
  )
}

function Bollards({ day }: { day: boolean }) {
  const postRef = useRef<THREE.InstancedMesh>(null)
  const bandRef = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    const postMesh = postRef.current
    const bandMesh = bandRef.current
    if (!postMesh || !bandMesh) return

    const root = new THREE.Matrix4()

    BOLLARDS.forEach((bollard, index) => {
      root.makeRotationY(bollard.rotation).setPosition(bollard.x, bollard.y ?? 0, bollard.z)
      writePart(postMesh, index, root, 0, 0.425, 0, 1, 1, 1)
      writePart(bandMesh, index, root, 0, 0.67, 0, 1, 1, 1)
    })

    postMesh.instanceMatrix.needsUpdate = true
    bandMesh.instanceMatrix.needsUpdate = true
  }, [])

  return (
    <group>
      <instancedMesh
        ref={postRef}
        args={[undefined, undefined, BOLLARDS.length]}
        castShadow
        frustumCulled={false}
      >
        <cylinderGeometry args={[0.1, 0.13, 0.85, 8]} />
        <meshStandardMaterial
          color={day ? '#4d5d61' : '#243136'}
          roughness={0.42}
          metalness={0.58}
        />
      </instancedMesh>

      <instancedMesh
        ref={bandRef}
        args={[undefined, undefined, BOLLARDS.length]}
        frustumCulled={false}
      >
        <cylinderGeometry args={[0.12, 0.12, 0.1, 8]} />
        <meshBasicMaterial
          color={day ? '#e9e2d0' : '#ffcb79'}
          toneMapped={false}
        />
      </instancedMesh>
    </group>
  )
}

export function StreetFurniture({ day = false }: { day?: boolean }) {
  return (
    <group>
      <Benches day={day} />
      <TrashBins day={day} />
      <Planters day={day} />
      <BikeRacks day={day} />
      <Kiosks day={day} />
      <PedestrianSigns day={day} />
      <Bollards day={day} />
    </group>
  )
}
