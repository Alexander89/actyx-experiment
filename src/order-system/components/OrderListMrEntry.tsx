import { ActiveState } from '../../fish/materialRequestFish'
import * as React from 'react'
import { fromCamelCase } from '../../util'

type Props = {
  materialRequest: ActiveState
}

export const OrderListMrEntry = ({ materialRequest }: Props): JSX.Element => {
  return (
    <>
      <div>{materialRequest.assignedAgvList.join(', ') || '---'}</div>
      <div>{fromCamelCase(materialRequest.currentStep)}</div>
    </>
  )
}
