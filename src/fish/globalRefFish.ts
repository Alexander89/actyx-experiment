import { Fish, FishId, PendingEmission, Pond, Reduce, Tag } from '@actyx/pond'
import { Vec } from '../math/vec2d'

/*
 * Fish State
 */
export type State = {
  origin: Vec
  ref: Vec
}

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
      return {
        ...state,
        origin: event.pos,
      }
    }
    case EventType.refUpdated: {
      return {
        ...state,
        ref: event.pos,
      }
    }
  }
  return state
}
const globalRefTag = Tag<Event>('globalRef')

const emitUpdateOrigin = (pond: Pond, pos: Vec): PendingEmission =>
  pond.emit(globalRefTag, {
    type: EventType.originUpdated,
    pos,
  })
const emitUpdateRef = (pond: Pond, pos: Vec): PendingEmission =>
  pond.emit(globalRefTag, {
    type: EventType.refUpdated,
    pos,
  })

/*
 * Fish Definition
 */
export const GlobalRefFish = {
  tags: {},
  global: (): Fish<State, Event> => ({
    fishId: FishId.of('ax.globalRef', 'global', 0),
    initialState: { origin: [0, 0], ref: [0, 0] },
    where: globalRefTag,
    onEvent,
  }),
  emitUpdateOrigin,
  emitUpdateRef,
}
