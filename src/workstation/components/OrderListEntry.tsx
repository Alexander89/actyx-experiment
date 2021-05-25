import { ActiveState } from '../../fish/productionOrderFish'
import * as React from 'react'
import { Typography } from '@actyx/industrial-ui'
import { Button } from '../../ui-common'

type Props = {
  state: ActiveState
  workstation: string
  onStartOrder: () => void
  onCancelOrder: () => void
  onCompleteOrder: () => void
}

export const OrderListEntry = ({
  state,
  workstation,
  onStartOrder,
  onCancelOrder,
  onCompleteOrder,
}: Props): JSX.Element => {
  return (
    <div style={styles.orderRow}>
      <div style={styles.item}>
        <Typography variant="standard">{state.productName}</Typography>
      </div>
      <div style={styles.item}>
        <Typography variant="standard">{state.assignedWorkstation.join(', ')}</Typography>
      </div>
      <div style={styles.item2}>
        {state.assignedWorkstation.length === 0 && (
          <Button color="green" onClick={onStartOrder}>
            start
          </Button>
        )}
        {state.assignedWorkstation.includes(workstation) && (
          <div style={{ display: 'flex' }}>
            <Button color="red" onClick={onCancelOrder}>
              cancel
            </Button>
            <Button color="green" onClick={onCompleteOrder}>
              done
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  item: {
    margin: 5,
    flex: '1',
    alignSelf: 'center',
  },
  item2: {
    flex: '0 0 220px',
  },
  orderRow: {
    display: 'flex',
    borderBottom: 'solid 1px #000',
    padding: '5px 3px',
  },
  orderList: {
    width: 500,
    margin: '10px 15px',
    border: 'solid 1px #000',
    borderRadius: 7,
  },
}
