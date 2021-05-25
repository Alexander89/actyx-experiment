import { add, eq, normalize, scale, sub, transpose, Vec, vec2, vLength } from './vec2d'

export type Rect = {
  a: Vec
  b: Vec
}
export type Edge = {
  a: Vec
  b: Vec
}
export type Line = {
  origin: Vec
  vec: Vec
}

export const pointInPolygon = (point: Vec, edges: ReadonlyArray<Edge>): boolean => {
  const [x, y] = point

  const cuts = edges.reduce((cuts, edge) => {
    const [x1, y1] = edge.a
    const [x2, y2] = edge.b

    const intersect = y1 > y !== y2 > y && x < ((x2 - x1) * (y - y1)) / (y2 - y1) + x1
    return intersect ? cuts + 1 : cuts
  }, 0)
  return cuts % 2 === 1
}

export const pointOnEdge = (point: Vec, { a, b }: Edge): boolean => {
  const e = sub(a, b)
  const aToP = sub(a, point)

  const dE = vLength(e)
  const dP = vLength(aToP)
  return dP <= dE && eq(scale(e, 1 / dE), scale(aToP, 1 / dP))
}

export const intersectLines = (a: Line, b: Line): Vec | undefined => {
  const [amX, amY] = normalize(a.vec)
  const [amtX, amtY] = transpose([amX, amY])
  const [bmX, bmY] = normalize(b.vec)

  const sy = bmX * amtX + bmY * amtY
  // if lines are identical or do not cross...
  if (sy == 0) {
    return undefined
  }

  const [baX, baY] = sub(b.origin, a.origin)
  const qx = baX * amX + baY * amY
  const qy = baX * amtX + baY * amtY
  const sx = bmX * amX + bmY * amY
  const move = qx - (qy * sx) / sy

  const [bX, bY] = a.origin
  return vec2(bX + move * amX, bY + move * amY)
}
export const pointInAABB = ([pX, pY]: Vec, { a, b }: Rect): boolean => {
  const xMin = Math.min(a[0], b[0])
  const xMax = Math.max(a[0], b[0])
  const yMin = Math.min(a[1], b[1])
  const yMax = Math.max(a[1], b[1])
  return pX >= xMin && pX <= xMax && pY >= yMin && pY <= yMax
}

export const centerOfRect = ({ a, b }: Rect): Vec => add(a, scale(sub(b, a), 0.5))

export const edgeToLine = ({ a, b }: Edge): Line => ({ origin: a, vec: sub(b, a) })
