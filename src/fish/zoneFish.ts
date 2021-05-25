import { Fish, FishId, PendingEmission, Pond, Reduce, Tag } from '@actyx/pond'
import { Vec } from '../math/vec2d'
import { Edge } from '../math/vectorUtil'
import { isZoneValid } from '../math/zones'

/*
 * Fish State
 */

export type ZonePropertyMaxDevices = {
  type: 'maxDevices'
  maxDevices: number
}
export type ZonePropertyNoStop = {
  type: 'noStop'
}
export type ZonePropertyMaxSpeed = {
  type: 'maxSpeed'
  speed: number
}
export type ZoneProperty = ZonePropertyMaxDevices | ZonePropertyNoStop | ZonePropertyMaxSpeed

export type ZoneProperties = ReadonlyArray<ZoneProperty>

export type Area = {
  vertices: ReadonlyArray<Vec>
  edges: ReadonlyArray<Edge>
}
export type Portal = {
  direction: Vec
} & Area

export type Zone = {
  id: string
  portalSize: number
  portals: ReadonlyArray<Portal>
  properties: ZoneProperties
} & Area
export type Zones = ReadonlyArray<Zone>

export type UndefinedState = {
  type: 'undefined'
  id: string
}
export type DefinedState = {
  type: 'active' | 'inactive' | 'invalid' | 'deleted'
} & Zone

export type State = UndefinedState | DefinedState

/**
 * Fish Events
 */

export enum EventType {
  deleted = 'deleted',
  dataSet = 'dataSet',
  propertiesUpdated = 'propertiesUpdated',
  activated = 'activated',
  deactivate = 'deactivate',
}
export type DeletedEvent = {
  type: EventType.deleted
  id: string
}
export type DataSetEvent = {
  type: EventType.dataSet
  id: string
} & Zone
export type PropertiesUpdatedEvent = {
  type: EventType.propertiesUpdated
  id: string
  properties: ZoneProperties
}
export type ActivatedEvent = {
  type: EventType.activated
  id: string
}
export type DeactivateEvent = {
  type: EventType.deactivate
  id: string
}
export type Event =
  | DataSetEvent
  | PropertiesUpdatedEvent
  | ActivatedEvent
  | DeactivateEvent
  | DeletedEvent

export const onEvent: Reduce<State, Event> = (state, event) => {
  switch (event.type) {
    case EventType.dataSet: {
      const isInvalid = !isZoneValid(event.edges)
      const prefStateType = isInvalid
        ? 'invalid'
        : state.type === 'undefined' || state.type === 'invalid' || state.type === 'deleted'
        ? 'inactive'
        : state.type

      const { edges, vertices, id, portalSize, portals, properties } = event
      return {
        type: prefStateType,
        edges,
        vertices,
        id,
        portalSize,
        portals,
        properties,
      }
    }
    case EventType.propertiesUpdated: {
      if (state.type !== 'undefined') {
        return {
          ...state,
          properties: event.properties,
        }
      }
      return state
    }
    case EventType.activated: {
      if (state.type === 'inactive') {
        return {
          ...state,
          type: 'active',
        }
      }
      return state
    }
    case EventType.deactivate: {
      if (state.type === 'active') {
        return {
          ...state,
          type: 'inactive',
        }
      }
      return state
    }
    case EventType.deleted: {
      if (state.type !== 'undefined') {
        return {
          ...state,
          type: 'deleted',
        }
      }
      return state
    }
  }
  return state
}

const emitSetData = (pond: Pond, zone: Zone): PendingEmission =>
  pond.emit(zoneTag.withId(zone.id).and(newTag), {
    type: EventType.dataSet,
    ...zone,
  })
const emitUpdateProperties = (
  pond: Pond,
  id: string,
  properties: ZoneProperties,
): PendingEmission =>
  pond.emit(zoneTag.withId(id), {
    type: EventType.propertiesUpdated,
    id,
    properties,
  })
const emitActivate = (pond: Pond, id: string): PendingEmission =>
  pond.emit(zoneTag.withId(id), {
    type: EventType.activated,
    id,
  })
const emitDeactivate = (pond: Pond, id: string): PendingEmission =>
  pond.emit(zoneTag.withId(id), {
    type: EventType.deactivate,
    id,
  })
const emitDelete = (pond: Pond, id: string): PendingEmission =>
  pond.emit(zoneTag.withId(id).and(deleteTag), {
    type: EventType.deleted,
    id,
  })

const zoneTag = Tag<Event>('zone')
const newTag = Tag<DataSetEvent>('zone.new')
const deleteTag = Tag<DeletedEvent>('zone.delete')

export const ZoneFish = {
  tags: {
    zoneTag,
    newTag,
    deleteTag,
  },
  of: (id: string): Fish<State, Event> => ({
    fishId: FishId.of('ax.zone', id, 0),
    initialState: { type: 'undefined', id },
    where: zoneTag.withId(id),
    onEvent,
  }),
  registry: (): Fish<Record<string, boolean>, Event> => ({
    fishId: FishId.of('ax.zone.registry', 'registry', 0),
    initialState: {},
    where: newTag.or(deleteTag),
    onEvent: (state, event) => {
      switch (event.type) {
        case EventType.dataSet: {
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
  emitSetData,
  emitUpdateProperties,
  emitActivate,
  emitDeactivate,
  emitDelete,
}
