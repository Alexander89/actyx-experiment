import { MaterialRequestEventType, MaterialRequestFish, MaterialRequestState } from '../fish'
import * as React from 'react'
import { Typography } from '@actyx/industrial-ui'
import { PartList, Header, Button } from '../ui-common'
import { usePond, useRegistryFish } from '@actyx-contrib/react-pond'
import { ActiveState } from '../fish/materialRequestFish'
import { getSettings } from '../util'
import '../ui-common/assets/font/font.css'

// required for React Router on tablets
type ContentProps = { presentMatReq: ActiveState }

const settings = getSettings({ storageName: 'Storage 1' })
const commissioningDest = settings.storageName

export const App = (): JSX.Element => {
  const allOpenMatReq = useRegistryFish(
    MaterialRequestFish.registry(),
    Object.keys,
    MaterialRequestFish.of,
  )
    .map((s) => s.state)
    .filter(
      (matReqState): matReqState is ActiveState =>
        matReqState.type === 'active' &&
        matReqState.pickUpCommissioningDest === commissioningDest &&
        (matReqState.currentStep === 'waitForLoadComplete' ||
          matReqState.currentStep === 'waitForUnloadAtCommissioning'),
    )
  const lastMatReq =
    allOpenMatReq.length === 0 ? undefined : allOpenMatReq[allOpenMatReq.length - 1]

  const pond = usePond()
  const acknowledgeLoad = (st: MaterialRequestState) => () =>
    MaterialRequestFish.emitPostableEvent(pond, {
      type: MaterialRequestEventType.loaded,
      id: st.id,
    })

  const acknowledgeUnload = (st: MaterialRequestState) => () =>
    MaterialRequestFish.emitUnloadDone(pond, st.id)

  const Content = ({ presentMatReq }: ContentProps): JSX.Element => {
    if (presentMatReq.currentStep === 'waitForLoadComplete') {
      return (
        <div>
          <div style={styles.cardHeader}>
            <Typography variant="distance">Present AGV</Typography>
            <div style={{ flex: '1' }} />
            <Typography variant="standard" color="#00d000">
              Please Load {presentMatReq.assignedAgvList.join(',')}
            </Typography>
          </div>
          <hr />
          <div style={{ marginTop: 10 }}>
            <PartList parts={presentMatReq.payload} />
          </div>
          <hr />
          <div style={{ display: 'flex', flexDirection: 'row-reverse', marginTop: 10 }}>
            <Button
              color="green"
              style={{ flex: '0 0 200px' }}
              onClick={acknowledgeLoad(presentMatReq)}
            >
              Load complete
            </Button>
          </div>
        </div>
      )
    } else if (presentMatReq.currentStep === 'waitForUnloadAtCommissioning') {
      return (
        <div>
          <div style={styles.cardHeader}>
            <Typography variant="standard" textTransform="uppercase">
              Present AGV
            </Typography>
            <div style={{ flex: '1' }} />
            <Typography variant="standard" color="#ff0000">
              Please Unload {presentMatReq.assignedAgvList.join(',')}
            </Typography>
          </div>
          <hr />
          <div style={{ marginTop: 10 }}>
            <PartList parts={presentMatReq.payload} />
          </div>
          <hr />
          <div style={{ display: 'flex', flexDirection: 'row', marginTop: 10 }}>
            <Button
              color="red"
              style={{ flex: '0 0 200px' }}
              onClick={acknowledgeUnload(presentMatReq)}
            >
              Unload Done
            </Button>
          </div>
        </div>
      )
    } else {
      return (
        <div>
          <Typography variant="standard" textTransform="uppercase">
            No AGV present
          </Typography>
        </div>
      )
    }
  }

  return (
    <>
      <Header title={`Commissioning Station: ${commissioningDest}`} />
      <div>
        <div style={styles.card}>
          {(lastMatReq && <Content presentMatReq={lastMatReq} />) || (
            <Typography variant="standard">No AGV present</Typography>
          )}
        </div>
      </div>
    </>
  )
}

const styles: Record<string, React.CSSProperties> = {
  item: {
    margin: 5,
    flex: '1',
  },
  orderRow: {
    display: 'flex',
    borderBottom: 'solid 1px #000',
    padding: '5px 3px',
  },
  flexRow: {
    display: 'flex',
  },
  card: {
    border: 'solid 1px #000',
    borderRadius: 7,
    flex: '1',
    width: 800,
    height: 650,
    margin: '50px auto',
    padding: 50,
    backgroundColor: '#F7FAFC',
  },
  cardHeader: { display: 'flex', marginBottom: 10, alignItems: 'flex-end' },
}
