import { AgvState, ElectionState, MaterialRequestState, StationState } from '../fish'
import { ActiveState as AgvActiveState, OfflineState } from '../fish/agvFish'
import { ActiveState as MrActiveState } from '../fish/materialRequestFish'
import { sub, vLength } from '../math/vec2d'
import { CurrentPosition } from './agvDriver'

export const calcDist = (station: StationState, currentPos: CurrentPosition): number => {
  if (station.type === 'undefined') {
    return Infinity
  }
  return vLength(sub(station.preDockPos, currentPos.position))
}
export const isMrActiveState = (st: MaterialRequestState | undefined): st is MrActiveState =>
  st !== undefined && st.type === 'active'

export type DefinedAgvState = AgvActiveState | OfflineState
export type AgvActiveStateWithMR = AgvActiveState & { materialRequest: string }
export const isDefineAgvState = (s: AgvState): s is DefinedAgvState => s.type !== 'undefined'
export const isActiveAgvState = (s: AgvState): s is AgvActiveState =>
  s.type === 'moving' || s.type === 'stopped'
export const isActiveAgvStateWithMr = (s: AgvState): s is AgvActiveStateWithMR =>
  isActiveAgvState(s) && s.materialRequest !== undefined

export const toMrAgvData = (currentPos: CurrentPosition) => ([
  materialRequest,
  election,
  pickup,
  destination,
]: ToMrAgvDataInput): MrAgvData => ({
  materialRequest,
  election,
  pickup,
  pickupDist: calcDist(pickup, currentPos),
  destination,
  destinationDist: calcDist(destination, currentPos),
})

export type MrAgvData = {
  materialRequest: MrActiveState
  election: ElectionState
  pickup: StationState
  pickupDist: number
  destination: StationState
  destinationDist: number
}

type ToMrAgvDataInput = [MrActiveState, ElectionState, StationState, StationState]
