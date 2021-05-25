import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  Typography,
} from '@actyx/industrial-ui'
import * as React from 'react'
import { DrivingState } from '../../fish/simpleAgvFish'

type Props = {
  incomingAgv: DrivingState[]
}
export const ComingAgv = ({ incomingAgv }: Props): JSX.Element => {
  //const { buttonBar } = styling
  return (
    <div>
      <div style={{ marginBottom: 15 }}>
        <Typography variant="distance" textTransform="uppercase" bold>
          incoming AGVs
        </Typography>
      </div>
      <Table alternateColor>
        <TableHeader>
          <TableRow>
            <HeaderCell>Name</HeaderCell>
            <HeaderCell>Type</HeaderCell>
            <HeaderCell>From</HeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {incomingAgv.map((agv) => (
            <TableRow key={agv.id}>
              <BodyCell>{agv.id}</BodyCell>
              <BodyCell>{agv.agvType}</BodyCell>
              <BodyCell>{agv.from}</BodyCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

/*
type CSS = Record<string, React.CSSProperties>
const styling: CSS = {
  root: {
    margin: 10,
    display: 'flex',
  },
  wrapper: {
    flex: '1',
    display: 'flex',
    justifyContent: 'center',
  },
  buttonBar: {
    display: 'flex',
    marginTop: 12,
    textAlign: 'right',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#F7FAFC',
    padding: '12px 24px',
    margin: '12px 24px',
    borderRadius: 12,
  },
  innerCard: {
    backgroundColor: '#e5e8ea',
    padding: '12px 24px',
    margin: '12px 24px',
    borderRadius: 12,
  },
}
*/
type HeaderCellProps = {
  children: string
}
const HeaderCell = ({ children }: HeaderCellProps) => (
  <TableCell>
    <Typography variant="standard" textTransform="uppercase">
      {children}
    </Typography>
  </TableCell>
)
type BodyCellProps = {
  children: string | React.ReactNode
}
const BodyCell = ({ children }: BodyCellProps) => (
  <TableCell>
    <Typography variant="standard" textTransform="uppercase">
      {children}
    </Typography>
  </TableCell>
)
