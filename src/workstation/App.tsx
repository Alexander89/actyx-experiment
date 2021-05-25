import {
  MaterialRequestEventType,
  MaterialRequestFish,
  MaterialRequestState,
  ProductionOrderEventType,
  ProductionOrderFish,
  ProductionOrderState,
} from '../fish'
import { ActiveState as MaterialRequestActiveState } from '../fish/materialRequestFish'
import { ActiveState } from '../fish/productionOrderFish'
import * as React from 'react'
import { Header, PartList } from '../ui-common'
import * as uuid from 'uuid'
import { getSettings, pickRandom } from '../util'
import { OpenMaterialRequestEntry } from './components/OpenMaterialRequestEntry'
import { OrderListEntry } from './components/OrderListEntry'
import { usePond, useRegistryFish } from '@actyx-contrib/react-pond'
import {
  Button,
  Dialog,
  DialogHeader,
  FooterWithConfirmation,
  Input,
  Typography,
} from '@actyx/industrial-ui'

type ContentProps = {
  presentMatReq: MaterialRequestActiveState
  setShowRejectDialog: (v: boolean) => void
  setRmIdToReject: (v: string) => void
}

const defaultSettings = {
  workstationName: 'Workstation 1',
  preferredStorage: ['Storage 1'],
}
const settings = getSettings(defaultSettings)
const workstation = settings.workstationName

export const Content = ({
  presentMatReq,
  setShowRejectDialog,
  setRmIdToReject,
}: ContentProps): JSX.Element => {
  const pond = usePond()
  const acknowledgeUnload = (st: MaterialRequestState) => () => {
    MaterialRequestFish.emitUnloadDone(pond, st.id)
  }

  const rejectUnload = (st: MaterialRequestState) => () => {
    setShowRejectDialog(true)
    setRmIdToReject(st.id)
  }
  return (
    <>
      <Typography variant="distance">
        <PartList parts={presentMatReq.payload} height={500} />
      </Typography>

      <div style={{ marginBottom: 15 }}>
        <hr />
      </div>
      <div style={{ display: 'flex' }}>
        <Button
          text="Reject"
          variant="raised"
          color="red"
          centered
          onClick={rejectUnload(presentMatReq)}
          fullWidth
        />
        <div style={{ flex: '0 0 100px' }} />
        <Button
          text="Acknowledge"
          variant="raised"
          color="primary"
          centered
          onClick={acknowledgeUnload(presentMatReq)}
          fullWidth
        />
      </div>
    </>
  )
}

export const App = (): JSX.Element => {
  const [showRejectDialog, setShowRejectDialog] = React.useState(false)
  const [rejectReason, setRejectReason] = React.useState('')
  const [rmIdToReject, setRmIdToReject] = React.useState('')
  const pond = usePond()

  const orders = useRegistryFish(
    ProductionOrderFish.registry(),
    Object.keys,
    ProductionOrderFish.of,
  )
    .map((s) => s.state)
    .filter((orderState): orderState is ActiveState => orderState.type === 'active')

  const allOpenMR = useRegistryFish(
    MaterialRequestFish.registry(),
    Object.keys,
    MaterialRequestFish.of,
  )
    .map(({ state }) => state)
    .filter(
      (mrState): mrState is MaterialRequestActiveState =>
        mrState.type === 'active' && mrState.destination === workstation,
    )
  const presentMatReq = allOpenMR
    .filter((mr) => mr.destination === workstation && mr.currentStep === 'waitForAck')
    .pop()

  const startOrder = (st: ActiveState) => () => {
    ProductionOrderFish.emitPostableEvent(pond, {
      type: ProductionOrderEventType.assigned,
      workstation, // @ToDo replace with settings
      id: st.id,
    })

    const materialRequestId = uuid.v4()
    MaterialRequestFish.emitPlaced(pond, {
      type: MaterialRequestEventType.placed,
      id: materialRequestId,
      destination: workstation,
      pickUpCommissioningDest: pickRandom(settings.preferredStorage),
      orderId: st.id,
      products: st.parts,
    })
  }
  const cancelOrder = (st: ProductionOrderState) => () =>
    ProductionOrderFish.emitPostableEvent(pond, {
      type: ProductionOrderEventType.unassigned,
      id: st.id,
      workstation, // @ToDo replace with settings
    })
  const finishOrder = (st: ProductionOrderState) => () =>
    ProductionOrderFish.emitCompletedEvent(pond, st.id)
  const cancelMaterialRequest = (st: MaterialRequestState) => () =>
    MaterialRequestFish.emitCanceled(pond, st.id)

  return (
    <>
      <Header title={`Workstation: ${workstation}`} />
      <div style={{ display: 'flex' }}>
        <div>
          <div style={styles.card}>
            <Typography variant="standard" bold textTransform="uppercase">
              Orders
            </Typography>
            <div style={styles.orderRow}>
              <div style={styles.item1}>
                <Typography variant="standard">Product:</Typography>
              </div>
              <div style={styles.item1}>
                <Typography variant="standard">Workstation:</Typography>
              </div>
              <div style={{ flex: '0 0 220px' }} />
            </div>
            <div style={{ height: 280, maxHeight: 280, overflowY: 'auto' }}>
              {orders.map((st) => (
                <OrderListEntry
                  state={st}
                  workstation={workstation}
                  key={st.id}
                  onStartOrder={startOrder(st)}
                  onCancelOrder={cancelOrder(st)}
                  onCompleteOrder={finishOrder(st)}
                />
              ))}
            </div>
          </div>
          <div style={styles.card}>
            <Typography variant="standard" bold textTransform="uppercase">
              Open material requests
            </Typography>
            <div style={styles.orderRow}>
              <div style={styles.item1}>
                <Typography variant="standard">State</Typography>
              </div>
              <div style={styles.item1}>
                <Typography variant="standard">Agv</Typography>
              </div>
              <div style={styles.item2}>
                <Typography variant="standard">Load</Typography>
              </div>
              <div style={{ flex: '0 0 135px' }} />
            </div>
            <div style={{ height: 210, maxHeight: 210, overflowY: 'auto' }}>
              {allOpenMR.map((st) => (
                <OpenMaterialRequestEntry
                  state={st}
                  key={st.id}
                  onCancelOrder={cancelMaterialRequest(st)}
                />
              ))}
            </div>
          </div>
        </div>
        <div>
          <div style={{ ...styles.card, flex: '1', height: 734 }}>
            <div style={{ marginBottom: 15 }}>
              <Typography variant="standard" bold textTransform="uppercase">
                Present AGV
              </Typography>
            </div>
            <div style={{ marginBottom: 15 }}>
              <hr />
            </div>
            {(presentMatReq && (
              <Content
                presentMatReq={presentMatReq}
                setRmIdToReject={setRmIdToReject}
                setShowRejectDialog={setShowRejectDialog}
              />
            )) || <Typography variant="distance">No AGV present</Typography>}
          </div>
        </div>

        {showRejectDialog && (
          <Dialog
            size="md"
            header={<DialogHeader text="Reject delivery" />}
            content={
              <div>
                <Typography variant="distance">
                  Please note the reason for rejecting the delivery
                </Typography>
                <Input
                  type="text"
                  value={rejectReason}
                  onChange={({ target }) =>
                    target.value !== rejectReason && setRejectReason(target.value)
                  }
                  fullWidth
                />
              </div>
            }
            footer={
              <FooterWithConfirmation
                onConfirm={() => {
                  setShowRejectDialog(false)
                  MaterialRequestFish.emitPostableEvent(pond, {
                    type: MaterialRequestEventType.rejected,
                    id: rmIdToReject,
                    reason: rejectReason,
                  })
                }}
                onCancel={() => setShowRejectDialog(false)}
                disableConfirm={rejectReason.length < 1}
                confirmMessage="Do you really want to reject the delivery?"
              />
            }
            onClose={() => setShowRejectDialog(false)}
          />
        )}
      </div>
    </>
  )
}

const styles: Record<string, React.CSSProperties> = {
  item1: {
    margin: 5,
    flex: '1',
  },
  item2: {
    margin: 5,
    flex: '2',
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
    width: 680,
    margin: '12px 24px',
    border: 'solid 1px #000',
    borderRadius: 7,
    padding: '12px 24px',
    backgroundColor: '#f6f6f9',
  },
}
