import { usePond } from '@actyx-contrib/react-pond'
import { Typography } from '@actyx/industrial-ui'
import * as React from 'react'
import { ProductionOrderFish } from '../../fish'
import { ProductMap } from '../../fish/materialRequestFish'
import { Input, Button } from '../../ui-common'
import { Parts, PartList } from './PartList'

export const NewOrder = (): JSX.Element => {
  const [orderId, setOrderId] = React.useState('')
  const [productName, setProductName] = React.useState('')
  const [parts, setParts] = React.useState<ReadonlyArray<Parts>>([])

  const [partId, setPartId] = React.useState('')
  const [partName, setPartName] = React.useState('')
  const [partAmount, setPartAmount] = React.useState(1)

  const pond = usePond()

  const resetInput = () => {
    setOrderId('')
    setProductName('')
    setParts([])
    setPartId('')
    setPartName('')
    setPartAmount(1)
  }

  const addComponent = () => {
    setParts([
      ...parts,
      {
        id: partId,
        name: partName,
        amount: partAmount,
      },
    ])
    setPartId('')
    setPartName('')
  }

  const isValid = () => {
    return parts.length > 0 && orderId.length > 0 && productName.length > 0
  }

  const placeOrder = () => {
    if (isValid()) {
      const partMap: ProductMap = parts.reduce<ProductMap>((result, current) => {
        return {
          ...result,
          [current.id]: {
            amount: current.amount,
            productName: current.name,
          },
        }
      }, {})
      ProductionOrderFish.emitPlacedEvent(pond, productName, partMap)
    }
  }

  const { buttonBar } = styling
  return (
    <div>
      <div style={{ marginBottom: 15 }}>
        <Typography variant="distance" textTransform="uppercase" bold>
          Create new production order
        </Typography>
      </div>
      <div>
        <Typography variant="standard" semiBold>
          Info:
        </Typography>
        <Input
          style={{ margin: '12px 24px' }}
          lable="Order Id"
          placeholder="Order Id"
          value={orderId}
          onChanged={setOrderId}
          width={200}
        />
        <Input
          style={{ margin: '12px 24px' }}
          lable="Product Name"
          placeholder="Product Name"
          value={productName}
          onChanged={setProductName}
          width={200}
        />
      </div>
      <div style={{ marginTop: 36 }}>
        <Typography variant="standard" semiBold>
          Part list:
        </Typography>
        <div style={{ margin: '12px 24px' }}>
          <PartList parts={parts} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Input
          style={{ margin: '12px 24px' }}
          lable="Id"
          placeholder="Id"
          value={partId}
          onChanged={setPartId}
          width={80}
        />
        <Input
          style={{ margin: '12px 24px' }}
          lable="Name"
          placeholder="Name"
          value={partName}
          onChanged={setPartName}
          width={120}
        />
        <Input
          style={{ margin: '12px 24px' }}
          lable="Amount"
          placeholder="0"
          type="number"
          value={partAmount}
          onChanged={setPartAmount}
          width={90}
        />

        <Button color="green" icon="add" onClick={addComponent}>
          +
        </Button>
      </div>
      <div style={buttonBar}>
        <div style={{ flex: '2' }}> </div>
        <Button
          color="primary"
          icon="add"
          disabled={!isValid()}
          style={{ marginRight: 24 }}
          onClick={placeOrder}
        >
          Place order
        </Button>
        <Button color="red" icon="delete" onClick={resetInput}>
          Reset
        </Button>
      </div>
    </div>
  )
}

type CSS = Record<string, React.CSSProperties>

const styling: CSS = {
  root: {
    margin: 10,
    display: 'flex',
  },
  wrapper: {
    flex: '1',
    display: 'flex',
    justifyContent: 'center',
  },
  buttonBar: {
    display: 'flex',
    marginTop: 12,
    textAlign: 'right',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#F7FAFC',
    padding: '12px 24px',
    margin: '12px 24px',
    borderRadius: 12,
  },
  innerCard: {
    backgroundColor: '#e5e8ea',
    padding: '12px 24px',
    margin: '12px 24px',
    borderRadius: 12,
  },
}
