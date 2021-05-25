import { Typography } from '@actyx/industrial-ui'
import * as React from 'react'
import { Button } from '../../ui-common'
import { mainStyling } from '../App'

type Props = {
  availableStations: string[]
  onSendTo: (station: string) => void
  onClose: () => void
}
export const SendToDialog = ({ availableStations, onSendTo, onClose }: Props): JSX.Element => {
  const { card, closeButton } = mainStyling
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        backgroundColor: '#00000080',
      }}
    >
      <div style={{ ...card, margin: '108px auto', width: 400, position: 'relative' }}>
        <div style={{ marginBottom: 24 }}>
          <Typography variant="distance" textTransform="uppercase" bold>
            Send Agv to:
          </Typography>
        </div>
        <div onClick={() => onClose()} style={closeButton}>
          x
        </div>
        <div>
          {availableStations.map((stationId) => (
            <div key={stationId} style={{ margin: '12px 12px' }}>
              <Button color="primary" onClick={() => onSendTo(stationId)}>
                {stationId}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
