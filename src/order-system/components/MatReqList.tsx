import * as React from 'react'
import './orderList.css'
import { Typography } from '@actyx/industrial-ui'
import { fromCamelCase } from '../../util'

export type MatReqListEntry = {
  id: string
  agv: string
  state: string
}
type Props = {
  matReq: ReadonlyArray<MatReqListEntry>
  style?: React.CSSProperties
}

export const MatReqList = ({ matReq, style }: Props): JSX.Element => {
  return (
    <div
      style={{
        padding: '12px 24px',
        borderRadius: 12,
        backgroundColor: '#F3F4FE',
        ...style,
      }}
    >
      {(matReq.length === 0 && (
        <Typography variant="standard">No material requested</Typography>
      )) || (
        <div style={{ display: 'flex', marginBottom: 12 }}>
          <div style={{ flex: '2' }}>
            <Typography variant="subtext" textTransform="uppercase">
              Id
            </Typography>
          </div>
          <div style={{ flex: '2' }}>
            <Typography variant="subtext" textTransform="uppercase">
              Agv
            </Typography>
          </div>
          <div style={{ flex: '1' }}>
            <Typography variant="subtext" textTransform="uppercase">
              State
            </Typography>
          </div>
        </div>
      )}
      {matReq.map((p) => (
        <div key={p.id} style={{ display: 'flex', marginBottom: 6 }}>
          <div style={{ flex: '2' }}>
            <Typography variant="standard">{p.id.substr(0, 6)}</Typography>
          </div>
          <div style={{ flex: '1' }}>
            <Typography variant="standard" semiBold>
              {p.agv}
            </Typography>
          </div>
          <div style={{ flex: '2', textAlign: 'right' }}>
            <Typography variant="standard">{fromCamelCase(p.state)}</Typography>
          </div>
        </div>
      ))}
    </div>
  )
}
