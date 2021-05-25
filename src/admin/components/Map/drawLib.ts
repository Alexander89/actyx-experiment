// tslint:disable: no-object-mutation
import { add, scale, sub, Vec, vec2 } from '../../../math/vec2d'
import { centerOfRect, Edge } from '../../../math/vectorUtil'
import { Portal, Zone, ZoneProperties } from '../../../math/zones'

export const drawEdge = (ctx: CanvasRenderingContext2D, { a, b }: Edge): void =>
  drawVec(ctx, a, sub(b, a))

export const drawVec = (ctx: CanvasRenderingContext2D, o: Vec, v: Vec): void => {
  ctx.beginPath()
  ctx.moveTo(o[0], o[1])
  const toX = o[0] + v[0]
  const toY = o[1] + v[1]
  ctx.lineTo(toX, toY)
  ctx.stroke()
  ctx.strokeRect(toX - 0.05, toY - 0.05, 0.1, 0.1)
  ctx.stroke()
}

export const drawDot = (ctx: CanvasRenderingContext2D, p: Vec, size = 0.1): void => {
  ctx.beginPath()
  ctx.arc(p[0], p[1], size, 0, 2 * Math.PI)
  ctx.fill()
  ctx.stroke()
}

export const drawPolygon = (
  ctx: CanvasRenderingContext2D,
  dots: ReadonlyArray<Vec>,
  edges: ReadonlyArray<Edge>,
): void => {
  dots.forEach((p) => drawDot(ctx, p))
  edges.forEach((p) => drawEdge(ctx, p))
}

export const drawDirection = (ctx: CanvasRenderingContext2D, p: Portal): void => {
  const center = centerOfRect({ a: p.vertices[0], b: p.vertices[2] })
  drawVec(ctx, center, scale(p.direction, 1))
}

export const drawZone = (ctx: CanvasRenderingContext2D, z: Zone): void => {
  ctx.fillStyle = ctx.strokeStyle = '#FFCCCC'
  z.portals.forEach((p) => (drawPolygon(ctx, p.vertices, p.edges), drawDirection(ctx, p)))

  ctx.fillStyle = ctx.strokeStyle = '#FF0000'
  const avg = z.vertices.reduce((a, v, _, all) => add(a, scale(v, 1 / all.length)), vec2(0, 0))
  ctx.save()
  ctx.textAlign = 'center'
  ctx.scale(1, -1)
  ctx.fillText(`${z.id} ${propsToStringShort(z.properties)}`, avg[0], -avg[1])
  ctx.stroke()
  ctx.restore()
  // ctx.fillStyle = ctx.strokeStyle = z. ? '#000000' : '#FF0000'
  drawPolygon(ctx, z.vertices, z.edges)
}
export const propsToStringShort = (props: ZoneProperties): string =>
  props
    .map((p) => {
      switch (p.type) {
        case 'maxDevices':
          return `max:${p.maxDevices}`
        case 'maxSpeed':
          return `sp:${p.speed}`
        case 'noStop':
          return `noStop`
        default:
          return ''
      }
    })
    .join(', ')

export const propsToString = (props: ZoneProperties): string =>
  props
    .map((p) => {
      switch (p.type) {
        case 'maxDevices':
          return `max Devices: ${p.maxDevices}`
        case 'maxSpeed':
          return `max Speed: ${p.speed}`
        case 'noStop':
          return `no Stop`
        default:
          return ''
      }
    })
    .join(', ')
