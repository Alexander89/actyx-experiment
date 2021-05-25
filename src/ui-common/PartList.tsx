import { ProductMap } from '../fish/materialRequestFish'
import * as React from 'react'
import { Typography } from '@actyx/industrial-ui'

type PartListProps = {
  parts: ProductMap
  height?: number
}

export const PartList = ({ parts, height }: PartListProps): JSX.Element => (
  <div style={{ height: height || 380, overflowY: 'auto' }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'auto auto' }}>
      <div>
        <Typography variant="standard" textTransform="uppercase">
          Part name
        </Typography>
      </div>
      <div>
        <Typography variant="standard" textTransform="uppercase">
          Amount
        </Typography>
      </div>
      {...Object.values(parts).map(({ productName, amount }) => (
        <React.Fragment key={productName}>
          <div>
            <Typography variant="distance">{productName}</Typography>
          </div>
          <div>
            <Typography variant="distance">{amount}</Typography>
          </div>
        </React.Fragment>
      ))}
    </div>
  </div>
)
