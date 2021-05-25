import { usePond, useRegistryFish } from '@actyx-contrib/react-pond'
import { Table, TableBody, TableHeader, TableRow, Typography } from '@actyx/industrial-ui'
import * as React from 'react'
import { isAgvState, SimpleAgvFish } from '../../fish/simpleAgvFish'
import { SimpleStationFish } from '../../fish/simpleStationFish'
import { Button } from '../../ui-common'
import { BodyCell, HeaderCell } from './tableContent'

type Props = {
  stationId: string
  agvPresent: boolean
}

export const CallAgv = ({ stationId, agvPresent }: Props): JSX.Element => {
  const agvList = useRegistryFish(SimpleAgvFish.allIdleAgv(), Object.keys, SimpleAgvFish.of)
    .map((s) => s.state)
    .filter(isAgvState.idle)

  const pond = usePond()

  const callAgv = React.useCallback(
    (agvId: string, stationId: string) => () => {
      console.log(agvId)
      SimpleStationFish.emitAgvRequested(pond, stationId, agvId)
    },
    [pond],
  )

  const blockedByAgv = agvPresent || agvList.some((agv) => stationId === agv.dockedAt)

  //const { buttonBar } = styling
  return (
    <div>
      <div style={{ marginBottom: 15 }}>
        <Typography variant="distance" textTransform="uppercase" bold>
          Request an AGV
        </Typography>
      </div>
      <Table alternateColor>
        <TableHeader>
          <TableRow>
            <HeaderCell>Name</HeaderCell>
            <HeaderCell>Type</HeaderCell>
            <HeaderCell>Docked At</HeaderCell>
            <HeaderCell>Request</HeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agvList.map((agv) => (
            <TableRow key={agv.id}>
              <BodyCell>{agv.id}</BodyCell>
              <BodyCell>{agv.agvType}</BodyCell>
              <BodyCell>{agv.dockedAt || ''}</BodyCell>
              <BodyCell>
                {stationId === agv.dockedAt ? (
                  <Button color="green" onClick={callAgv(agv.id, stationId)}>
                    Use
                  </Button>
                ) : (
                  <Button
                    color="primary"
                    disabled={blockedByAgv}
                    onClick={callAgv(agv.id, stationId)}
                  >
                    Call
                  </Button>
                )}
              </BodyCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
