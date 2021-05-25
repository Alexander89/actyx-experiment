import { Fish, FishId, PendingEmission, Pond, Reduce, Tag } from '@actyx/pond'

/*
 * Fish State
 */
export type ProductMap = {
  [productId: string]: {
    amount: number
    productName: string
  }
}
export type CurrentStep =
  | 'idle' // wait for AGV to do this mr
  | 'assigned' // AGV will drive to the pickup station
  | 'waitForLoadComplete' // Commissioning worker need to release AGV with click
  | 'onDrive' // AGV should drive to the destination station
  | 'waitForAck' // AGV wait for unload on destination
  | 'backToCommissioning' // AGV unload is rejected and the AGV should drive back to the pickup station
  | 'waitForUnloadAtCommissioning' // Commissioning worker need to release AGV with click

export type UndefinedState = {
  type: 'undefined'
  id: string
}
export type ActiveState = {
  type: 'active'
  id: string
  currentStep: CurrentStep
  pickUpCommissioningDest: string
  destination: string
  payload: ProductMap
  orderId: string
  assignedAgvList: ReadonlyArray<string>
}
export type DoneState = {
  type: 'done'
  id: string
  payload: {
    [productId: string]: {
      amount: number
      productName: string
    }
  }
  orderId: string
  assignedAgvList: ReadonlyArray<string>
}
export type State = UndefinedState | ActiveState | DoneState

/**
 * Fish Events
 */

export enum EventType {
  arrivedBackOnCommissioning = 'arrivedBackOnCommissioning',
  canceled = 'canceled',
  placed = 'placed',
  assigned = 'assigned',
  unassigned = 'unassigned',
  agvArrivedOnCommissioning = 'agvArrivedOnCommissioning',
  loaded = 'loaded',
  arrivedOnDestination = 'arrivedOnDestination',
  unloadDone = 'unloadDone',
  rejected = 'rejected',
}
export type ArrivedBackOnCommissioningEvent = {
  type: EventType.arrivedBackOnCommissioning
  id: string
  commissioning: string
}
export type CanceledEvent = {
  type: EventType.canceled
  id: string
}
export type PlacedEvent = {
  type: EventType.placed
  id: string
  products: ProductMap
  destination: string
  orderId: string
  pickUpCommissioningDest: string
}
export type AssignedEvent = {
  type: EventType.assigned
  id: string
  agvId: string
}
export type UnassignedEvent = {
  type: EventType.unassigned
  id: string
  agvId: string
}
export type AgvArrivedOnCommissioningEvent = {
  type: EventType.agvArrivedOnCommissioning
  id: string
  pickUpCommissioningDest: string
}
export type LoadedEvent = {
  type: EventType.loaded
  id: string
}
export type ArrivedOnDestinationEvent = {
  type: EventType.arrivedOnDestination
  id: string
  destination: string
}
export type UnloadDoneEvent = {
  type: EventType.unloadDone
  id: string
}
export type RejectedEvent = {
  type: EventType.rejected
  id: string
  reason: string
}
type PostableEvent =
  | ArrivedBackOnCommissioningEvent
  | AssignedEvent
  | UnassignedEvent
  | AgvArrivedOnCommissioningEvent
  | LoadedEvent
  | ArrivedOnDestinationEvent
  | RejectedEvent

export type Event = PostableEvent | PlacedEvent | CanceledEvent | UnloadDoneEvent

export const onEvent: Reduce<State, Event> = (state, event) => {
  switch (event.type) {
    case EventType.canceled: {
      if (state.type === 'active') {
        if (state.currentStep === 'idle' || state.currentStep === 'assigned') {
          return {
            type: 'done',
            assignedAgvList: state.assignedAgvList,
            orderId: state.orderId,
            payload: state.payload,
            id: state.id,
          }
        }
        if (
          state.currentStep === 'waitForLoadComplete' ||
          state.currentStep === 'onDrive' ||
          state.currentStep === 'waitForAck'
        ) {
          return {
            ...state,
            currentStep: 'backToCommissioning',
          }
        }
      }
      return state
    }
    case EventType.placed: {
      return {
        type: 'active',
        currentStep: 'idle',
        pickUpCommissioningDest: event.pickUpCommissioningDest,
        destination: event.destination,
        payload: event.products,
        assignedAgvList: [],
        orderId: event.orderId || 'Order1',
        id: state.id,
      }
    }
    case EventType.assigned: {
      if (state.type === 'active') {
        return {
          ...state,
          assignedAgvList: state.assignedAgvList.includes(event.agvId)
            ? state.assignedAgvList
            : [...state.assignedAgvList, event.agvId],
          currentStep: 'assigned',
        }
      }
      return state
    }
    case EventType.unassigned: {
      if (state.type === 'undefined') {
        return state
      }

      const assignedAgvList = state.assignedAgvList.filter((agv) => agv !== event.agvId)
      if (state.type === 'active') {
        return {
          ...state,
          assignedAgvList,
          currentStep: assignedAgvList.length === 0 ? 'idle' : state.currentStep,
        }
      }
      if (state.type === 'done') {
        return { ...state, assignedAgvList }
      }
      return state
    }
    case EventType.agvArrivedOnCommissioning: {
      if (state.type === 'active') {
        return {
          ...state,
          currentStep: 'waitForLoadComplete',
        }
      }
      return state
    }
    case EventType.arrivedBackOnCommissioning: {
      if (state.type === 'active') {
        return {
          ...state,
          currentStep: 'waitForUnloadAtCommissioning',
        }
      }
      return state
    }
    case EventType.loaded: {
      if (state.type === 'active') {
        return {
          ...state,
          currentStep: 'onDrive',
        }
      }
      return state
    }
    case EventType.arrivedOnDestination: {
      if (state.type === 'active') {
        return {
          ...state,
          currentStep: 'waitForAck',
        }
      }
      return state
    }
    case EventType.unloadDone: {
      if (state.type === 'active') {
        return {
          type: 'done',
          assignedAgvList: [],
          orderId: state.orderId,
          payload: state.payload,
          id: state.id,
        }
      }
      return state
    }
    case EventType.rejected: {
      if (state.type === 'active') {
        return {
          ...state,
          currentStep: 'backToCommissioning',
        }
      }
      return state
    }
  }
  return state
}

const emitPlaced = (pond: Pond, event: PlacedEvent): PendingEmission =>
  pond.emit(materialRequestTag.withId(event.id).and(placedTag), event)
const emitCanceled = (pond: Pond, id: string): PendingEmission =>
  pond.emit(materialRequestTag.withId(id).and(canceledTag), {
    type: EventType.canceled,
    id,
  })
const emitUnloadDone = (pond: Pond, id: string): PendingEmission =>
  pond.emit(materialRequestTag.withId(id).and(unloadedTag), {
    type: EventType.unloadDone,
    id,
  })
const emitPostableEvent = (pond: Pond, event: PostableEvent): PendingEmission =>
  pond.emit(materialRequestTag.withId(event.id), event)

// create --> assign --> arrivedOnCommissioning --> loadDone --> arrivedOnDestination --> unloadDone (Done)
//           unAssign                                                                 --> rejected (bringBackToCommissioning) --> arrivedOnDestination --> unloadDone (Done)

/*
 * Fish Definition
 */

const materialRequestTag = Tag<Event>('materialRequest')
const placedTag = Tag<PlacedEvent>('placed')
const canceledTag = Tag<CanceledEvent>('canceled')
const unloadedTag = Tag<UnloadDoneEvent>('unloaded')

export const MaterialRequestFish = {
  tags: {
    materialRequestTag,
  },
  of: (id: string): Fish<State, Event> => ({
    fishId: FishId.of('ax.materialRequest', id, 0),
    initialState: {
      type: 'undefined',
      id,
    },
    where: materialRequestTag.withId(id),
    onEvent,
  }),
  registry: (): Fish<Record<string, boolean>, Event> => ({
    fishId: FishId.of('ax.materialRequest.registry', 'registry', 0),
    initialState: {},
    where: placedTag.or(canceledTag).or(unloadedTag),
    onEvent: (state, event) => {
      switch (event.type) {
        case EventType.placed:
          state[event.id] = true
          return state
        case EventType.canceled:
          delete state[event.id]
          return state
        case EventType.unloadDone:
          delete state[event.id]
          return state
      }
      return state
    },
  }),
  emitPlaced,
  emitCanceled,
  emitUnloadDone,
  emitPostableEvent,
}
