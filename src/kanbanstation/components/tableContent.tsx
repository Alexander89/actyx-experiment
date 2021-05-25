import { TableCell, Typography } from '@actyx/industrial-ui'
import * as React from 'react'

type HeaderCellProps = {
  children: string
}
export const HeaderCell = ({ children }: HeaderCellProps): JSX.Element => (
  <TableCell>
    <Typography variant="standard" textTransform="uppercase">
      {children}
    </Typography>
  </TableCell>
)
type BodyCellProps = {
  children: string | React.ReactNode
}
export const BodyCell = ({ children }: BodyCellProps): JSX.Element => (
  <TableCell>
    <Typography variant="standard" textTransform="uppercase">
      {children}
    </Typography>
  </TableCell>
)
