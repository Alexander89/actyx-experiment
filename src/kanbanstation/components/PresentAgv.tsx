import { usePond } from '@actyx-contrib/react-pond'
import { Typography } from '@actyx/industrial-ui'
import * as React from 'react'
import { DockedState } from '../../fish/simpleAgvFish'
import { SimpleStationFish } from '../../fish/simpleStationFish'
import { Button } from '../../ui-common'
import { SendToDialog } from './SendToDialog'

type Props = {
  stationId: string
  presentAgvs: DockedState[]
  availableStations: string[]
}
export const PresentAgv = ({ stationId, presentAgvs, availableStations }: Props): JSX.Element => {
  const [showSendToDialog, setShowSendToDialog] = React.useState(false)

  const pond = usePond()

  //const { buttonBar } = styling
  if (presentAgvs.length === 0) {
    return (
      <div style={{ textAlign: 'center', marginTop: 48, marginBottom: 96 }}>
        <Typography variant="distance" textTransform="uppercase" bold>
          No agv active
        </Typography>
      </div>
    )
  }

  const [presentAgv] = presentAgvs
  const dismissAgv = () => {
    SimpleStationFish.emitAgvReleased(pond, stationId, presentAgv.id)
  }
  const sendTo = (sendToStation: string) => {
    setShowSendToDialog(false)
    SimpleStationFish.emitAgvSent(pond, stationId, sendToStation, presentAgv.id)
  }
  return (
    <>
      {showSendToDialog && (
        <SendToDialog
          availableStations={availableStations}
          onSendTo={sendTo}
          onClose={() => setShowSendToDialog(false)}
        />
      )}
      <div style={{ marginBottom: 15, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ textAlign: 'center', marginTop: 48, marginBottom: 96 }}>
          <Typography variant="distance" textTransform="uppercase" bold>
            Docked AGVs: {presentAgv.id}
          </Typography>
        </div>
        <div style={{ flex: '1' }}></div>
        <div style={{ display: 'flex', paddingBottom: 36 }}>
          <div style={{ flex: '2' }}>
            <Typography variant="distance" textTransform="uppercase" bold>
              <Button color="primary" onClick={() => setShowSendToDialog(true)}>
                Send To ...
              </Button>
            </Typography>
          </div>
          <div style={{ flex: '1' }}></div>
          <div style={{ flex: '2' }}>
            <Typography variant="distance" textTransform="uppercase" bold>
              <Button color="neutral" onClick={dismissAgv}>
                Dismiss
              </Button>
            </Typography>
          </div>
        </div>
      </div>
    </>
  )
}

/*
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
 */
