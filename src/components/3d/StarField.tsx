import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface StarFieldProps {
  count?: number
  radius?: number
  driftSpeed?: number
  reducedMotion?: boolean
}

export const StarField: React.FC<StarFieldProps> = ({
  count = 2800,
  radius = 120,
  driftSpeed = 0.008,
  reducedMotion = false,
}) => {
  const pointsRef = useRef<THREE.Points>(null)

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const sz = new Float32Array(count)

    // Palette of deep space stars: soft white, faint blue, faint lavender, warm amber
    const starColors = [
      new THREE.Color('#F3F2FA'), // Soft white
      new THREE.Color('#C4B5FD'), // Subtle lavender
      new THREE.Color('#93C5FD'), // Distant blue
      new THREE.Color('#FEF08A'), // Distant warm star
    ]

    for (let i = 0; i < count; i++) {
      // Uniform distribution on sphere shell with varied depth
      const theta = 2 * Math.PI * Math.random()
      const phi = Math.acos(2 * Math.random() - 1)
      const r = radius * (0.65 + Math.random() * 0.35)

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)

      const color = starColors[Math.floor(Math.random() * starColors.length)]
      const brightness = 0.4 + Math.random() * 0.6
      col[i * 3] = color.r * brightness
      col[i * 3 + 1] = color.g * brightness
      col[i * 3 + 2] = color.b * brightness

      sz[i] = 0.8 + Math.random() * 1.6
    }

    return { positions: pos, colors: col, sizes: sz }
  }, [count, radius])

  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return geom
  }, [positions, colors])

  useFrame((_, delta) => {
    if (reducedMotion || !pointsRef.current) return
    pointsRef.current.rotation.y += delta * driftSpeed
    pointsRef.current.rotation.x += delta * (driftSpeed * 0.35)
  })

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.16}
        vertexColors
        transparent
        opacity={0.88}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}
