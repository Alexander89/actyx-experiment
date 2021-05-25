import { Fish, FishId, PendingEmission, Pond, Tag, Tags } from '@actyx/pond'
import { EventAgvControl, SimpleStationFish } from './simpleStationFish'

/*
 * Fish State
 */
export type AgvMetaData = {
  id: string
  agvType: string
}

/*
 * Fish State
 */
export type UndefinedState = {
  id: string
  type: 'undefined'
}

export type IdleState = {
  type: 'idle'
  dockedAt?: string
} & AgvMetaData

export type OfflineState = {
  type: 'offline'
  dockedAt?: string
} & AgvMetaData

export type DockedState = {
  type: 'docked'
  dockedAt: string
} & AgvMetaData

export type DrivingState = {
  type: 'driving' | 'requestForDrive'
  from: string
  to: string
} & AgvMetaData

export type StoppedState = IdleState | OfflineState
export type ActiveState = DockedState | DrivingState

export type State = UndefinedState | StoppedState | ActiveState

/**
 * Fish Events
 */

export type AgvAvailableEvent = {
  eventType: 'agvAvailable'
  agvId: string
}
export type AgvEnabledEvent = {
  eventType: 'agvEnabled'
  agvId: string
}
export type AgvDisableEvent = {
  eventType: 'agvDisable'
  agvId: string
}
export type AgvConfigurationSetEvent = {
  eventType: 'agvConfigurationSet'
  agvId: string
  agvType: string
}
export type AgvDeletedEvent = {
  eventType: 'agvDeleted'
  agvId: string
}
export type AgvMovementStartedEvent = {
  eventType: 'agvMovementStarted'
  agvId: string
  fromStationId: string
  toStationId: string
}
export type AgvMovementStoppedEvent = {
  eventType: 'agvMovementStopped'
  agvId: string
  fromStationId: string
  toStationId: string
}
export type AgvArrivedEvent = {
  eventType: 'agvArrived'
  agvId: string
  stationId: string
}
export type AgvLeftEvent = {
  eventType: 'agvLeft'
  agvId: string
  stationId: string
}
export type AgvModeEvent = AgvEnabledEvent | AgvDisableEvent
export type AgvStationInteraction = AgvArrivedEvent | AgvLeftEvent
export type Event =
  | AgvAvailableEvent
  | AgvEnabledEvent
  | AgvDisableEvent
  | AgvConfigurationSetEvent
  | AgvDeletedEvent
  | AgvMovementStartedEvent
  | AgvMovementStoppedEvent
  | AgvStationInteraction

const emitAvailable = (pond: Pond, agvId: string): PendingEmission =>
  pond.emit(agvTag.withId(agvId).and(availableTag), {
    eventType: 'agvAvailable',
    agvId,
  })
const emitConfiguration = (pond: Pond, agvId: string, agvType: string): PendingEmission =>
  pond.emit(agvTag.withId(agvId), {
    eventType: 'agvConfigurationSet',
    agvId,
    agvType,
  })
const emitEnabled = (pond: Pond, agvId: string): PendingEmission =>
  pond.emit(agvTag.withId(agvId).and(modeTag), {
    eventType: 'agvEnabled',
    agvId,
  })
const emitDisabled = (pond: Pond, agvId: string): PendingEmission =>
  pond.emit(agvTag.withId(agvId).and(modeTag), {
    eventType: 'agvDisable',
    agvId,
  })
const emitMovementStarted = (
  emit: (tags: Tags<AgvMovementStartedEvent>, event: AgvMovementStartedEvent) => void,
  agvId: string,
  fromStationId: string,
  toStationId: string,
): void =>
  emit(agvTag.withId(agvId).and(busyTag), {
    eventType: 'agvMovementStarted',
    agvId,
    fromStationId,
    toStationId,
  })

const emitArrived = (pond: Pond, agvId: string, stationId: string): PendingEmission =>
  pond.emit(
    agvTag
      .withId(agvId)
      .and(arrivedTag)
      .and(SimpleStationFish.tags.simpleStationAgvTag.withId(stationId)),
    {
      eventType: 'agvArrived',
      agvId,
      stationId,
    },
  )
const emitLeft = (
  emit: (tags: Tags<AgvLeftEvent>, event: AgvLeftEvent) => void,
  agvId: string,
  stationId: string,
): void =>
  emit(
    agvTag
      .withId(agvId)
      .and(leftTag)
      .and(SimpleStationFish.tags.simpleStationAgvTag.withId(stationId)),
    {
      eventType: 'agvLeft',
      agvId,
      stationId,
    },
  )

const agvTag = Tag<Event | EventAgvControl>('simple-agv')
const availableTag = Tag<AgvAvailableEvent>('simple-agv.available')
const modeTag = Tag<AgvModeEvent>('simple-agv.mode')
const removedTag = Tag<AgvDeletedEvent>('simple-agv.removed')
const busyTag = Tag<AgvMovementStartedEvent>('simple-agv.busy')
const arrivedTag = Tag<AgvArrivedEvent>('simple-agv.arrived')
const leftTag = Tag<AgvLeftEvent>('simple-agv.left')
const controlTag = Tag<EventAgvControl>('simple-agv.control')

export const SimpleAgvFish = {
  tags: {
    agvTag,
    availableTag,
    modeTag,
    removedTag,
    busyTag,
    arrivedTag,
    leftTag,
    controlTag,
  },
  of: (id: string): Fish<State, Event | EventAgvControl> => ({
    fishId: FishId.of('simple-agvFish', id, 0),
    initialState: {
      type: 'undefined',
      id,
    },
    where: agvTag.withId(id),
    onEvent: (state, event) => {
      if (state.type === 'undefined') {
        if (event.eventType === 'agvConfigurationSet') {
          return {
            type: 'offline',
            agvType: event.agvType,
            id,
          }
        }
        return state
      }

      switch (event.eventType) {
        case 'agvEnabled': {
          if (state.type === 'offline') {
            return {
              type: 'idle',
              agvType: state.agvType,
              id,
              dockedAt: state.dockedAt,
            }
          }
          return state
        }
        case 'agvDisable': {
          return {
            type: 'offline',
            agvType: state.agvType,
            id,
          }
        }
        case 'agvConfigurationSet': {
          return {
            ...state,
            agvType: event.agvType,
          }
        }
        case 'agvDeleted': {
          return {
            type: 'undefined',
            id,
          }
        }
        case 'agvMovementStarted': {
          return {
            type: 'driving',
            agvType: state.agvType,
            id,
            from: event.fromStationId,
            to: event.toStationId,
          }
        }
        case 'agvMovementStopped': {
          // do we need this?
          return state
        }
        case 'agvArrived': {
          return {
            type: 'docked',
            agvType: state.agvType,
            dockedAt: event.stationId,
            id,
          }
        }
        case 'agvReleased': {
          return {
            type: 'idle',
            agvType: state.agvType,
            id,
            dockedAt: event.stationId,
          }
        }
        case 'agvSent': {
          if (state.type === 'idle' || state.type === 'docked') {
            return {
              type: 'requestForDrive',
              agvType: state.agvType,
              id,
              from: event.fromStationId,
              to: event.toStationId,
            }
          }
          return state
        }
        case 'agvRequested': {
          if (state.type === 'idle') {
            return {
              type: 'requestForDrive',
              agvType: state.agvType,
              id,
              from: state.dockedAt || 'UNKNOWN',
              to: event.toStationId,
            }
          }
          return state
        }
      }
      return state
    },
  }),
  allExistingAgv: (): Fish<Record<string, boolean>, AgvAvailableEvent | AgvDeletedEvent> => ({
    fishId: FishId.of('simpleAgvRegistry', 'allExistingAgv', 0),
    initialState: {},
    where: availableTag.or(removedTag),
    onEvent: (state, event) => {
      switch (event.eventType) {
        case 'agvAvailable': {
          state[event.agvId] = true
          return state
        }
        case 'agvDeleted': {
          delete state[event.agvId]
          return state
        }
      }
      return state
    },
  }),
  allActiveAgv: (): Fish<
    Record<string, boolean>,
    AgvAvailableEvent | AgvModeEvent | AgvDeletedEvent
  > => ({
    fishId: FishId.of('simpleAgvRegistry', 'allActiveAgv', 0),
    initialState: {},
    where: availableTag.or(modeTag).or(removedTag),
    onEvent: (state, event) => {
      switch (event.eventType) {
        case 'agvEnabled': {
          state[event.agvId] = true
          return state
        }
        case 'agvDisable':
        case 'agvDeleted': {
          delete state[event.agvId]
          return state
        }
      }
      return state
    },
  }),
  allIdleAgv: (): Fish<
    Record<string, boolean>,
    AgvModeEvent | AgvDeletedEvent | EventAgvControl
  > => ({
    fishId: FishId.of('simpleAgvRegistry', 'allIdleAgv', 0),
    initialState: {},
    where: modeTag.or(removedTag).or(controlTag),
    onEvent: (state, event) => {
      switch (event.eventType) {
        case 'agvEnabled':
        case 'agvReleased': {
          state[event.agvId] = true
          return state
        }
        case 'agvSent':
        case 'agvRequested':
        case 'agvDisable':
        case 'agvDeleted': {
          delete state[event.agvId]
          return state
        }
      }
      return state
    },
  }),
  emitAvailable,
  emitConfiguration,
  emitEnabled,
  emitDisabled,
  emitMovementStarted,
  emitArrived,
  emitLeft,
}
export const isAgvState = {
  defined: (state: State): state is StoppedState | ActiveState =>
    isAgvState.stopped(state) || isAgvState.active(state),

  idle: (state: State): state is IdleState => state.type === 'idle',
  offline: (state: State): state is OfflineState => state.type === 'offline',
  docked: (state: State): state is DockedState => state.type === 'docked',
  driving: (state: State): state is DrivingState =>
    state.type === 'driving' || state.type === 'requestForDrive',

  stopped: (state: State): state is StoppedState =>
    isAgvState.idle(state) || isAgvState.offline(state),
  active: (state: State): state is ActiveState =>
    isAgvState.docked(state) || isAgvState.driving(state),
}
