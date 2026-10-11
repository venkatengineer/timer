import React, { useMemo } from 'react'
import * as THREE from 'three'
import {
  generateFullOrbitPoints,
  generateCompletedArcPoints,
  calculateOrbitalPosition,
  DEFAULT_INITIAL_ANGLE,
} from '../../utils/orbitalMechanics'

interface OrbitPathProps {
  orbitalAngle: number
  elapsedFraction: number
  orbitalRadius?: number
  orbitalInclination?: number
  initialAngle?: number
  isFinalMinute?: boolean
}

export const OrbitPath: React.FC<OrbitPathProps> = ({
  orbitalAngle,
  elapsedFraction,
  orbitalRadius = 6.4,
  orbitalInclination = (23.5 * Math.PI) / 180,
  initialAngle = DEFAULT_INITIAL_ANGLE,
  isFinalMinute = false,
}) => {
  // 1. Full 360-Degree Static Orbital Path (Subtle, elegant technical line)
  const fullOrbitObject = useMemo(() => {
    const points = generateFullOrbitPoints(orbitalRadius, orbitalInclination, 240)
    const vectors = points.map((p) => new THREE.Vector3(p[0], p[1], p[2]))
    const geometry = new THREE.BufferGeometry().setFromPoints(vectors)
    const material = new THREE.LineBasicMaterial({
      color: '#6E5C9A',
      transparent: true,
      opacity: isFinalMinute ? 0.38 : 0.22,
      depthTest: true,
      depthWrite: false,
    })
    return new THREE.Line(geometry, material)
  }, [orbitalRadius, orbitalInclination, isFinalMinute])

  // 2. Completed Orbital Trail (Luminous lavender line tracing elapsed mission time)
  const completedArcObject = useMemo(() => {
    const points = generateCompletedArcPoints(
      initialAngle,
      orbitalAngle,
      orbitalRadius,
      orbitalInclination,
      180
    )
    const vectors = points.map((p) => new THREE.Vector3(p[0], p[1], p[2]))
    const geometry = new THREE.BufferGeometry().setFromPoints(vectors)
    const material = new THREE.LineBasicMaterial({
      color: isFinalMinute ? '#F472B6' : '#C4B5FD',
      transparent: true,
      opacity: 0.92,
      linewidth: 2,
      depthTest: true,
      depthWrite: false,
    })
    return new THREE.Line(geometry, material)
  }, [initialAngle, orbitalAngle, orbitalRadius, orbitalInclination, isFinalMinute])

  // 3. Four Quadrant Milestones: 00h (0°), 06h (90°), 12h (180°), 18h (270°)
  const milestones = useMemo(() => {
    const fractions = [
      { frac: 0.0, label: '00H' },
      { frac: 0.25, label: '06H' },
      { frac: 0.5, label: '12H' },
      { frac: 0.75, label: '18H' },
    ]

    return fractions.map(({ frac, label }) => {
      const angle = initialAngle + 2 * Math.PI * frac
      const pos = calculateOrbitalPosition(angle, orbitalRadius, orbitalInclination)
      const passed = elapsedFraction >= frac
      return { position: pos, passed, label }
    })
  }, [initialAngle, orbitalRadius, orbitalInclination, elapsedFraction])

  // 4. Current Orbital Position Lead Node (Tracks directly with the Moon)
  const currentLeadPosition = useMemo(() => {
    return calculateOrbitalPosition(orbitalAngle, orbitalRadius, orbitalInclination)
  }, [orbitalAngle, orbitalRadius, orbitalInclination])

  return (
    <group>
      {/* 360-Degree Reference Trajectory */}
      <primitive object={fullOrbitObject} />

      {/* Completed Elapsed Trail */}
      <primitive object={completedArcObject} />

      {/* Milestone Checkpoint Nodes (Pure 3D geometry with realistic depth-testing) */}
      {milestones.map((m, idx) => (
        <group key={idx} position={m.position}>
          {/* Subtle Outer Milestone Ring */}
          <mesh rotation={[orbitalInclination, 0, 0]}>
            <ringGeometry args={[0.09, 0.12, 24]} />
            <meshBasicMaterial
              color={m.passed ? '#C4B5FD' : '#4C4765'}
              transparent
              opacity={m.passed ? 0.9 : 0.35}
              side={THREE.DoubleSide}
              depthTest={true}
            />
          </mesh>

          {/* Central Milestone Core Pip */}
          <mesh>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshBasicMaterial
              color={m.passed ? '#C4B5FD' : '#3E3A52'}
              transparent
              opacity={m.passed ? 0.95 : 0.4}
              depthTest={true}
            />
          </mesh>
        </group>
      ))}

      {/* Leading Edge Tracker Node at Moon's Orbital Position */}
      <mesh position={currentLeadPosition} rotation={[orbitalInclination, 0, 0]}>
        <ringGeometry args={[0.14, 0.18, 24]} />
        <meshBasicMaterial
          color={isFinalMinute ? '#F472B6' : '#C4B5FD'}
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
          depthTest={true}
        />
      </mesh>
    </group>
  )
}
