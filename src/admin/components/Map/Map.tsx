// tslint:disable: no-object-mutation
import { usePond, useRegistryFish } from '@actyx-contrib/react-pond'
import { AgvFish, GlobalRefState, StationFish, ZoneFish } from '../../../fish'
import { ActiveState, OfflineState } from '../../../fish/agvFish'
import { DefinedState as StationDefinedState } from '../../../fish/stationFish'
import { DefinedState as Zone } from '../../../fish/zoneFish'
import { pointInPolygon, pointOnEdge } from '../../../math/vectorUtil'
import * as React from 'react'
import {
  createTransformData,
  TransformData,
  transformInvPos,
  transformPos,
} from '../../../math/translateMap'
import { add, divF, mulF, rotate, round, scale, sub, Vec, vec2, vLength } from '../../../math/vec2d'
import { mkZone } from '../../../math/zones'
import { ChangeModeControl } from './ChangeModeControl'
import { drawDot, drawVec, drawZone } from './drawLib'
import { GlobalRefControl } from './GlobalRefControl'
import { PositionControl } from './PositionControl'
import { ZoneControl } from './ZoneControl'

type AgvDefinedState = ActiveState | OfflineState
export type UiMode = 'move' | 'zones' | 'positions' | 'globalRef'
type MouseEv = React.MouseEvent<HTMLCanvasElement, MouseEvent>

export type PositionData = {
  name: string
  dockPos: Vec
  dockAngleRad: number
  preDockPos: Vec
  preDockAngleRad: number
}
export type PositionDataList = ReadonlyArray<PositionData>

type Props = {
  background: string
  width: number
  height: number
  mapTransformation: TransformData
  globalRef: GlobalRefState
}

export const Map = ({
  background,
  width,
  height,
  mapTransformation,
  globalRef,
}: Props): JSX.Element => {
  const pond = usePond()

  const stations = useRegistryFish(StationFish.registry(), Object.keys, StationFish.of)
  const positions = React.useMemo(
    () =>
      stations
        .map((s) => s.state)
        .filter((st): st is StationDefinedState => st.type === 'defined')
        .map((stationPos) => ({ ...stationPos, name: stationPos.id })),
    [JSON.stringify(stations)],
  )

  const allZones = useRegistryFish(ZoneFish.registry(), Object.keys, ZoneFish.of)
  const zones = React.useMemo(
    () =>
      allZones
        .map((s) => s.state)
        .filter((zone): zone is Zone => ['active', 'inactive', 'invalid'].includes(zone.type)),
    [JSON.stringify(allZones)],
  )

  const allAgvs = useRegistryFish(AgvFish.registry(), Object.keys, AgvFish.of)
  const agvs = React.useMemo(
    () =>
      allAgvs.map((s) => s.state).filter((agv): agv is AgvDefinedState => agv.type !== 'undefined'),
    [JSON.stringify(allAgvs)],
  )

  // canvas
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [bg, setBg] = React.useState<HTMLImageElement>()
  const [mode, setMode] = React.useState<UiMode>('move')

  // zone
  const [newZoneVertices, setNewZoneVertices] = React.useState<ReadonlyArray<Vec>>([])

  // position
  const [selectedPos, setSelectedPos] = React.useState<number>(-1)
  const [newPos, setNewPos] = React.useState<Vec>()
  const [globalTransformation, setGlobalTransformation] = React.useState<TransformData>({
    rotate: 0,
    scaleFactor: 1,
    translate: [0, 0],
  })
  const [tempPositionData, setTempPositionData] = React.useState<PositionData>()

  // map user input
  const [mouseDown, setMouseDown] = React.useState(false)
  const [lastMousePos, setLastMousePos] = React.useState<Vec>(vec2(0, 0))
  const [mapMove, setMapMoveIntern] = React.useState<Vec>(vec2(0, 0))
  const [mapZoom, setMapZoom] = React.useState<number>(2)
  const setMapMove = React.useCallback(
    (pos: Vec) => {
      if (!bg) {
        return
      }
      const overlap = 20 * mapZoom
      setMapMoveIntern(
        vec2(
          Math.max(Math.min(pos[0], width - overlap), -bg.width * mapZoom + 20),
          Math.max(Math.min(pos[1], height - overlap), -bg.height * mapZoom + 20),
        ),
      )
    },
    [bg, mapZoom, setMapMoveIntern],
  )

  // user input
  const getMousePosCanvas = (ev: MouseEv) =>
    vec2(
      ev.clientX - (ev.target as HTMLElement).offsetLeft + window.scrollX,
      ev.clientY - (ev.target as HTMLElement).offsetTop + window.scrollY,
    )
  const getMousePos = (ev: MouseEv) => scale(sub(getMousePosCanvas(ev), mapMove), 1 / mapZoom)

  const pixelToMapSpace = (pos: Vec): Vec =>
    mulF(transformInvPos(vec2(0, 0), mapTransformation)(pos), vec2(-1, 1))
  const mapToGlobalSpace = (pos: Vec): Vec =>
    transformInvPos(globalRef.origin, globalTransformation)(pos)
  const pixelToGlobalSpace = (pos: Vec): Vec => mapToGlobalSpace(pixelToMapSpace(pos))

  const mapToPixelSpace = (pos: Vec): Vec =>
    transformPos(vec2(0, 0), mapTransformation)(mulF(pos, vec2(-1, 1)))
  const globalToMapSpace = (pos: Vec): Vec =>
    transformPos(globalRef.origin, globalTransformation)(pos)
  const globalToPixelSpace = (pos: Vec): Vec => mapToPixelSpace(globalToMapSpace(pos))

  const canvasClick = React.useCallback(
    (ev: MouseEv) => {
      const pPixel = getMousePos(ev)
      // const pMap = pixelToMapSpace(pPixel)
      const pGlobal = pixelToGlobalSpace(pPixel)
      switch (mode) {
        case 'move': {
          console.log(`vec2(${pGlobal[0]}, ${pGlobal[1]})`, pPixel)
          return
        }
        case 'zones': {
          console.log(`vec2(${pGlobal[0]}, ${pGlobal[1]})`)
          setNewZoneVertices([...newZoneVertices, pGlobal])
          return
        }
        case 'positions': {
          const selectPos = positions.findIndex(
            (pd) =>
              vLength(sub(pd.dockPos, pGlobal)) <= 0.5 ||
              vLength(sub(pd.preDockPos, pGlobal)) <= 0.5,
          )
          setSelectedPos(selectPos)
          setNewPos(selectPos === -1 ? pGlobal : undefined)
          return
        }
        case 'globalRef': {
          setNewPos(pGlobal)
          return
        }
      }
    },
    [
      getMousePos,
      mode,
      newZoneVertices,
      positions,
      mapMove,
      mapZoom,
      mapTransformation,
      globalTransformation,
    ],
  )
  const canvasMouseDown = (ev: MouseEv) =>
    (mode === 'move' || ev.button === 1) &&
    (setMouseDown(true), setLastMousePos(getMousePosCanvas(ev)))
  const canvasMouseUp = (ev: MouseEv) =>
    (mode === 'move' || ev.button === 1) && (setMouseDown(false), setLastMousePos(vec2(0, 0)))
  const canvasMouseMove = (ev: MouseEv) => {
    if (!mouseDown || (mode !== 'move' && ev.buttons !== 4)) {
      return
    }
    const moveTo = getMousePosCanvas(ev)
    const delta = sub(moveTo, lastMousePos)
    setMapMove(add(mapMove, delta))
    setLastMousePos(moveTo)
  }
  const canvasWheel = (ev: React.WheelEvent<HTMLCanvasElement>) => {
    const newZoom = mapZoom - ev.deltaY * 0.005

    const target = ev.target as HTMLCanvasElement | null
    if (!target || !bg) {
      return
    }
    const targetSize = vec2(bg.width, bg.height)

    const mousePos = getMousePos(ev)
    const procScale = divF(mousePos, targetSize)
    const deltaSize = sub(scale(targetSize, mapZoom), scale(targetSize, newZoom))
    const deltaMove = mulF(deltaSize, procScale)

    // console.log(procScale, deltaSize, deltaMove)
    const newMapZoom = Math.max(Math.min(newZoom, 8), 0.5)
    if (newMapZoom === mapZoom) {
      return
    }
    setMapZoom(newMapZoom)
    setMapMove(add(mapMove, deltaMove))
  }

  // load Background
  React.useEffect(() => {
    if (background) {
      console.log('SetBackground')
      const b = new Image()
      b.src = background
      b.onload = () => setBg(b)
    }
  }, [background])

  React.useEffect(
    () =>
      setGlobalTransformation(createTransformData([0, 0], [0, 1], globalRef.origin, globalRef.ref)),
    [JSON.stringify(globalRef)],
  )

  // draw map
  React.useEffect(() => {
    const ctx = getContext(canvasRef)
    ctx.resetTransform()
    ctx.clearRect(0, 0, width, height)
    ctx.translate(...mapMove)
    ctx.scale(mapZoom, mapZoom)
    if (bg) {
      ctx.drawImage(bg, 0, 0, bg.width, bg.height)
    }

    ctx.lineWidth = 0.01 // 1cm

    const drawPosition = (p: PositionData, idx: number) => {
      const inAnArea = zones.some(({ edges }: Zone) => pointInPolygon(p.dockPos, edges))
      const onEdge = zones.some(({ edges }: Zone) => edges.some((e) => pointOnEdge(p.dockPos, e)))
      ctx.fillStyle = ctx.strokeStyle = onEdge ? '#FF00FF' : inAnArea ? '#00FF00' : '#FF0000'

      const size = idx === selectedPos ? 0.18 : 0.1
      drawDot(ctx, p.dockPos, size)
      drawVec(ctx, p.dockPos, rotate(vec2(0, 0.5), p.dockAngleRad))

      drawDot(ctx, p.preDockPos, size)
      drawVec(ctx, p.preDockPos, rotate(vec2(0, 0.5), p.preDockAngleRad))
      ctx.save()
      ctx.scale(1, -1)
      ctx.fillText(p.name, p.dockPos[0], -p.dockPos[1])
      ctx.restore()
    }

    const drawAgv = (agv: AgvDefinedState) => {
      const trans: TransformData = {
        rotate: agv.mapTransform.rotateRad,
        scaleFactor: agv.mapTransform.scale,
        translate: agv.mapTransform.translate,
      }
      const p = transformInvPos(globalRef.origin, trans)(agv.position)
      const inAnArea = zones.some(({ edges }: Zone) => pointInPolygon(p, edges))
      const onEdge = zones.some(({ edges }: Zone) => edges.some((e) => pointOnEdge(p, e)))
      ctx.fillStyle = ctx.strokeStyle = onEdge ? '#FF00FF' : inAnArea ? '#00FF00' : '#0000AA'

      drawDot(ctx, p, 0.16)
      drawVec(ctx, p, rotate(vec2(0, 0.5), agv.rotation))
      ctx.save()
      ctx.scale(1, -1)
      ctx.fillText(agv.id, p[0], -p[1])
      ctx.restore()
    }
    ctx.fillStyle = ctx.strokeStyle = '#808000'

    ctx.translate(...mapTransformation.translate)
    ctx.scale(-mapTransformation.scaleFactor, mapTransformation.scaleFactor)
    ctx.rotate(mapTransformation.rotate)

    drawDot(ctx, vec2(0, 0), 0.2)
    drawDot(ctx, vec2(0, 1), 0.2)

    ctx.fillStyle = ctx.strokeStyle = '#000000'

    drawDot(ctx, globalRef.origin, 0.1)
    drawDot(ctx, globalRef.ref, 0.1)

    ctx.translate(...globalTransformation.translate)
    ctx.scale(globalTransformation.scaleFactor, globalTransformation.scaleFactor)
    ctx.rotate(globalTransformation.rotate)

    if (newPos) {
      drawDot(ctx, newPos)
    }
    drawDot(ctx, [5, 5], 0.1)

    ctx.fillStyle = ctx.strokeStyle = '#A0A0FF'
    zones.forEach((z) => drawZone(ctx, z))

    positions.forEach(drawPosition)

    if (mode === 'positions' && tempPositionData) {
      drawPosition(tempPositionData, -2)
    }
    agvs.forEach(drawAgv)

    ctx.fillStyle = ctx.strokeStyle = '#A0A0FF'
    newZoneVertices.forEach((d) => drawDot(ctx, d))
  }, [
    agvs,
    bg,
    globalRef,
    globalTransformation,
    mapMove,
    mapTransformation,
    mapZoom,
    newPos,
    newZoneVertices,
    positions,
    selectedPos,
    tempPositionData,
    zones,
  ])

  return (
    <div>
      <canvas
        ref={canvasRef}
        onClick={canvasClick}
        onMouseDown={canvasMouseDown}
        onMouseUp={canvasMouseUp}
        onMouseMove={canvasMouseMove}
        onWheel={canvasWheel}
        width={width}
        height={height}
        style={{ border: 'solid 2px black' }}
      >
        canvas not supported!
      </canvas>
      <div>
        {mode === 'move' && <ChangeModeControl onSetMode={setMode} />}
        {mode === 'zones' && (
          <ZoneControl
            onCancel={() => (setMode('move'), setNewZoneVertices([]))}
            onCreateZone={(zoneName, portalSize, properties) => {
              ZoneFish.emitSetData(pond, mkZone(zoneName, newZoneVertices, portalSize, properties))
              setNewZoneVertices([])
            }}
            onActivateZone={(zoneId) => ZoneFish.emitActivate(pond, zoneId)}
            onDeactivateZone={(zoneId) => ZoneFish.emitDeactivate(pond, zoneId)}
            onDeleteZone={(zoneId) => ZoneFish.emitDelete(pond, zoneId)}
            onUndo={() => setNewZoneVertices(newZoneVertices.slice(0, newZoneVertices.length - 1))}
            existingZones={zones}
          />
        )}
        {mode === 'positions' && (
          <PositionControl
            existingPositionNames={positions.map((p) => p.name)}
            mousePosition={newPos}
            selected={selectedPos !== -1 ? positions[selectedPos] : undefined}
            tempPosition={tempPositionData}
            onUpdateTempDrawing={setTempPositionData}
            onCreateAddPosition={(pos) => {
              StationFish.emitSetPosition(
                pond,
                pos.name,
                pos.preDockPos,
                pos.preDockAngleRad,
                pos.dockPos,
                pos.dockAngleRad,
              )
              setNewPos(undefined)
              setSelectedPos(-1)
            }}
            onDelete={() => {
              StationFish.emitDelete(pond, positions[selectedPos].name)
              setSelectedPos(-1)
            }}
            duplicateSelected={() => {
              const newTempPos = {
                ...positions[selectedPos],
                name: positions[selectedPos].name + ' copy',
              }

              setTempPositionData(newTempPos)
              setSelectedPos(-1)
            }}
            onCancel={() => (setMode('move'), setNewPos(undefined), setSelectedPos(-1))}
          />
        )}
        {mode === 'globalRef' && (
          <GlobalRefControl
            onCancel={() => setMode('move')}
            positionGlobal={newPos || vec2(0, 0)}
            positionMap={(newPos && round(globalToMapSpace(newPos), 3)) || vec2(0, 0)}
            positionPixel={(newPos && round(globalToPixelSpace(newPos), 3)) || vec2(0, 0)}
            onSetPositionPixel={(p) => setNewPos(pixelToGlobalSpace(p))}
            onSetPositionMap={(p) => setNewPos(mapToGlobalSpace(p))}
            onSetPositionGlobal={(p) => setNewPos(p)}
          />
        )}
      </div>
    </div>
  )
}
Map.displayName = 'Map'

const getContext = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  if (!canvasRef.current) {
    throw new Error('canvas not supported!')
  }
  const canvas = canvasRef.current
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('2d not supported!')
  }
  ctx.font = '1px Arial'
  return ctx
}
