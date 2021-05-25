import { Fish, FishId, PendingEmission, Pond, Reduce, Tag } from '@actyx/pond'
import { Vec } from '../math/vec2d'

/*
 * Fish State
 */
export type State = {
  origin: [number, number]
  ref: [number, number]
}

/**
 * Fish Events
 */
export enum EventType {
  originUpdated = 'originUpdated',
  refUpdated = 'refUpdated',
}
export type OriginUpdatedEvent = {
  type: EventType.originUpdated
  pos: [number, number]
}
export type RefUpdatedEvent = {
  type: EventType.refUpdated
  pos: [number, number]
}
export type Event = OriginUpdatedEvent | RefUpdatedEvent

export const onEvent: Reduce<State, Event> = (state, event) => {
  switch (event.type) {
    case EventType.originUpdated: {
      // avoid ref and origin at one point
      if (state.ref[0] === event.pos[0] && state.ref[1] === event.pos[1]) {
        return state
      }
      return {
        ...state,
        origin: event.pos,
      }
    }
    case EventType.refUpdated: {
      // avoid ref and origin at one point
      if (state.origin[0] === event.pos[0] && state.origin[1] === event.pos[1]) {
        return state
      }
      return {
        ...state,
        ref: event.pos,
      }
    }
  }
  return state
}

const adminUiTag = Tag<Event>('agv.adminUi')

const emitUpdateOrigin = (pond: Pond, pos: Vec): PendingEmission =>
  pond.emit(adminUiTag, {
    type: EventType.originUpdated,
    pos: pos,
  })
const emitUpdateRef = (pond: Pond, pos: Vec): PendingEmission =>
  pond.emit(adminUiTag, {
    type: EventType.refUpdated,
    pos: pos,
  })

/*
 * Fish Definition
 */
export const AdminUiFish = {
  tags: {
    adminUiTag,
  },
  general: (): Fish<State, Event> => ({
    fishId: FishId.of('agv.admin.ui', 'general', 0),
    initialState: {
      origin: [0, 0],
      ref: [0, 1],
    },
    where: adminUiTag,
    onEvent,
  }),
  emitUpdateOrigin,
  emitUpdateRef,
}
