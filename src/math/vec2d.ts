export type Vec = [number, number]
export type Vec3 = [number, number, number]
export type Quaternion = [number, number, number, number]

export const vec2 = (x: number, y: number): Vec => [x, y]
export const eq = (a: Vec, b: Vec): boolean => a[0] === b[0] && a[1] === b[1]
export const sub = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1]]
export const add = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1]]
export const divF = (a: Vec, b: Vec): Vec => [a[0] / b[0], a[1] / b[1]]
export const mulF = (a: Vec, b: Vec): Vec => [a[0] * b[0], a[1] * b[1]]

export const cross = (a: Vec, b: Vec): number => a[0] * b[1] - a[1] * b[0]
export const dot = (a: Vec, b: Vec): number => a[0] * b[0] + a[1] * b[1]
export const transpose = ([x, y]: Vec): Vec => [-y, x]
export const inverse = ([x, y]: Vec): Vec => [-x, -y]
export const normalize = (v: Vec): Vec => scale(v, 1 / vLength(v))
export const round = (v: Vec, dec = 0): Vec => {
  const prepV = dec > 0 ? scale(v, Math.pow(10, dec)) : v
  const res = vec2(Math.round(prepV[0]), Math.round(prepV[1]))
  return dec > 0 ? scale(res, Math.pow(0.1, dec)) : res
}

export const scale = (a: Vec, factor: number): Vec => [a[0] * factor, a[1] * factor]
export const rotate = (a: Vec, rad: number): Vec => {
  const sinC = Math.sin(rad)
  const cosC = Math.cos(rad)
  return [a[0] * cosC - a[1] * sinC, a[0] * sinC + a[1] * cosC]
}
export const angle = (a: Vec, b: Vec): number => {
  const [x1, y1] = a
  const [x2, y2] = b
  // mag is the product of the magnitudes of a and b
  const mag = Math.sqrt(x1 * x1 + y1 * y1) * Math.sqrt(x2 * x2 + y2 * y2)
  // mag &&.. short circuits if mag == 0
  const cosine = mag && (x1 * x2 + y1 * y2) / mag
  // Math.min(Math.max(cosine, -1), 1) clamps the cosine between -1 and 1
  return Math.acos(Math.min(Math.max(cosine, -1), 1))
}
export const vLength = ([x, y]: Vec): number => Math.hypot(x, y)

export const quaternionToEuler = (quat: Quaternion): Vec3 => {
  const q0 = quat[0]
  const q1 = quat[1]
  const q2 = quat[2]
  const q3 = quat[3]

  return [
    Math.atan2(2 * (q0 * q1 + q2 * q3), 1 - 2 * (q1 * q1 + q2 * q2)),
    Math.asin(2 * (q0 * q2 - q3 * q1)),
    Math.atan2(2 * (q0 * q3 + q1 * q2), 1 - 2 * (q2 * q2 + q3 * q3)),
  ]
}
export const radToQuaternion = (xRad: number, yRad: number, zRad: number): Quaternion => {
  // Assuming the angles are in radians.
  const c1 = Math.cos(xRad / 2)
  const s1 = Math.sin(xRad / 2)
  const c2 = Math.cos(zRad / 2)
  const s2 = Math.sin(zRad / 2)
  const c3 = Math.cos(yRad / 2)
  const s3 = Math.sin(yRad / 2)
  const c1c2 = c1 * c2
  const s1s2 = s1 * s2
  const w = c1c2 * c3 - s1s2 * s3
  const x = c1c2 * s3 + s1s2 * c3
  const y = s1 * c2 * c3 + c1 * s2 * s3
  const z = c1 * s2 * c3 - s1 * c2 * s3
  return [w, x, y, z]
}
