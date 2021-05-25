import { add, angle, cross, rotate, scale, sub, Vec, vLength } from './vec2d'

export type TransformData = {
  rotate: number
  scaleFactor: number
  translate: Vec
}

export const transformPos = (o: Vec, transform: TransformData) => (pos: Vec): Vec => {
  const movedToO0 = sub(pos, o)

  const scaled = scale(movedToO0, transform.scaleFactor || 1)
  const rotated = rotate(scaled, transform.rotate)
  const translate = add(rotated, transform.translate)

  return add(translate, o)
}
export const transformInvPos = (o: Vec, transform: TransformData) => (pos: Vec): Vec => {
  const movedToO0 = sub(pos, o)

  const translate = sub(movedToO0, transform.translate)
  const rotated = rotate(translate, -transform.rotate)
  const scaled = scale(rotated, 1 / (transform.scaleFactor || 1))

  return add(scaled, o)
}

export const transformAngel = (transform: TransformData) => (rad: number): number =>
  rad + transform.rotate
export const transformInvAngel = (transform: TransformData) => (rad: number): number =>
  rad - transform.rotate

export const createTransformData = (o0: Vec, r0: Vec, oAtv: Vec, rAtv: Vec): TransformData => {
  const o0ToR0 = sub(r0, o0)
  const onToRn = sub(rAtv, oAtv)

  return {
    rotate: cross(onToRn, o0ToR0) < 0 ? angle(onToRn, o0ToR0) : -angle(onToRn, o0ToR0),
    scaleFactor: vLength(onToRn) / vLength(o0ToR0),
    translate: sub(oAtv, o0),
  }
}
