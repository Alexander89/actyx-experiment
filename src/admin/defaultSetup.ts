import { Pond } from '@actyx/pond'
import { GlobalRefFish, AdminUiFish, StationFish, AgvFish, AgvEventType } from '../fish'
import { createTransformData } from '../math/translateMap'
import { Vec } from '../math/vec2d'

const agv1Id = 'agv1'
const station1Id = 'Workstation 1'
const station2Id = 'Workstation 2'
const storage1Id = 'Storage 1'
const storage2Id = 'Storage 2'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const setupEveryThing = (pond: Pond): void => {
  // created manually in map or with AGV1
  type GlobalPos = {
    origin: Vec
    ref: Vec
  }
  const globalPos: GlobalPos = {
    origin: [0, 0],
    ref: [0, 1],
  }
  AdminUiFish.emitUpdateOrigin(pond, [343, 443])
  AdminUiFish.emitUpdateRef(pond, [343, 429])
  GlobalRefFish.emitUpdateOrigin(pond, globalPos.origin)
  GlobalRefFish.emitUpdateRef(pond, globalPos.ref)

  StationFish.emitSetPosition(pond, station1Id, [7.07, 4.06], 1.56, [7.07, 4.06], 1.56)
  StationFish.emitSetPosition(pond, station2Id, [3.96, 8.05], -3.13, [3.96, 8.05], -3.13)

  StationFish.emitSetPosition(pond, storage1Id, [3.56, -1.39], -0.01, [3.56, -1.39], -0.01)
  StationFish.emitSetPosition(pond, storage2Id, [3.93, 14.97], -3.13, [3.93, 14.97], -3.13)

  AgvFish.emitSetup(pond, {
    type: AgvEventType.setupAgv,
    id: agv1Id,
    agvType: 'apollon',
    battery: 42,
    position: [0, 0],
    rotation: 0,
    speed: 0,
    transform: {
      rotateRad: 0,
      scale: 1,
      translate: [0, 0],
    },
    origin: [0, 0],
    reference: [0, 1],
  })

  const agv1GlobTrans = createTransformData(globalPos.origin, globalPos.ref, [10, 10], [10, 15])
  AgvFish.emitPostEvent(pond, {
    type: AgvEventType.mapTransformSet,
    id: agv1Id,
    transform: {
      rotateRad: agv1GlobTrans.rotate,
      scale: agv1GlobTrans.scaleFactor,
      translate: agv1GlobTrans.translate,
    },
    origin: [10, 10],
    reference: [10, 15],
  })

  AgvFish.emitPostEvent(pond, {
    type: AgvEventType.offlineChanged,
    id: agv1Id,
    offline: false,
  })
}
