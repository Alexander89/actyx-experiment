import { Fish, FishId, PendingEmission, Pond, Reduce, Tag } from '@actyx/pond'
import { eq, Vec } from '../math/vec2d'

/*
 * Fish State
 */
type Position = Vec
type AgvMetaData = {
  id: string
  battery: number
  position: Position
  rotation: number
  speed: number
  agvType: string
  origin: Position
  reference: Position
}

export type AgvMapTransform = {
  rotateRad: number
  scale: number
  translate: Position
}

export type AgvDriveOrder = {
  station: string
  maxSpeed: number
  move: 'drive' | 'pause'
}

export type UndefinedState = {
  id: string
  type: 'undefined'
}
export type ActiveState = {
  type: 'stopped' | 'moving'
  materialRequest?: string
  errorCode?: number
  errorDescription?: string

  mapTransform: AgvMapTransform
  driveOrder?: AgvDriveOrder
} & AgvMetaData

export type OfflineState = {
  type: 'offline'
  errorCode?: number
  errorDescription?: string
  mapTransform: AgvMapTransform
  driveOrder?: AgvDriveOrder
} & AgvMetaData

export type State = UndefinedState | ActiveState | OfflineState

/**
 * Fish Events
 */
export enum EventType {
  setupAgv = 'setupAgv',
  offlineChanged = 'offlineChanged',
  mapTransformSet = 'mapTransformSet',
  driveOrderSet = 'driveOrderSet',
  driveOrderRemoved = 'driveOrderRemoved',
  errorFixed = 'errorFixed',
  moveStarted = 'moveStarted',
  stopped = 'stopped',
  errorReported = 'errorReported',
  positionUpdated = 'positionUpdated',
  metaDataUpdated = 'metaDataUpdated',
  materialRequestAssigned = 'materialRequestAssigned',
  materialRequestUnassigned = 'materialRequestUnassigned',
}
export type SetupAgvEvent = {
  type: EventType.setupAgv
  id: string
  transform: AgvMapTransform
  position: Position
  rotation: number
  speed: number
  battery: number
  agvType: string
  origin: Position
  reference: Position
}
export type OfflineChangedEvent = {
  type: EventType.offlineChanged
  id: string
  offline: boolean
}
export type MapTransformSetEvent = {
  type: EventType.mapTransformSet
  id: string
  origin: Position
  reference: Position
  transform: AgvMapTransform
}
export type DriveOrderSetEvent = {
  type: EventType.driveOrderSet
  id: string
  order: AgvDriveOrder
}
export type DriveOrderRemovedEvent = {
  type: EventType.driveOrderRemoved
  id: string
}
export type ErrorFixedEvent = {
  type: EventType.errorFixed
  id: string
}
export type MoveStartedEvent = {
  type: EventType.moveStarted
  id: string
}
export type StoppedEvent = {
  type: EventType.stopped
  id: string
}
export type ErrorReportedEvent = {
  type: EventType.errorReported
  id: string
  code: number
  description: string
}
export type PositionUpdatedEvent = {
  type: EventType.positionUpdated
  id: string
  position: Position
  rotation: number
  speed: number
}
export type MetaDataUpdatedEvent = {
  type: EventType.metaDataUpdated
  id: string
  battery: number
  agvType: string
}
export type MaterialRequestAssignedEvent = {
  type: EventType.materialRequestAssigned
  id: string
  materialRequest: string
}
export type MaterialRequestUnassignedEvent = {
  type: EventType.materialRequestUnassigned
  id: string
  materialRequest: string
}

export type PostableEvents =
  | OfflineChangedEvent
  | MapTransformSetEvent
  | DriveOrderSetEvent
  | DriveOrderRemovedEvent
  | ErrorFixedEvent
  | MoveStartedEvent
  | StoppedEvent
  | ErrorReportedEvent
  | MetaDataUpdatedEvent

export type Event =
  | SetupAgvEvent
  | PostableEvents
  | PositionUpdatedEvent
  | MaterialRequestAssignedEvent
  | MaterialRequestUnassignedEvent

export const onEvent: Reduce<State, Event> = (state, event) => {
  if (state.type === 'undefined') {
    // this will never happen
    if (event.type === EventType.setupAgv) {
      return {
        id: state.id,
        type: 'offline',
        agvType: event.agvType,
        battery: event.battery,
        speed: event.speed,
        position: event.position,
        rotation: event.rotation,
        mapTransform: event.transform,
        origin: event.origin || [0, 0],
        reference: event.reference || [0, 1],
      }
    }
    return state
  }

  switch (event.type) {
    case EventType.setupAgv: {
      return {
        ...state,
        agvType: event.agvType,
        battery: event.battery,
        speed: event.speed,
        position: event.position,
        rotation: event.rotation,
        mapTransform: event.transform,
        origin: event.origin || [0, 0],
        reference: event.reference || [0, 1],
      }
    }
    case EventType.offlineChanged: {
      if (event.offline && state.type !== 'offline' && state.materialRequest === undefined) {
        return {
          ...state,
          type: 'offline',
        }
      } else if (!event.offline && state.type === 'offline') {
        return {
          ...state,
          type: 'stopped',
        }
      }
      return state
    }
    case EventType.mapTransformSet: {
      return {
        ...state,
        origin: event.origin,
        reference: event.reference,
        mapTransform: event.transform,
      }
    }
    case EventType.driveOrderSet: {
      return {
        ...state,
        driveOrder: event.order,
      }
    }
    case EventType.driveOrderRemoved: {
      return {
        ...state,
        driveOrder: undefined,
      }
    }
    case EventType.moveStarted: {
      return {
        ...state,
        type: 'moving',
      }
    }
    case EventType.stopped: {
      return {
        ...state,
        type: 'stopped',
      }
    }
    case EventType.errorReported: {
      // this will never happen
      return {
        ...state,
        errorCode: event.code,
        errorDescription: event.description,
      }
    }
    case EventType.errorFixed: {
      return {
        ...state,
        errorCode: undefined,
        errorDescription: undefined,
      }
    }
    case EventType.positionUpdated: {
      return {
        ...state,
        position: event.position,
        rotation: event.rotation,
        speed: event.speed,
      }
    }
    case EventType.metaDataUpdated: {
      return {
        ...state,
        battery: event.battery,
        agvType: event.agvType,
      }
    }
    case EventType.materialRequestAssigned: {
      if (state.type !== 'offline' && !state.materialRequest) {
        return {
          ...state,
          materialRequest: event.materialRequest,
        }
      }
      return state
    }
    case EventType.materialRequestUnassigned: {
      if (state.type !== 'offline' && state.materialRequest === event.materialRequest) {
        return {
          ...state,
          materialRequest: undefined,
        }
      }
      return state
    }
  }
  return state
}

const emitSetup = (pond: Pond, setup: SetupAgvEvent): PendingEmission =>
  pond.emit(agvTag.withId(setup.id).and(agvSetupTag.withId(setup.id)), setup)

const emitUpdatePosition = (
  pond: Pond,
  id: string,
  position: Vec,
  rotation: number,
  speed: number,
): PendingEmission =>
  pond.run(AgvFish.of(id), (state, enQ) => {
    if (
      state.type !== 'undefined' &&
      (!eq(state.position, position) || state.rotation !== rotation || state.speed !== speed)
    ) {
      console.log('publish position', position, rotation)
      enQ(agvTag.withId(id), { type: EventType.positionUpdated, id, position, rotation, speed })
    }
  })

const emitPostEvent = (pond: Pond, event: PostableEvents): PendingEmission =>
  pond.emit(agvTag.withId(event.id), event)

const emitStopAssignedMaterialRequest = (
  pond: Pond,
  id: string,
  materialRequest: string,
): PendingEmission =>
  pond.run(AgvFish.of(id), (state, enQ) => {
    if (
      (state.type === 'moving' || state.type === 'stopped') &&
      state.materialRequest &&
      state.materialRequest === materialRequest
    ) {
      enQ(agvTag.withId(id), { type: EventType.materialRequestUnassigned, id, materialRequest })
    }
  })

const emitExecuteMaterialRequest = (
  pond: Pond,
  id: string,
  materialRequest: string,
  station: string,
): void => {
  pond.emit(agvTag.withId(id), {
    type: EventType.materialRequestAssigned,
    id,
    materialRequest,
  })
  pond.emit(agvTag.withId(id), {
    type: EventType.driveOrderSet,
    id,
    order: {
      maxSpeed: 100,
      move: 'drive',
      station,
    },
  })
}

const agvTag = Tag<Event>('agv')
const agvSetupTag = Tag<Event>('agv.On')
/*
 * Fish Definition
 */
export const AgvFish = {
  tags: {
    agvTag,
    agvSetupTag,
  },
  of: (id: string): Fish<State, Event> => ({
    fishId: FishId.of('ax.agv', id, 0),
    initialState: { id, type: 'undefined' },
    where: agvTag.withId(id),
    onEvent,
  }),
  registry: (): Fish<Record<string, boolean>, Event> => ({
    fishId: FishId.of('ax.agv.registry', 'registry', 0),
    initialState: {},
    where: agvSetupTag,
    onEvent: (state, event) => {
      state[event.id] = true
      return state
    },
  }),
  emitSetup,
  emitUpdatePosition,
  emitPostEvent,
  emitStopAssignedMaterialRequest,
  emitExecuteMaterialRequest,
}
