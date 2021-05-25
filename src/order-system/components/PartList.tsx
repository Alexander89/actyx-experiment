import * as React from 'react'
import './orderList.css'
import { Typography } from '@actyx/industrial-ui'

export type Parts = {
  id: string
  name: string
  amount: number
}
type Props = {
  parts: ReadonlyArray<Parts>
  style?: React.CSSProperties
}

export const PartList = ({ parts, style }: Props): JSX.Element => {
  return (
    <div
      style={{
        padding: '12px 24px',
        borderRadius: 12,
        backgroundColor: '#F3F4FE',
        ...style,
      }}
    >
      {(parts.length === 0 && (
        <Typography variant="standard">Please add the required parts</Typography>
      )) || (
        <div style={{ display: 'flex', marginBottom: 12 }}>
          <div style={{ flex: '1' }}>
            <Typography variant="subtext" textTransform="uppercase">
              Id
            </Typography>
          </div>
          <div style={{ flex: '2' }}>
            <Typography variant="subtext" textTransform="uppercase">
              Name
            </Typography>
          </div>
          <div style={{ flex: '1' }}>
            <Typography variant="subtext" textTransform="uppercase">
              Amount
            </Typography>
          </div>
        </div>
      )}
      {parts.map((p) => (
        <div key={p.id} style={{ display: 'flex', marginBottom: 6 }}>
          <div style={{ flex: '1' }}>
            <Typography variant="standard">{p.id}</Typography>
          </div>
          <div style={{ flex: '3' }}>
            <Typography variant="standard" semiBold>
              {p.name}
            </Typography>
          </div>
          <div style={{ flex: '1', textAlign: 'right' }}>
            <Typography variant="standard">{p.amount} pc</Typography>
          </div>
        </div>
      ))}
    </div>
  )
}
