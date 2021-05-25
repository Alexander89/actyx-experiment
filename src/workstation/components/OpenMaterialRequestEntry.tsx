import { ActiveState } from '../../fish/materialRequestFish'
import * as React from 'react'
import { Button } from '../../ui-common'
import { fromCamelCase } from '../../util'

type Props = {
  state: ActiveState
  onCancelOrder: () => void
}

export const OpenMaterialRequestEntry = ({ state, onCancelOrder }: Props): JSX.Element => {
  return (
    <div style={styles.orderRow}>
      <div style={{ ...styles.item1, maxWidth: 120, wordWrap: 'break-word' }}>
        {fromCamelCase(state.currentStep)}
      </div>
      <div style={styles.item1}>{state.assignedAgvList.join(', ')}</div>
      <div style={styles.item2}>
        {Object.values(state.payload)
          .map((s) => `${s.productName}(${s.amount})`)
          .join(', ')}
      </div>
      <div style={styles.item1}>
        <Button color="red" onClick={onCancelOrder}>
          cancel
        </Button>
      </div>
    </div>
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
  orderList: {
    width: 500,
    margin: '10px 15px',
    border: 'solid 1px #000',
    borderRadius: 7,
  },
}
