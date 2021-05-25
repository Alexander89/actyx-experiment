import { AgvState, StationState } from '../fish'
import { ActiveState, AgvDriveOrder, OfflineState } from '../fish/agvFish'
import { DefinedState as StationDefinedState } from '../fish/stationFish'
import { deepEq } from './util'

export type DefinedAgvState = ActiveState | OfflineState
export type ActiveStateWithDriveOrder = DefinedAgvState & { driveOrder: AgvDriveOrder }
export type AgvPipelineState = { state: DefinedAgvState; lastAgvState: AgvState }
export type AgvPipelineStateWithDriveOrder = {
  state: ActiveStateWithDriveOrder
  lastAgvState: AgvState
}
export type AgvPipelineStateAndStation = [ActiveStateWithDriveOrder, StationState]
export type AgvPipelineStateAndDefinedStation = [ActiveStateWithDriveOrder, StationDefinedState]

export const isDefineAgvState = (s: AgvState): s is DefinedAgvState => s.type !== 'undefined'
/// check if the new Agv state
export const isAgvActiveStateWithDriveOrder = (
  pipeLineState: AgvPipelineState,
): pipeLineState is AgvPipelineStateWithDriveOrder =>
  (pipeLineState.state.type === 'moving' || pipeLineState.state.type === 'stopped') &&
  pipeLineState.state.driveOrder !== undefined

export const isSendOfDriveOrderRequired = ({
  state,
  lastAgvState,
}: AgvPipelineStateWithDriveOrder): boolean =>
  state.type === 'stopped' ||
  (lastAgvState.type !== 'undefined' && !deepEq(state.driveOrder, lastAgvState.driveOrder))

export const isStationValid = (
  state: AgvPipelineStateAndStation,
): state is AgvPipelineStateAndDefinedStation => state[1].type === 'defined'
