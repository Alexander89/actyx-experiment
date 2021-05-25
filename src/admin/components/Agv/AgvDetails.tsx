import { useFishFn, usePond } from '@actyx-contrib/react-pond'
import { AgvFish } from '../../../fish'
import * as React from 'react'
import { Details } from './Details'
import { EventType } from '../../../fish/agvFish'
import { Button } from '../../../ui-common'

type Props = {
  agvName: string
  onClose: () => void
}

export const AgvDetails = ({ agvName, onClose }: Props): JSX.Element => {
  const agv = useFishFn(AgvFish.of, agvName)
  const pond = usePond()
  const forceStop = () => {
    AgvFish.emitPostEvent(pond, {
      type: EventType.stopped,
      id: agvName,
    })
  }
  if (agv) {
    return (
      <Details
        title="AGV details"
        content={JSON.stringify(agv && agv.state, undefined, 2)}
        onClose={onClose}
      >
        <Button color="red" onClick={forceStop}>
          force Stop
        </Button>
      </Details>
    )
  }
  return <></>
}
