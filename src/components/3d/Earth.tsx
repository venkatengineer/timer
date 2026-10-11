import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  generateEarthDayTexture,
  generateEarthNightTexture,
  generateEarthCloudsTexture,
} from '../../utils/textureGenerator'

interface EarthProps {
  radius?: number
  sunPosition?: [number, number, number]
  rotationSpeed?: number
  reducedMotion?: boolean
}

// Photorealistic Earth Surface Shader with Day/Night blend, specular reflection & atmospheric Rayleigh limb
const EarthDayNightShader = {
  uniforms: {
    dayTexture: { value: null as THREE.Texture | null },
    nightTexture: { value: null as THREE.Texture | null },
    normalTexture: { value: null as THREE.Texture | null },
    sunDirection: { value: new THREE.Vector3(1, 0.3, 1).normalize() },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  fragmentShader: `
    uniform sampler2D dayTexture;
    uniform sampler2D nightTexture;
    uniform sampler2D normalTexture;
    uniform vec3 sunDirection;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vec3 norm = normalize(vNormal);
      vec3 sunDir = normalize(sunDirection);
      float sunDot = dot(norm, sunDir);

      // Realistic sharp yet natural day-to-night terminator
      float dayWeight = smoothstep(-0.08, 0.18, sunDot);
      float nightWeight = 1.0 - dayWeight;

      vec4 dayCol = texture2D(dayTexture, vUv);
      vec4 nightCol = texture2D(nightTexture, vUv);

      // Night city lights on dark side with natural golden glow
      vec3 col = dayCol.rgb * dayWeight + (nightCol.rgb * 1.6) * nightWeight;

      // Realistic ocean specular glint on sunlit waters
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      if (dayWeight > 0.05 && dayCol.b > dayCol.r * 1.05) {
        vec3 halfVec = normalize(sunDir + viewDir);
        float spec = pow(max(dot(norm, halfVec), 0.0), 40.0);
        col += vec3(0.5, 0.75, 1.0) * spec * dayWeight * 0.75;
      }

      // Natural atmospheric limb Rayleigh scattering on sunlit side
      float limb = 1.0 - max(dot(norm, viewDir), 0.0);
      float rayleigh = pow(limb, 3.8) * max(sunDot, 0.0) * 0.55;
      col += vec3(0.38, 0.65, 0.95) * rayleigh;

      gl_FragColor = vec4(col, 1.0);
    }
  `,
}

// Physically Inspired Thin Atmospheric Scattering Shell (Sunlit Crescent Only)
const AtmosphereShader = {
  uniforms: {
    sunDirection: { value: new THREE.Vector3(1, 0.3, 1).normalize() },
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  fragmentShader: `
    uniform vec3 sunDirection;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vec3 norm = normalize(vNormal);
      vec3 sunDir = normalize(sunDirection);
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);

      // Only scatter where sunlight illuminates the atmospheric layer
      float sunDot = dot(norm, sunDir);
      float sunLit = smoothstep(-0.15, 0.35, sunDot);

      // Fresnel grazing limb
      float rim = 1.0 - max(dot(norm, viewDir), 0.0);
      float alpha = pow(rim, 4.2) * sunLit * 0.65;

      // Space agency natural atmospheric blue (#5B9BD5)
      vec3 atmoColor = vec3(0.36, 0.61, 0.88);
      gl_FragColor = vec4(atmoColor, alpha);
    }
  `,
}

export const Earth: React.FC<EarthProps> = ({
  radius = 2.4,
  sunPosition = [12, 4, 12],
  rotationSpeed = 0.03,
  reducedMotion = false,
}) => {
  const earthMeshRef = useRef<THREE.Mesh>(null)
  const cloudsMeshRef = useRef<THREE.Mesh>(null)
  const earthGroupRef = useRef<THREE.Group>(null)

  const textureLoader = useMemo(() => new THREE.TextureLoader(), [])
  const basePath = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`

  // NASA Earth Surface Textures with procedural fallbacks
  const dayTexture = useMemo(() => {
    const tex = textureLoader.load(
      `${basePath}textures/earth_atmos_2048.jpg`,
      undefined,
      undefined,
      () => generateEarthDayTexture(1024, 512)
    )
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [textureLoader, basePath])

  const nightTexture = useMemo(() => {
    const tex = textureLoader.load(
      `${basePath}textures/earth_lights_2048.png`,
      undefined,
      undefined,
      () => generateEarthNightTexture(1024, 512)
    )
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [textureLoader, basePath])

  const normalTexture = useMemo(() => {
    return textureLoader.load(`${basePath}textures/earth_normal_2048.jpg`)
  }, [textureLoader, basePath])

  const cloudsTexture = useMemo(() => {
    return textureLoader.load(
      `${basePath}textures/earth_clouds_1024.png`,
      undefined,
      undefined,
      () => generateEarthCloudsTexture(1024, 512)
    )
  }, [textureLoader, basePath])

  const sunDirVector = useMemo(() => {
    return new THREE.Vector3(...sunPosition).normalize()
  }, [sunPosition])

  const earthMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        dayTexture: { value: dayTexture },
        nightTexture: { value: nightTexture },
        normalTexture: { value: normalTexture },
        sunDirection: { value: sunDirVector },
      },
      vertexShader: EarthDayNightShader.vertexShader,
      fragmentShader: EarthDayNightShader.fragmentShader,
    })
  }, [dayTexture, nightTexture, normalTexture, sunDirVector])

  const atmosphereMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        sunDirection: { value: sunDirVector },
      },
      vertexShader: AtmosphereShader.vertexShader,
      fragmentShader: AtmosphereShader.fragmentShader,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    })
  }, [sunDirVector])

  // Realistic Earth and Cloud drift
  useFrame((_, delta) => {
    if (reducedMotion) return

    if (earthMeshRef.current) {
      earthMeshRef.current.rotation.y += delta * rotationSpeed
    }
    if (cloudsMeshRef.current) {
      cloudsMeshRef.current.rotation.y += delta * (rotationSpeed * 1.2)
    }
  })

  // 23.4 degree axial tilt
  const axialTilt = (23.4 * Math.PI) / 180

  return (
    <group ref={earthGroupRef} rotation={[0, 0, axialTilt]}>
      {/* Planetary Surface Mesh with Day/Night & Specular Glint */}
      <mesh ref={earthMeshRef} material={earthMaterial}>
        <sphereGeometry args={[radius, 64, 64]} />
      </mesh>

      {/* Atmospheric Cloud Deck (floating tightly above surface) */}
      <mesh ref={cloudsMeshRef}>
        <sphereGeometry args={[radius * 1.008, 64, 64]} />
        <meshStandardMaterial
          map={cloudsTexture}
          transparent
          opacity={0.42}
          blending={THREE.NormalBlending}
          depthWrite={false}
          roughness={0.95}
        />
      </mesh>

      {/* Physically Inspired Tight Atmospheric Shell (1.018x radius, sunlit crescent only) */}
      <mesh material={atmosphereMaterial}>
        <sphereGeometry args={[radius * 1.018, 64, 64]} />
      </mesh>
    </group>
  )
}
