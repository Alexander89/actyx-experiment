import { MaterialRequestFish, MaterialRequestState, ProductionOrderFish } from '../../fish'
import { ActiveState as MrActiveState } from '../../fish/materialRequestFish'
import * as React from 'react'
import './orderList.css'
import { OrderListEntry } from './OrderListEntry'

import { useRegistryFish } from '@actyx-contrib/react-pond'
import { Typography } from '@actyx/industrial-ui'

export const isMrActiveState = (st: MaterialRequestState | undefined): st is MrActiveState =>
  st !== undefined && st.type === 'active'

export const OrderList = (): JSX.Element => {
  const orders = useRegistryFish(
    ProductionOrderFish.registry(),
    Object.keys,
    ProductionOrderFish.of,
  )
  const materialRequests = useRegistryFish(
    MaterialRequestFish.registry(),
    Object.keys,
    MaterialRequestFish.of,
  )

  const ordersWithMrs = orders.map((order) => ({
    order: order.state,
    matReqs: materialRequests
      .filter((matReq) => matReq.state.type === 'active' && matReq.state.orderId === order.state.id)
      .map((matReq) => matReq.state)
      .filter(isMrActiveState),
  }))

  return (
    <div style={{ flex: '0 1 780px', margin: '0px 15px' }}>
      <div style={{ marginBottom: 15 }}>
        <Typography variant="distance" bold textTransform="uppercase">
          Open orders
        </Typography>
      </div>
      <div className="orderList">
        <div />
        <div className="orderListId">Id</div>
        <div>Product</div>
        <div>Workstation</div>
        {ordersWithMrs.map(
          ({ order, matReqs }) =>
            order.type === 'active' && (
              <OrderListEntry key={order.id} order={order} matReqs={matReqs} />
            ),
        )}
      </div>
    </div>
  )
}
