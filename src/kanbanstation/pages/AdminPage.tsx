import { usePond, useRegistryFish } from '@actyx-contrib/react-pond'
import * as React from 'react'
import { SimpleStationFish } from '../../fish/simpleStationFish'
import { Button, Header } from '../../ui-common'
import { AppMode, mainStyling } from '../App'
import { StationList } from '../components/StationList'
import { AgvList } from '../components/AgvList'
import { AgvMetaData, SimpleAgvFish } from '../../fish/simpleAgvFish'

type Props = {
  stationId: string
  onSetPage: (mode: AppMode) => void
}

export const AdminPage = ({ stationId, onSetPage }: Props): JSX.Element => {
  // const stationFish = useFishFn(SimpleStationFish.availableStations, 1)
  // const availableStations = stationFish ? Object.keys(stationFish.state) : []

  const allStations = useRegistryFish(
    SimpleStationFish.availableStations(),
    Object.keys,
    SimpleStationFish.of,
  ).map((s) => s.state)

  const allAgvs = useRegistryFish(
    SimpleAgvFish.allExistingAgv(),
    Object.keys,
    SimpleAgvFish.of,
  ).map((s) => s.state)
  console.log(allAgvs)

  const pond = usePond()
  const deleteStation = (station: string) => {
    console.log('delete ' + station)
    SimpleStationFish.emitStationRemoved(pond, station)
  }

  const onDisable = (agvId: string) => {
    SimpleAgvFish.emitDisabled(pond, agvId)
  }
  const onEnable = (agvId: string) => {
    SimpleAgvFish.emitEnabled(pond, agvId)
  }
  const onSetConfig = (agvId: string, config: AgvMetaData) => {
    SimpleAgvFish.emitConfiguration(pond, agvId, config.agvType)
  }

  const { root, wrapper, card } = mainStyling
  return (
    <>
      <Header
        title={`Agv management ${stationId.toUpperCase()}`}
        content={
          <Button color="neutral" onClick={() => onSetPage('main')}>
            🚆 Main
          </Button>
        }
      />
      <div style={root}>
        <div style={wrapper}>
          <div style={{ flex: '0 0 650px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ ...card, flex: '1' }}>
              <StationList availableStations={allStations} onDelete={deleteStation} />
            </div>
          </div>
          <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
            <div style={{ ...card, flex: '1' }}>
              <AgvList
                availableAgvs={allAgvs}
                onDisable={onDisable}
                onEnable={onEnable}
                onSetConfig={onSetConfig}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
