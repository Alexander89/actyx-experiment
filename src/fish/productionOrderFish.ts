import { Pond, Tag, Fish, FishId, PendingEmission, Reduce } from '@actyx/pond'
import { ProductMap } from './materialRequestFish'
import { v4 } from 'uuid'

/*
 * Fish State
 */
export type UndefinedState = {
  type: 'undefined'
  id: string
}
export type ActiveState = {
  type: 'active'
  id: string
  assignedWorkstation: ReadonlyArray<string>
  productName: string
  parts: ProductMap
}
export type DoneState = {
  type: 'done'
  id: string
  productName: string
}

export type State = UndefinedState | ActiveState | DoneState

/**
 * Fish Events
 */
export enum EventType {
  placed = 'placed',
  assigned = 'assigned',
  unassigned = 'unassigned',
  completed = 'completed',
}
export type PlacedEvent = {
  type: EventType.placed
  id: string
  productName: string
  parts: ProductMap
}
export type AssignedEvent = {
  type: EventType.assigned
  id: string
  workstation: string
}
export type UnassignedEvent = {
  type: EventType.unassigned
  id: string
  workstation: string
}
export type CompletedEvent = {
  type: EventType.completed
  id: string
}
type PostableEvents = AssignedEvent | UnassignedEvent
export type Event = PlacedEvent | PostableEvents | CompletedEvent

export const onEvent: Reduce<State, Event> = (state, event) => {
  switch (event.type) {
    case EventType.placed: {
      return {
        type: 'active',
        id: state.id,
        assignedWorkstation: [],
        parts: event.parts,
        productName: event.productName,
      }
    }
    case EventType.assigned: {
      if (state.type === 'active') {
        return {
          ...state,
          assignedWorkstation: [...state.assignedWorkstation, event.workstation],
        }
      }
      return state
    }
    case EventType.unassigned: {
      if (state.type === 'active') {
        return {
          ...state,
          assignedWorkstation: state.assignedWorkstation.filter((ws) => ws !== event.workstation),
        }
      }
      return state
    }
    case EventType.completed: {
      if (state.type === 'active') {
        return {
          type: 'done',
          id: state.id,
          productName: state.productName,
        }
      }
    }
  }
  return state
}

const emitPostableEvent = (pond: Pond, event: PostableEvents): PendingEmission =>
  pond.emit(productionOrderTag.withId(event.id), event)
const emitPlacedEvent = (pond: Pond, productName: string, parts: ProductMap): PendingEmission => {
  const id = v4()
  return pond.emit(productionOrderTag.withId(id).and(placedTag), {
    id,
    parts,
    productName,
    type: EventType.placed,
  })
}
const emitCompletedEvent = (pond: Pond, id: string): PendingEmission =>
  pond.emit(productionOrderTag.withId(id).and(completedTag), {
    type: EventType.completed,
    id,
  })
/*
 * Fish Definition
 */
const productionOrderTag = Tag<Event>('productionOrder')
const placedTag = Tag<PlacedEvent>('productionOrder.placed')
const completedTag = Tag<CompletedEvent>('productionOrder.completed')

export const ProductionOrderFish = {
  tags: {
    productionOrderTag,
  },
  of: (id: string): Fish<State, Event> => ({
    fishId: FishId.of('ax.productionOrder', id, 0),
    initialState: {
      type: 'undefined',
      id,
    },
    where: productionOrderTag.withId(id),
    onEvent,
  }),
  registry: (): Fish<Record<string, boolean>, Event> => ({
    fishId: FishId.of('ax.productionOrderRegistry', 'registry', 0),
    initialState: {},
    where: placedTag.or(completedTag),
    onEvent: (state, event) => {
      switch (event.type) {
        case EventType.placed: {
          state[event.id] = true
          return state
        }
        case EventType.completed: {
          delete state[event.id]
          return state
        }
      }
      return state
    },
  }),

  emitPostableEvent,
  emitPlacedEvent,
  emitCompletedEvent,
}
