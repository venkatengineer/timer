/**
 * SEDS LUNAR CLOCK — Orbital Mechanics Utility
 * Computes exact Earth-Moon orbital coordinates derived from authoritative mission timestamps.
 */

export const DEFAULT_ORBITAL_RADIUS = 6.2
export const DEFAULT_ORBITAL_INCLINATION = (23.5 * Math.PI) / 180 // 23.5 degrees realistic tilt
export const DEFAULT_INITIAL_ANGLE = 0 // Starts at right (+X) in direct unobstructed view of the camera

/**
 * Computes elapsed fraction strictly clamped between 0 and 1.
 */
export function calculateElapsedFraction(elapsedSeconds: number, totalDurationSeconds: number): number {
  if (totalDurationSeconds <= 0) return 1
  return Math.max(0, Math.min(1, elapsedSeconds / totalDurationSeconds))
}

/**
 * Computes orbital angle in radians based on elapsed fraction.
 * Exactly 1 full revolution (2*PI radians) corresponds to 100% of duration.
 */
export function calculateOrbitalAngle(
  elapsedFraction: number,
  initialAngle: number = DEFAULT_INITIAL_ANGLE
): number {
  return initialAngle + 2 * Math.PI * elapsedFraction
}

/**
 * Calculates 3D Cartesian coordinates [x, y, z] for a given orbital angle with inclination.
 * Standard coordinate system: Earth at [0, 0, 0].
 * Orbital plane tilted around the X axis by `inclination`.
 */
export function calculateOrbitalPosition(
  angle: number,
  radius: number = DEFAULT_ORBITAL_RADIUS,
  inclination: number = DEFAULT_ORBITAL_INCLINATION
): [number, number, number] {
  const cosA = Math.cos(angle)
  const sinA = Math.sin(angle)

  // Position in flat orbital plane: x = radius * cosA, z = radius * sinA
  // Tilting around X axis:
  // x = radius * cosA
  // y = radius * sinA * sin(inclination)
  // z = radius * sinA * cos(inclination)
  const x = radius * cosA
  const y = radius * sinA * Math.sin(inclination)
  const z = radius * sinA * Math.cos(inclination)

  return [x, y, z]
}

/**
 * Generates an array of 3D points representing the complete 360-degree orbital ellipse.
 */
export function generateFullOrbitPoints(
  radius: number = DEFAULT_ORBITAL_RADIUS,
  inclination: number = DEFAULT_ORBITAL_INCLINATION,
  segments: number = 180
): [number, number, number][] {
  const points: [number, number, number][] = []
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * 2 * Math.PI
    points.push(calculateOrbitalPosition(angle, radius, inclination))
  }
  return points
}

/**
 * Generates points for the completed orbital arc from initialAngle to currentAngle.
 */
export function generateCompletedArcPoints(
  initialAngle: number,
  currentAngle: number,
  radius: number = DEFAULT_ORBITAL_RADIUS,
  inclination: number = DEFAULT_ORBITAL_INCLINATION,
  maxSegments: number = 180
): [number, number, number][] {
  const angleSpan = currentAngle - initialAngle
  if (angleSpan <= 0.0001) {
    const p0 = calculateOrbitalPosition(initialAngle, radius, inclination)
    return [p0, p0]
  }

  const segments = Math.max(2, Math.ceil((angleSpan / (2 * Math.PI)) * maxSegments))
  const points: [number, number, number][] = []

  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const angle = initialAngle + t * angleSpan
    points.push(calculateOrbitalPosition(angle, radius, inclination))
  }

  return points
}
