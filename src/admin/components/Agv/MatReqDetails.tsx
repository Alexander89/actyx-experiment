import { useFishFn } from '@actyx-contrib/react-pond'
import { MaterialRequestFish } from '../../../fish'
import * as React from 'react'
import { Details } from './Details'

type Props = {
  id: string
  onClose: () => void
}

export const MatReqDetails = ({ id, onClose }: Props): JSX.Element => {
  const MatReq = useFishFn(MaterialRequestFish.of, id)
  if (MatReq) {
    return (
      <Details
        title={`Material Request details ${id}`}
        content={JSON.stringify(MatReq && MatReq.state, undefined, 2)}
        onClose={onClose}
      />
    )
  }
  return <></>
}
