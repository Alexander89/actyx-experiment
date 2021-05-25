import { add, inverse, normalize, scale, transpose, Vec } from './vec2d'
import {
  Edge,
  edgeToLine,
  intersectLines,
  pointInAABB,
  pointInPolygon,
  pointOnEdge,
} from './vectorUtil'

export type ZonePropertyMaxDevices = {
  type: 'maxDevices'
  maxDevices: number
}
export type ZonePropertyNoStop = {
  type: 'noStop'
}
export type ZonePropertyMaxSpeed = {
  type: 'maxSpeed'
  speed: number
}
export type ZoneProperty = ZonePropertyMaxDevices | ZonePropertyNoStop | ZonePropertyMaxSpeed

export type ZoneProperties = ReadonlyArray<ZoneProperty>

export type Area = {
  vertices: ReadonlyArray<Vec>
  edges: ReadonlyArray<Edge>
}
export type Portal = {
  direction: Vec
} & Area

export type Zone = {
  id: string
  portalSize: number
  portals: ReadonlyArray<Portal>
  properties: ZoneProperties
} & Area
export type Zones = ReadonlyArray<Zone>

export type ExportZone = {
  id: string
  portalSize: number
  vertices: ReadonlyArray<Vec>
  maxDevices?: number
  noStop?: boolean
  maxSpeed?: number
}
export type ExportZones = ReadonlyArray<ExportZone>

const checkIntersectEdges = (edges: ReadonlyArray<Edge>): boolean => {
  for (let i = 0; i < edges.length; i++) {
    // skip last edge on first edge. they will cut on first vertex
    const maxJ = i === 0 ? edges.length - 1 : edges.length
    const edge1 = edges[i]
    const line1 = edgeToLine(edge1)

    // i + 2 ==> next line can not intersect
    for (let j = i + 2; j < maxJ; j++) {
      const edge2 = edges[j]
      const intersection = intersectLines(line1, edgeToLine(edge2))
      if (intersection && pointInAABB(intersection, edge1) && pointInAABB(intersection, edge2)) {
        return true
      }
    }
  }
  return false
}

const checkVertexOnEdges = (edges: ReadonlyArray<Edge>): boolean => {
  const maxIter = edges.length - 1
  for (let i = 0; i < maxIter; i++) {
    // skip last on first edge. they will cut on first vertex
    const p = edges[i].a

    for (let j = i + 1; j < maxIter; j++) {
      const edge2 = edges[j]
      if (pointOnEdge(p, edge2)) {
        console.log(p, 'is on', edge2)
        return true
      }
    }
  }
  return false
}

export const isZoneValid = (edges: ReadonlyArray<Edge>): boolean => {
  // less the 3 is not a polygon
  if (edges.length < 3) {
    return false
  }
  // vertex is on edge not allowed
  if (checkVertexOnEdges(edges)) {
    return false
  }
  if (edges.length === 3) {
    return true
  }
  return !checkIntersectEdges(edges)
}

const mkPortal = (portalSize: number) => (
  edge: Edge,
  _: number,
  allEdges: ReadonlyArray<Edge>,
): Portal => {
  const line = edgeToLine(edge)
  const middle = add(line.origin, scale(line.vec, 0.5))
  const vt = transpose(line.vec) // rot 90° ccw
  const ccwCheckpoint = add(middle, scale(vt, 0.01))

  const zoneDir = normalize(pointInPolygon(ccwCheckpoint, allEdges) ? inverse(vt) : vt)
  const edgeVec = scale(zoneDir, portalSize)
  const vertices: ReadonlyArray<any> = [edge.a, edge.b, add(edge.b, edgeVec), add(edge.a, edgeVec)]
  return {
    vertices,
    edges: mkEdges(vertices),
    direction: inverse(zoneDir),
  }
}

const mkEdges = (vertices: ReadonlyArray<Vec>): ReadonlyArray<Edge> => {
  const loop: ReadonlyArray<any> = [...vertices, vertices[0]]

  return loop.reduce<{ edges: ReadonlyArray<Edge>; last?: Vec }>(
    (acc, vertex) => ({
      edges: acc.last ? [...acc.edges, { a: acc.last, b: vertex }] : acc.edges,
      last: vertex,
    }),
    { edges: [], last: undefined } as { edges: ReadonlyArray<Edge>; last?: Vec },
  ).edges
}

export const mkZone = (
  id: string,
  vertices: ReadonlyArray<Vec>,
  portalSize: number,
  properties?: ZoneProperties,
): Zone => {
  // close loop with the first element
  const edges = mkEdges(vertices)

  return {
    id,
    vertices,
    properties: properties || [],
    portals: edges.map(mkPortal(portalSize)),
    portalSize,
    edges,
  }
}

export const exportZones = (zones: Zones): ExportZones =>
  zones.map(({ id, vertices, properties, portalSize }) => {
    const maxDevicesProp = properties.find(
      (p): p is ZonePropertyMaxDevices => p.type === 'maxDevices',
    )
    const noStopProp = properties.find((p): p is ZonePropertyNoStop => p.type === 'noStop')
    const maxSpeedProp = properties.find((p): p is ZonePropertyMaxSpeed => p.type === 'maxSpeed')

    const maxDevices = maxDevicesProp ? { maxDevices: maxDevicesProp.maxDevices } : {}
    const noStop = noStopProp ? { noStop: true } : {}
    const maxSpeed = maxSpeedProp ? { maxSpeed: maxSpeedProp.speed } : {}

    return {
      id,
      vertices,
      portalSize,
      ...maxDevices,
      ...maxSpeed,
      ...noStop,
    }
  })

export const mkZonesFromExport = (data: ExportZones): Zones => {
  const getZoneProperties = (zone: ExportZone): ZoneProperties => {
    // tslint:disable-next-line: readonly-array
    const props: ZoneProperty[] = []
    if (zone.maxDevices !== undefined) {
      props.push({ type: 'maxDevices', maxDevices: zone.maxDevices })
    }
    if (zone.noStop !== undefined) {
      props.push({ type: 'noStop' })
    }
    if (zone.maxSpeed !== undefined) {
      props.push({ type: 'maxSpeed', speed: zone.maxSpeed })
    }
    return props
  }
  return data.map((ex) => mkZone(ex.id, ex.vertices, ex.portalSize, getZoneProperties(ex)))
}
