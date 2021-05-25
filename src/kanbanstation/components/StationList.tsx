import { Table, TableBody, TableHeader, TableRow, Typography } from '@actyx/industrial-ui'
import * as React from 'react'
import { isStationState, State as SimpleStationState } from '../../fish/simpleStationFish'
import { Button } from '../../ui-common'
import { BodyCell, HeaderCell } from './tableContent'

type Props = {
  availableStations: SimpleStationState[]
  onDelete: (station: string) => void
}
export const StationList = ({ availableStations, onDelete }: Props): JSX.Element => {
  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <Typography variant="distance" textTransform="uppercase" bold>
          All stations
        </Typography>
      </div>
      <Table alternateColor>
        <TableHeader>
          <TableRow>
            <HeaderCell>Name</HeaderCell>
            <HeaderCell>State</HeaderCell>
            <HeaderCell>Docked Agv</HeaderCell>
            <HeaderCell>Action</HeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {availableStations.map((station) => (
            <TableRow key={station.id}>
              <BodyCell>{station.id}</BodyCell>
              <BodyCell>{station.type}</BodyCell>
              <BodyCell>{isStationState.busy(station) ? station.dockedAgv : ''}</BodyCell>
              <BodyCell>
                <Button color="red" onClick={() => onDelete(station.id)}>
                  🗑️
                </Button>
              </BodyCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}
