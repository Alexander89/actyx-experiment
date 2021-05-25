import { Fish, FishId, PendingEmission, Pond, Reduce, Tag } from '@actyx/pond'

/*
 * Fish State
 */
type Vec = [number, number]
export type UndefinedState = {
  type: 'undefined'
  id: string
}
export type DefinedState = {
  type: 'defined'
  id: string
  preDockPos: Vec
  preDockAngleRad: number
  dockPos: Vec
  dockAngleRad: number
}
export type State = UndefinedState | DefinedState

/**
 * Fish Events
 */
export enum EventType {
  deleted = 'deleted',
  positionsSet = 'positionsSet',
}
export type DeletedEvent = {
  type: EventType.deleted
  id: string
}
export type PositionSetEvent = {
  type: EventType.positionsSet
  id: string
  preDockPos: Vec
  preDockAngleRad: number
  dockPos: Vec
  dockAngleRad: number
}
export type Event = PositionSetEvent | DeletedEvent
export const onEvent: Reduce<State, Event> = (state, event) => {
  switch (event.type) {
    case EventType.deleted: {
      return {
        type: 'undefined',
        id: event.id,
      }
    }
    case EventType.positionsSet: {
      return {
        ...event,
        type: 'defined',
      }
    }
  }
  return state
}

/**
 * Fish Commands
 */

const emitDelete = (pond: Pond, id: string): PendingEmission =>
  pond.emit(stationTag.withId(id), { type: EventType.deleted, id })

const emitSetPosition = (
  pond: Pond,
  id: string,
  preDockPos: Vec,
  preDockAngleRad: number,
  dockPos: Vec,
  dockAngleRad: number,
): PendingEmission =>
  pond.emit(stationTag.withId(id), {
    type: EventType.positionsSet,
    id,
    preDockPos,
    preDockAngleRad,
    dockPos,
    dockAngleRad,
  })

const stationTag = Tag<Event>('station')

/*
 * Fish Definition
 */
export const StationFish = {
  tags: {
    stationTag,
  },
  of: (id: string): Fish<State, Event> => ({
    fishId: FishId.of('ax.station', id, 0),
    initialState: { type: 'undefined', id },
    where: stationTag.withId(id),
    onEvent,
  }),
  registry: (): Fish<Record<string, boolean>, Event> => ({
    fishId: FishId.of('ax.stationRegistry', 'registry', 0),
    initialState: {},
    where: stationTag,
    onEvent: (state, event) => {
      switch (event.type) {
        case EventType.positionsSet: {
          state[event.id] = true
          return state
        }
        case EventType.deleted: {
          delete state[event.id]
          return state
        }
      }
      return state
    },
  }),

  emitDelete,
  emitSetPosition,
}
