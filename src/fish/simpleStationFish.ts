/**
 * Fish Events
 */

import { Fish, FishId, PendingEmission, Pond, Tag } from '@actyx/pond'
import {
  AgvArrivedEvent,
  AgvDeletedEvent,
  AgvLeftEvent,
  AgvModeEvent,
  AgvStationInteraction,
  SimpleAgvFish,
} from './simpleAgvFish'

export type UndefinedState = {
  type: 'undefined'
  id: string
  goalId: 'unknown'
}

export type IdleState = {
  type: 'idle'
  id: string
  goalId: string
}

export type WaitingState = {
  type: 'waitingForAgv'
  id: string
  goalId: string
  comingAgvId: string[]
}
export type BusyState = {
  type: 'blocked' | 'loadingAgv'
  id: string
  goalId: string
  dockedAgv: string
  comingAgvId: string[]
}

export type State = UndefinedState | IdleState | WaitingState | BusyState

export type StationAvailableEvent = {
  eventType: 'stationAvailable'
  stationId: string
  goalId: string
}
export type AgvRequestedEvent = {
  eventType: 'agvRequested'
  toStationId: string
  agvId: string
}
export type AgvSentEvent = {
  eventType: 'agvSent'
  agvId: string
  fromStationId: string
  toStationId: string
}
export type AgvReleasedEvent = {
  eventType: 'agvReleased'
  stationId: string
  agvId: string
}
export type StationRemovedEvent = {
  eventType: 'stationRemoved'
  stationId: string
}
export type EventAgvControl = AgvRequestedEvent | AgvSentEvent | AgvReleasedEvent
export type Event =
  | StationAvailableEvent
  | StationRemovedEvent
  | EventAgvControl
  | AgvStationInteraction

const emitAgvRequested = (pond: Pond, toStationId: string, agvId: string): PendingEmission =>
  pond.emit(simpleStationTag.withId(toStationId).and(SimpleAgvFish.tags.agvTag.withId(agvId)), {
    eventType: 'agvRequested',
    toStationId,
    agvId,
  })
const emitAgvSent = (
  pond: Pond,
  fromStationId: string,
  toStationId: string,
  agvId: string,
): PendingEmission =>
  pond.emit(simpleStationTag.withId(fromStationId).and(SimpleAgvFish.tags.agvTag.withId(agvId)), {
    eventType: 'agvSent',
    agvId,
    fromStationId,
    toStationId,
  })
const emitAgvReleased = (pond: Pond, stationId: string, agvId: string): PendingEmission =>
  pond.emit(simpleStationTag.withId(stationId).and(SimpleAgvFish.tags.agvTag.withId(agvId)), {
    eventType: 'agvReleased',
    stationId,
    agvId,
  })
const emitStationAvailable = (pond: Pond, stationId: string, goalId: string): PendingEmission =>
  pond.emit(simpleStationTag.withId(stationId).and(simpleStationManageTag), {
    eventType: 'stationAvailable',
    stationId,
    goalId,
  })
const emitStationRemoved = (pond: Pond, stationId: string): PendingEmission =>
  pond.emit(simpleStationTag.withId(stationId).and(simpleStationManageTag), {
    eventType: 'stationRemoved',
    stationId,
  })

const simpleStationTag = Tag<Event | AgvArrivedEvent | AgvLeftEvent>('station.simple')
const simpleStationAgvTag = Tag<AgvArrivedEvent | AgvLeftEvent>('station.simple.agv')
const simpleStationManageTag = Tag<StationAvailableEvent | StationRemovedEvent>(
  'station.simple.manage',
)

export const SimpleStationFish = {
  tags: {
    simpleStationTag,
    simpleStationAgvTag,
    simpleStationManageTag,
  },
  of: (id: string): Fish<State, Event | AgvModeEvent | AgvDeletedEvent> => ({
    fishId: FishId.of('SimpleStationFish', id, 0),
    initialState: {
      type: 'undefined',
      id,
      goalId: 'unknown',
    },
    where: simpleStationTag
      .withId(id)
      .or(simpleStationAgvTag.withId(id))
      .or(SimpleAgvFish.tags.modeTag)
      .or(SimpleAgvFish.tags.removedTag),
    onEvent: (state, event) => {
      switch (event.eventType) {
        case 'stationAvailable': {
          if (state.type === 'undefined') {
            return {
              type: 'idle',
              id,
              goalId: event.goalId,
            }
          }
          state.goalId = event.goalId
          return state
        }
        case 'agvSent': {
          // not interesting
          return state
        }
        case 'agvRequested': {
          if (isStationState.active(state)) {
            if (!state.comingAgvId.includes(event.agvId)) {
              state.comingAgvId.push(event.agvId)
            }
            return state
          }

          return {
            type: 'waitingForAgv',
            id: state.id,
            goalId: state.goalId,
            comingAgvId: [event.agvId],
          }
        }
        case 'agvReleased': {
          if (state.type == 'loadingAgv' && state.dockedAgv == event.agvId) {
            return { ...state, type: 'blocked' }
          }
          return state
        }
        case 'agvArrived': {
          return {
            type: 'loadingAgv',
            id,
            goalId: state.goalId,
            dockedAgv: event.agvId,
            comingAgvId: isStationState.active(state)
              ? state.comingAgvId.filter((i) => i !== event.agvId)
              : [],
          }
        }
        case 'agvLeft': {
          if (isStationState.busy(state) && state.dockedAgv === event.agvId) {
            if (state.comingAgvId.length) {
              return {
                type: 'waitingForAgv',
                id,
                goalId: state.goalId,
                comingAgvId: state.comingAgvId,
              }
            }
            return {
              type: 'idle',
              id,
              goalId: state.goalId,
            }
          }
          return state
        }
        case 'agvEnabled': {
          // not interesting
          return state
        }
        case 'agvDisable':
        case 'agvDeleted': {
          if (isStationState.busy(state) && state.dockedAgv === event.agvId) {
            if (state.comingAgvId.length) {
              return {
                type: 'waitingForAgv',
                id,
                goalId: state.goalId,
                comingAgvId: state.comingAgvId,
              }
            }
            return {
              type: 'idle',
              id,
              goalId: state.goalId,
            }
          }
          if (isStationState.busy(state) && state.comingAgvId.includes(event.agvId)) {
            state.comingAgvId = state.comingAgvId.filter((i) => i !== event.agvId)
            return state
          }
          if (isStationState.waiting(state) && state.comingAgvId.includes(event.agvId)) {
            state.comingAgvId = state.comingAgvId.filter((i) => i !== event.agvId)
            if (state.comingAgvId.length) {
              return state
            }
            return { type: 'idle', id, goalId: state.goalId }
          }
          return state
        }
      }
      return state
    },
  }),
  availableStations: (): Fish<
    Record<string, boolean>,
    StationAvailableEvent | StationRemovedEvent
  > => ({
    fishId: FishId.of('SimpleStationFishAvailableStations', 'availableStations', 0),
    initialState: {},
    where: simpleStationManageTag,
    onEvent: (state, event) => {
      switch (event.eventType) {
        case 'stationAvailable':
          state[event.stationId] = true
          break
        case 'stationRemoved':
          delete state[event.stationId]
          break
      }
      return state
    },
  }),
  emitAgvRequested,
  emitAgvSent,
  emitAgvReleased,
  emitStationAvailable,
  emitStationRemoved,
}
export const isStationState = {
  active: (state: State): state is BusyState | WaitingState =>
    isStationState.busy(state) || isStationState.waiting(state),
  busy: (state: State): state is BusyState =>
    state.type === 'blocked' || state.type === 'loadingAgv',
  waiting: (state: State): state is WaitingState => state.type === 'waitingForAgv',
}
