import { ActiveState } from '../../fish/productionOrderFish'
import * as React from 'react'
import { ActiveState as MrActiveState } from '../../fish/materialRequestFish'
import { PartList } from './PartList'
import { MatReqList } from './MatReqList'

type Props = {
  order: ActiveState
  matReqs: MrActiveState[]
}

export const OrderListEntry = ({ order, matReqs }: Props): JSX.Element => {
  const [folded, setFolded] = React.useState(true)
  const { arrow, arrowDown } = styles
  return (
    <>
      <div onClick={() => setFolded(!folded)}>
        <div
          style={{
            ...arrow,
            ...(folded ? {} : arrowDown),
          }}
        >
          {' '}
        </div>
      </div>
      <div onClick={() => setFolded(!folded)}>{order.id.substr(0, 5)}</div>
      <div onClick={() => setFolded(!folded)}>{order.productName}</div>
      <div onClick={() => setFolded(!folded)}>{order.assignedWorkstation.join(', ')}</div>
      {!folded && (
        <>
          <div />
          <div className="partList">
            <PartList
              style={{ marginRight: 12 }}
              parts={Object.entries(order.parts).map(([id, { amount, productName }]) => ({
                id,
                amount,
                name: productName,
              }))}
            />
          </div>
          {matReqs.length !== 0 && (
            <>
              <div />
              <div className="partList">
                <MatReqList
                  style={{ marginRight: 12 }}
                  matReq={matReqs.map((matReq) => ({
                    id: matReq.id,
                    agv: matReq.assignedAgvList.length ? matReq.assignedAgvList.join(', ') : '---',
                    state: matReq.currentStep,
                  }))}
                />
              </div>
            </>
          )}
        </>
      )}
    </>
  )
}

const styles: Record<string, React.CSSProperties> = {
  arrow: {
    width: 12,
    height: 12,
    transition: 'transform 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55) ',
    border: 'solid 10px white',
    borderLeft: 'solid 16px #c1c1c1',
    transform: 'rotate(0deg)',
  },
  arrowDown: {
    transform: 'rotate(90deg) translate(25%, 25%)',
  },
}
