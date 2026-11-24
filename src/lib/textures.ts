import * as THREE from 'three'

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function createWindowTexture(seed = 7, warmth = 0.18): THREE.CanvasTexture {
  const width = 96
  const height = 192
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  const rng = mulberry32(seed)

  ctx.fillStyle = '#030609'
  ctx.fillRect(0, 0, width, height)

  const cols = 6
  const rows = 18
  const padX = 4
  const padY = 3
  const cellW = width / cols
  const cellH = height / rows

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = col * cellW + padX
      const y = row * cellH + padY
      const w = cellW - padX * 2
      const h = cellH - padY * 1.4
      const lit = rng() < 0.5
      if (!lit) {
        ctx.fillStyle = rng() < 0.4 ? '#0a1620' : '#071018'
        ctx.fillRect(x, y, w, h)
        continue
      }
      const warm = rng() < warmth
      const alpha = 0.4 + rng() * 0.6
      ctx.fillStyle = warm
        ? `rgba(255, 216, 168, ${alpha})`
        : `rgba(150, 224, 255, ${alpha})`
      ctx.fillRect(x, y, w, h)
      if (rng() < 0.24) {
        ctx.fillStyle = 'rgba(0,0,0,0.35)'
        ctx.fillRect(x, y + h * 0.45, w, h * 0.2)
      }
    }
  }

  ctx.fillStyle = 'rgba(4, 10, 14, 0.75)'
  for (let row = 0; row < rows; row += 1) {
    ctx.fillRect(0, row * cellH + cellH - 1.5, width, 1.5)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

export function createGlowTexture(inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)'): THREE.CanvasTexture {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, inner)
  gradient.addColorStop(0.32, 'rgba(255,255,255,0.5)')
  gradient.addColorStop(1, outer)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function createAsphaltTexture(): THREE.CanvasTexture {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const rng = mulberry32(31)
  ctx.fillStyle = '#0a0e12'
  ctx.fillRect(0, 0, size, size)
  for (let i = 0; i < 1800; i += 1) {
    const value = 10 + Math.floor(rng() * 22)
    ctx.fillStyle = `rgba(${value}, ${value + 6}, ${value + 10}, ${rng() * 0.4})`
    ctx.fillRect(rng() * size, rng() * size, 1, 1)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(40, 4)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

export function createSolarTexture(): THREE.CanvasTexture {
  const w = 128
  const h = 128
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#071018'
  ctx.fillRect(0, 0, w, h)
  ctx.strokeStyle = 'rgba(111, 168, 255, 0.45)'
  ctx.lineWidth = 2
  const cols = 6
  const rows = 4
  for (let i = 1; i < cols; i += 1) {
    ctx.beginPath()
    ctx.moveTo((i * w) / cols, 0)
    ctx.lineTo((i * w) / cols, h)
    ctx.stroke()
  }
  for (let i = 1; i < rows; i += 1) {
    ctx.beginPath()
    ctx.moveTo(0, (i * h) / rows)
    ctx.lineTo(w, (i * h) / rows)
    ctx.stroke()
  }
  ctx.strokeStyle = 'rgba(111, 168, 255, 0.18)'
  ctx.lineWidth = 6
  ctx.strokeRect(2, 2, w - 4, h - 4)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function randomBetween(seed: number) {
  const rng = mulberry32(seed)
  return (min: number, max: number) => min + rng() * (max - min)
}
