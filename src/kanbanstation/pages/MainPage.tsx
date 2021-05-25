import { useFishFn, useRegistryFish } from '@actyx-contrib/react-pond'
import * as React from 'react'
import { isAgvState, SimpleAgvFish } from '../../fish/simpleAgvFish'
import { isStationState, SimpleStationFish } from '../../fish/simpleStationFish'
import { Button, Header } from '../../ui-common'
import { AppMode, mainStyling } from '../App'
import { CallAgv } from '../components/CallAgv'
import { ComingAgv } from '../components/ComingAgv'
import { PresentAgv } from '../components/PresentAgv'

type Props = {
  stationId: string
  onSetPage: (mode: AppMode) => void
}

export const MainPage = ({ stationId, onSetPage }: Props): JSX.Element => {
  const incomingAgv = useRegistryFish(
    SimpleStationFish.of(stationId),
    (state) => (isStationState.active(state) ? state.comingAgvId : []),
    SimpleAgvFish.of,
  )
    .map((s) => s.state)
    .filter(isAgvState.driving)

  const stationFish = useFishFn(SimpleStationFish.availableStations, 1)
  const availableStations = stationFish ? Object.keys(stationFish.state) : []

  const presentAgvs = useRegistryFish(
    SimpleStationFish.of(stationId),
    (state) => (isStationState.busy(state) ? [state.dockedAgv] : []),
    SimpleAgvFish.of,
  )
    .map((s) => s.state)
    .filter(isAgvState.docked)

  const { root, wrapper, card } = mainStyling
  return (
    <>
      <Header
        title={`AGV control ${stationId.toUpperCase()}`}
        content={
          <Button color="neutral" onClick={() => onSetPage('admin')}>
            ⚙️ Admin
          </Button>
        }
      />
      <div style={root}>
        <div style={wrapper}>
          <div style={{ flex: '0 0 650px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ ...card, flex: '1' }}>
              <CallAgv stationId={stationId} agvPresent={presentAgvs.length > 0} />
            </div>
          </div>
          <div style={{ flex: '1 0 600px', display: 'flex', flexDirection: 'column' }}>
            <div style={card}>
              <ComingAgv incomingAgv={incomingAgv} />
            </div>
            <div style={{ ...card, flex: '1' }}>
              <PresentAgv
                stationId={stationId}
                presentAgvs={presentAgvs}
                availableStations={availableStations}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
