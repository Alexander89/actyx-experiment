import * as React from 'react'
import { Button } from '../../../ui-common'
import { UiMode } from './Map'

type Props = {
  onSetMode: (mode: UiMode) => void
}

export const ChangeModeControl = React.memo(
  ({ onSetMode }: Props) => {
    return (
      <div style={{ display: 'inline-flex' }}>
        <Button color="primary" onClick={() => onSetMode('zones')}>
          edit Zones
        </Button>
        <Button color="primary" style={{ marginLeft: 12 }} onClick={() => onSetMode('positions')}>
          edit Positions
        </Button>
        <Button color="primary" style={{ marginLeft: 12 }} onClick={() => onSetMode('globalRef')}>
          edit Global Ref
        </Button>
      </div>
    )
  },
  () => false,
)

// tslint:disable-next-line: no-object-mutation
ChangeModeControl.displayName = 'ChangeModeControl'
