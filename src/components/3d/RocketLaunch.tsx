import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface RocketLaunchProps {
  progress: number // 0.0 to 1.0
  visible: boolean
  isStandby?: boolean
}

const PARTICLE_COUNT = 90

export const RocketLaunch: React.FC<RocketLaunchProps> = ({
  progress,
  visible,
  isStandby = false,
}) => {
  const rocketGroupRef = useRef<THREE.Group>(null)
  const particlesRef = useRef<THREE.Points>(null)
  const thrusterLightRef = useRef<THREE.PointLight>(null)

  // Dynamic exhaust particle simulation
  const { velocities, lifetimes, particleGeometry } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3)
    const vel = new Float32Array(PARTICLE_COUNT * 3)
    const life = new Float32Array(PARTICLE_COUNT)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3] = 0
      pos[i * 3 + 1] = -0.6
      pos[i * 3 + 2] = 0

      vel[i * 3] = (Math.random() - 0.5) * 0.08
      vel[i * 3 + 1] = -0.25 - Math.random() * 0.35
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.08

      life[i] = Math.random()
    }

    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return { velocities: vel, lifetimes: life, particleGeometry: geom }
  }, [])

  // Precise trajectory across the 5 Acts
  // Earth radius is 2.4. Launchpad is at [0, 2.4, 0].
  const transform = useMemo(() => {
    if (isStandby || progress < 0.44) {
      // Act I & II: Sitting on launchpad atop Earth
      return {
        pos: new THREE.Vector3(0, 2.4, 0),
        rot: new THREE.Euler(0, 0, 0),
        scale: 1.0,
      }
    } else if (progress < 0.74) {
      // Act III: Powered vertical ascent & gravity turn into upper atmosphere
      const t = (progress - 0.44) / 0.30
      const altitude = 2.4 + Math.pow(t, 2) * 6.8
      const tilt = t * 0.52
      return {
        pos: new THREE.Vector3(t * 2.2, altitude, -t * 1.4),
        rot: new THREE.Euler(0, 0, -tilt),
        scale: Math.max(0.6, 1.0 - t * 0.35),
      }
    } else {
      // Act IV & V: Orbital insertion transition into deep space
      const t = Math.min(1.0, (progress - 0.74) / 0.20)
      const altitude = 9.2 + t * 4.5
      return {
        pos: new THREE.Vector3(2.2 + t * 5.5, altitude, -1.4 - t * 3.5),
        rot: new THREE.Euler(0, 0, -0.52 - t * 0.5),
        scale: Math.max(0.001, 0.65 * (1.0 - t)),
      }
    }
  }, [progress, isStandby])

  useFrame((state, delta) => {
    if (!visible && !isStandby) return

    if (rocketGroupRef.current) {
      rocketGroupRef.current.position.lerp(transform.pos, 0.15)
      rocketGroupRef.current.rotation.x = transform.rot.x
      rocketGroupRef.current.rotation.y = transform.rot.y
      rocketGroupRef.current.rotation.z = transform.rot.z
      rocketGroupRef.current.scale.setScalar(transform.scale)
    }

    // Exhaust particles active during powered flight (progress 0.44 to 0.85)
    const isBurning = visible && progress >= 0.44 && progress <= 0.85

    if (particlesRef.current && isBurning) {
      const posAttr = particleGeometry.getAttribute('position') as THREE.BufferAttribute
      const pArr = posAttr.array as Float32Array

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        lifetimes[i] -= delta * 2.2
        if (lifetimes[i] <= 0) {
          lifetimes[i] = 1.0
          pArr[i * 3] = (Math.random() - 0.5) * 0.06
          pArr[i * 3 + 1] = -0.55
          pArr[i * 3 + 2] = (Math.random() - 0.5) * 0.06

          velocities[i * 3] = (Math.random() - 0.5) * 0.08
          velocities[i * 3 + 1] = -0.3 - Math.random() * 0.4
          velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.08
        } else {
          pArr[i * 3] += velocities[i * 3]
          pArr[i * 3 + 1] += velocities[i * 3 + 1]
          pArr[i * 3 + 2] += velocities[i * 3 + 2]
        }
      }
      posAttr.needsUpdate = true
    }

    if (thrusterLightRef.current && isBurning) {
      thrusterLightRef.current.intensity = 4.0 + Math.sin(state.clock.elapsedTime * 40) * 1.5
    }
  })

  if (!visible && !isStandby) return null

  const isBurning = visible && progress >= 0.44 && progress <= 0.85

  return (
    <group ref={rocketGroupRef} position={transform.pos} scale={transform.scale}>
      {/* 1. Core First Stage Booster */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.13, 0.7, 32]} />
        <meshStandardMaterial color="#F3F2FA" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* 2. Black Roll Markings & Interstage Ring */}
      <mesh position={[0, 0.74, 0]}>
        <cylinderGeometry args={[0.128, 0.13, 0.1, 32]} />
        <meshStandardMaterial color="#1A1829" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* 3. Second Stage */}
      <mesh position={[0, 0.98, 0]}>
        <cylinderGeometry args={[0.125, 0.128, 0.38, 32]} />
        <meshStandardMaterial color="#E2E8F0" metalness={0.4} roughness={0.4} />
      </mesh>

      {/* 4. Third Stage / Mission Avionics Unit */}
      <mesh position={[0, 1.25, 0]}>
        <cylinderGeometry args={[0.12, 0.125, 0.18, 32]} />
        <meshStandardMaterial color="#A78BFA" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* 5. Aerodynamic Payload Fairing / Capsule */}
      <mesh position={[0, 1.48, 0]}>
        <coneGeometry args={[0.12, 0.32, 32]} />
        <meshStandardMaterial color="#F3F2FA" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* 6. Launch Escape Needle */}
      <mesh position={[0, 1.74, 0]}>
        <cylinderGeometry args={[0.015, 0.02, 0.24, 16]} />
        <meshStandardMaterial color="#E2E8F0" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* 7. Delta Guidance Fins (4x) */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
        <group key={i} rotation={[0, angle, 0]}>
          <mesh position={[0.17, 0.1, 0]}>
            <boxGeometry args={[0.12, 0.22, 0.015]} />
            <meshStandardMaterial color="#A78BFA" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* 8. Engine Exhaust Bell Nozzles */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.06, 0.11, 0.12, 24]} />
        <meshStandardMaterial color="#2E283E" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* 9. Thruster Throat Thermal Glow */}
      {isBurning && (
        <mesh position={[0, -0.12, 0]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshBasicMaterial color="#FF9F43" />
        </mesh>
      )}

      {/* 10. Thruster Point Light illuminating rocket and launch surface */}
      {isBurning && (
        <pointLight
          ref={thrusterLightRef}
          position={[0, -0.2, 0]}
          color="#FF793F"
          distance={5}
          decay={2}
          intensity={4.5}
        />
      )}

      {/* 11. Exhaust Particle System */}
      {isBurning && (
        <points ref={particlesRef} geometry={particleGeometry}>
          <pointsMaterial
            size={0.16}
            color="#FFA726"
            transparent
            opacity={0.88}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      )}
    </group>
  )
}
