import { Typography } from '@actyx/industrial-ui'
import * as React from 'react'
import { AgvMetaData } from '../../fish/simpleAgvFish'
import { Button, Input } from '../../ui-common'
import { mainStyling } from '../App'

type Props = {
  agv: AgvMetaData
  onSave: (data: AgvMetaData) => void
  onClose: () => void
}
export const SettingsDialog = ({ agv, onSave, onClose }: Props): JSX.Element => {
  const [type, setType] = React.useState(agv.agvType)
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
            Settings for {agv.id}
          </Typography>
        </div>
        <div onClick={() => onClose()} style={closeButton}>
          x
        </div>
        <div>
          <div>
            <Input value={type} lable="Agv type" onChanged={setType} />
          </div>
        </div>
        <div>
          <div style={{ display: 'flex' }}>
            <Button onClick={onClose} color="red">
              cancel
            </Button>
            <div style={{ flex: '1' }}></div>
            <Button
              onClick={() =>
                onSave({
                  id: agv.id,
                  agvType: type,
                })
              }
              color="green"
            >
              save
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
