import * as THREE from 'three'

/**
 * Procedural Earth & Moon Texture Generator
 * Creates self-contained, 100% reliable, zero-latency canvas textures.
 * No external image downloads, no CORS risk, no broken links.
 */

// Simple pseudo-random seeded noise for reproducible continental and crater detail
class SimpleNoise {
  private p: number[] = []

  constructor(seed = 1337) {
    const perm: number[] = []
    for (let i = 0; i < 256; i++) perm[i] = i
    let s = seed
    for (let i = 255; i > 0; i--) {
      s = (s * 16807) % 2147483647
      const j = s % (i + 1)
      const tmp = perm[i]
      perm[i] = perm[j]
      perm[j] = tmp
    }
    this.p = new Array(512)
    for (let i = 0; i < 512; i++) {
      this.p[i] = perm[i & 255]
    }
  }

  noise2D(x: number, y: number): number {
    const X = Math.floor(x) & 255
    const Y = Math.floor(y) & 255
    const xf = x - Math.floor(x)
    const yf = y - Math.floor(y)

    const u = xf * xf * (3 - 2 * xf)
    const v = yf * yf * (3 - 2 * yf)

    const A = this.p[X] + Y
    const B = this.p[X + 1] + Y

    const g1 = (this.p[A] % 4) - 1.5
    const g2 = (this.p[B] % 4) - 1.5
    const g3 = (this.p[A + 1] % 4) - 1.5
    const g4 = (this.p[B + 1] % 4) - 1.5

    const n1 = (g1 * xf + g2 * yf) * 0.7
    const n2 = (g2 * (xf - 1) + g1 * yf) * 0.7
    const n3 = (g3 * xf + g4 * (yf - 1)) * 0.7
    const n4 = (g4 * (xf - 1) + g3 * (yf - 1)) * 0.7

    const nx1 = n1 * (1 - u) + n2 * u
    const nx2 = n3 * (1 - u) + n4 * u

    return nx1 * (1 - v) + nx2 * v
  }

  fbm(x: number, y: number, octaves = 5): number {
    let value = 0
    let amplitude = 0.5
    let frequency = 1
    for (let i = 0; i < octaves; i++) {
      value += this.noise2D(x * frequency, y * frequency) * amplitude
      frequency *= 2
      amplitude *= 0.5
    }
    return value
  }
}

/**
 * Checks if a given longitude / latitude coordinate is continental land.
 * Longitude: -180 to 180, Latitude: -90 to 90.
 */
function isEarthLand(lon: number, lat: number, noise: SimpleNoise): { isLand: boolean; terrain: 'ice' | 'desert' | 'vegetation' | 'mountain' } {
  // Polar Ice Caps
  if (lat < -62) return { isLand: true, terrain: 'ice' }
  if (lat > 74 && Math.abs(lon) < 130) return { isLand: true, terrain: 'ice' } // Greenland / Arctic

  // Rough continental masks + fractal boundaries
  let landWeight = 0

  // North America (-165 to -55, 15 to 70)
  if (lon > -165 && lon < -55 && lat > 15 && lat < 72) {
    if (lat > 25 && lon > -125 && lon < -75) landWeight += 1.2
    if (lat <= 25 && lon > -105 && lon < -80) landWeight += 0.9 // Mexico
    if (lat > 48 && lon > -140 && lon < -60) landWeight += 1.0 // Canada
  }

  // South America (-82 to -34, -56 to 12)
  if (lon > -82 && lon < -34 && lat > -56 && lat < 12) {
    const sTaper = 1 - Math.abs(lat - -20) / 40
    if (lon > -75 + (lat < -20 ? Math.abs(lat + 20) * 0.5 : 0) && lon < -40) {
      landWeight += 1.1 * Math.max(0, sTaper)
    }
  }

  // Eurasia (Europe: -10 to 45, 35 to 70; Asia: 45 to 170, 5 to 75)
  if (lon > -10 && lon < 45 && lat > 35 && lat < 70) landWeight += 1.1 // Europe
  if (lon >= 45 && lon < 170 && lat > 8 && lat < 75) {
    // Exclude Indian Ocean basin below 8
    if (lat > 8 && lat < 35 && lon > 68 && lon < 90) landWeight += 1.3 // India
    else if (lat > 15 && lon > 95 && lon < 130) landWeight += 1.2 // China / SE Asia
    else if (lat >= 30) landWeight += 1.2 // Central Asia, Siberia
  }

  // Africa (-18 to 52, -35 to 37)
  if (lon > -18 && lon < 52 && lat > -35 && lat < 37) {
    landWeight += 1.2
  }

  // Australia (112 to 154, -44 to -10)
  if (lon > 112 && lon < 154 && lat > -44 && lat < -10) {
    landWeight += 1.2
  }

  // Add fractal perturbation to coastline
  const coastNoise = noise.fbm((lon + 180) * 0.08, (lat + 90) * 0.08, 4)
  const totalLand = landWeight + coastNoise * 1.4

  const isLand = totalLand > 0.65

  let terrain: 'ice' | 'desert' | 'vegetation' | 'mountain' = 'vegetation'
  if (isLand) {
    if (lat > 65 || lat < -55) {
      terrain = 'ice'
    } else if (
      (lat > 15 && lat < 32 && lon > -15 && lon < 60) || // Sahara / Arabia
      (lat > -32 && lat < -18 && lon > 115 && lon < 145) || // Australian Outback
      (lat > 35 && lat < 48 && lon > 85 && lon < 110) // Gobi
    ) {
      terrain = 'desert'
    } else if (
      (lon > -120 && lon < -105 && lat > 30 && lat < 55) || // Rockies
      (lon > -75 && lon < -65 && lat > -45 && lat < 5) || // Andes
      (lon > 70 && lon < 95 && lat > 27 && lat < 38) // Himalayas
    ) {
      terrain = 'mountain'
    }
  }

  return { isLand, terrain }
}

/**
 * Generates high-res Earth Day Texture
 */
export function generateEarthDayTexture(width = 2048, height = 1024): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.CanvasTexture(canvas)

  const imgData = ctx.createImageData(width, height)
  const data = imgData.data
  const noise = new SimpleNoise(42)

  for (let y = 0; y < height; y++) {
    const lat = 90 - (y / height) * 180
    for (let x = 0; x < width; x++) {
      const lon = (x / width) * 360 - 180
      const idx = (y * width + x) * 4

      const { isLand, terrain } = isEarthLand(lon, lat, noise)
      const detailNoise = noise.fbm(x * 0.05, y * 0.05, 3)

      if (isLand) {
        if (terrain === 'ice') {
          // Glacier / Polar Snow
          data[idx] = 235 + detailNoise * 15
          data[idx + 1] = 242 + detailNoise * 10
          data[idx + 2] = 250
        } else if (terrain === 'desert') {
          // Arid desert ochre
          data[idx] = 195 + detailNoise * 30
          data[idx + 1] = 155 + detailNoise * 25
          data[idx + 2] = 95 + detailNoise * 15
        } else if (terrain === 'mountain') {
          // High mountain peaks / rock
          data[idx] = 120 + detailNoise * 25
          data[idx + 1] = 110 + detailNoise * 20
          data[idx + 2] = 100 + detailNoise * 20
        } else {
          // Lush forest / savanna green
          data[idx] = 35 + detailNoise * 20
          data[idx + 1] = 95 + detailNoise * 35
          data[idx + 2] = 40 + detailNoise * 15
        }
      } else {
        // Ocean - deep oceanic gradient + coastal shelf
        const depthNoise = noise.fbm(x * 0.03, y * 0.03, 3)
        data[idx] = 8 + depthNoise * 12      // Dark navy R
        data[idx + 1] = 28 + depthNoise * 28 // Oceanic G
        data[idx + 2] = 68 + depthNoise * 40 // Deep blue B
      }
      data[idx + 3] = 255
    }
  }

  ctx.putImageData(imgData, 0, 0)

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/**
 * Generates realistic Earth Night Lights Texture
 */
export function generateEarthNightTexture(width = 2048, height = 1024): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.CanvasTexture(canvas)

  // Fill deep void
  ctx.fillStyle = '#020306'
  ctx.fillRect(0, 0, width, height)

  const noise = new SimpleNoise(42)

  // Known major urban population clusters (lon, lat, radius, intensity)
  const majorCities: [number, number, number, number][] = [
    // US East Corridor
    [-74, 40.7, 14, 0.95], // NYC
    [-71, 42.3, 10, 0.85], // Boston
    [-77, 38.9, 12, 0.9],  // DC
    [-87, 41.8, 13, 0.88], // Chicago
    [-80, 25.8, 11, 0.8],  // Miami
    [-118, 34, 15, 0.92],  // LA
    [-122, 37.7, 12, 0.9], // SF
    [-95, 29.7, 11, 0.85], // Houston
    // Europe
    [-0.1, 51.5, 14, 0.95], // London
    [2.3, 48.8, 14, 0.95],  // Paris
    [4.9, 52.3, 13, 0.9],   // Amsterdam
    [13.4, 52.5, 12, 0.88], // Berlin
    [9.2, 45.4, 12, 0.88],  // Milan
    [-3.7, 40.4, 11, 0.85], // Madrid
    [37.6, 55.7, 13, 0.9],  // Moscow
    // Asia
    [72.8, 18.9, 15, 0.95], // Mumbai
    [77.2, 28.6, 16, 0.95], // Delhi
    [88.3, 22.5, 13, 0.9],  // Kolkata
    [80.2, 13.0, 12, 0.88], // Chennai
    [77.5, 12.9, 13, 0.9],  // Bengaluru
    [121.4, 31.2, 16, 0.95],// Shanghai
    [116.4, 39.9, 15, 0.95],// Beijing
    [113.2, 23.1, 15, 0.92],// Guangzhou/Shenzhen
    [139.7, 35.6, 17, 0.98],// Tokyo
    [135.5, 34.6, 14, 0.92],// Osaka
    [126.9, 37.5, 14, 0.94],// Seoul
    [103.8, 1.3, 12, 0.9],  // Singapore
    [100.5, 13.7, 12, 0.88],// Bangkok
    [31.2, 30.0, 14, 0.92], // Cairo / Nile
    [55.3, 25.2, 13, 0.9],  // Dubai
    // South America & Australia
    [-46.6, -23.5, 13, 0.9],// São Paulo
    [-43.1, -22.9, 12, 0.85],// Rio
    [-58.4, -34.6, 12, 0.88],// Buenos Aires
    [151.2, -33.8, 12, 0.88],// Sydney
    [144.9, -37.8, 11, 0.85] // Melbourne
  ]

  // Render glowing urban centers
  for (const [cLon, cLat, r, intensity] of majorCities) {
    const cx = ((cLon + 180) / 360) * width
    const cy = ((90 - cLat) / 180) * height

    const grad = ctx.createRadialGradient(cx, cy, 1, cx, cy, r * 2.2)
    grad.addColorStop(0, `rgba(255, 245, 210, ${intensity})`)
    grad.addColorStop(0.3, `rgba(255, 185, 75, ${intensity * 0.75})`)
    grad.addColorStop(0.7, `rgba(200, 115, 30, ${intensity * 0.3})`)
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)')

    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(cx, cy, r * 2.2, 0, Math.PI * 2)
    ctx.fill()
  }

  // Add diffuse settlement clusters across landmasses
  const imgData = ctx.getImageData(0, 0, width, height)
  const data = imgData.data

  for (let y = 0; y < height; y += 2) {
    const lat = 90 - (y / height) * 180
    for (let x = 0; x < width; x += 2) {
      const lon = (x / width) * 360 - 180
      const { isLand, terrain } = isEarthLand(lon, lat, noise)
      if (isLand && terrain !== 'ice') {
        const lightNoise = noise.noise2D(x * 0.15, y * 0.15)
        if (lightNoise > 0.42) {
          const idx = (y * width + x) * 4
          const val = Math.floor((lightNoise - 0.42) * 450)
          data[idx] = Math.min(255, data[idx] + val)
          data[idx + 1] = Math.min(235, data[idx + 1] + Math.floor(val * 0.8))
          data[idx + 2] = Math.min(180, data[idx + 2] + Math.floor(val * 0.4))
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0)

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/**
 * Generates transparent Earth Cloud Layer Texture
 */
export function generateEarthCloudsTexture(width = 2048, height = 1024): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.CanvasTexture(canvas)

  const imgData = ctx.createImageData(width, height)
  const data = imgData.data
  const noise = new SimpleNoise(101)

  for (let y = 0; y < height; y++) {
    const lat = 90 - (y / height) * 180
    const latRad = (lat * Math.PI) / 180
    // Tropical ITCZ & mid-latitude storm belts have denser clouds
    const beltFactor = Math.sin(latRad * 3.5) * 0.3 + 0.4

    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4

      // Swirling atmospheric turbulence
      const swirlX = x * 0.015 + Math.sin(y * 0.03) * 0.8
      const swirlY = y * 0.015
      const cNoise = noise.fbm(swirlX, swirlY, 5)

      const cloudDensity = cNoise + beltFactor * 0.3

      if (cloudDensity > 0.35) {
        const alpha = Math.min(230, Math.floor((cloudDensity - 0.35) * 480))
        data[idx] = 250     // White
        data[idx + 1] = 252
        data[idx + 2] = 255
        data[idx + 3] = alpha
      } else {
        data[idx + 3] = 0 // Transparent
      }
    }
  }

  ctx.putImageData(imgData, 0, 0)

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  return texture
}

/**
 * Generates realistic cratered Moon Texture
 */
export function generateMoonTexture(width = 1024, height = 512): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.CanvasTexture(canvas)

  const imgData = ctx.createImageData(width, height)
  const data = imgData.data
  const noise = new SimpleNoise(88)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4

      // Base lunar highland tone: light silvery gray
      const baseNoise = noise.fbm(x * 0.02, y * 0.02, 5)
      let tone = 155 + baseNoise * 45

      // Dark basaltic lunar maria basins
      const mariaNoise = noise.noise2D(x * 0.008, y * 0.008)
      if (mariaNoise > 0.15) {
        tone -= (mariaNoise - 0.15) * 90
      }

      // Small crater speckling
      const craterSpeck = noise.noise2D(x * 0.12, y * 0.12)
      if (craterSpeck > 0.6) {
        tone += 25 // Bright crater rim
      } else if (craterSpeck < -0.6) {
        tone -= 30 // Shadowed crater floor
      }

      tone = Math.max(35, Math.min(235, Math.floor(tone)))

      data[idx] = tone
      data[idx + 1] = tone
      data[idx + 2] = Math.min(255, tone + 4) // subtle silvery tint
      data[idx + 3] = 255
    }
  }

  ctx.putImageData(imgData, 0, 0)

  // Prominent impact crater ray systems (Tycho / Copernicus style)
  const prominentCraters = [
    { x: width * 0.52, y: height * 0.72, r: 24 }, // Tycho-like crater
    { x: width * 0.35, y: height * 0.42, r: 18 }, // Copernicus-like
    { x: width * 0.68, y: height * 0.36, r: 15 }, // Kepler-like
  ]

  for (const c of prominentCraters) {
    // Ejecta rays
    ctx.strokeStyle = 'rgba(235, 235, 245, 0.45)'
    ctx.lineWidth = 1.5
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2
      const rayLen = c.r * (3 + (i % 3) * 2)
      ctx.beginPath()
      ctx.moveTo(c.x, c.y)
      ctx.lineTo(c.x + Math.cos(angle) * rayLen, c.y + Math.sin(angle) * rayLen)
      ctx.stroke()
    }

    // Crater rim
    const grad = ctx.createRadialGradient(c.x, c.y, 2, c.x, c.y, c.r)
    grad.addColorStop(0, '#2b2a30')
    grad.addColorStop(0.7, '#42414a')
    grad.addColorStop(0.95, '#dedde8')
    grad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2)
    ctx.fill()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}
