import { AdminUiFish, GlobalRefFish } from '../../../fish'
import { Vec } from '../../../math/vec2d'
import * as React from 'react'
import { usePond } from '@actyx-contrib/react-pond'
import { Button, Input } from '../../../ui-common'
import { Typography } from '@actyx/industrial-ui'

type Props = {
  onCancel: () => void
  positionGlobal: Vec
  positionMap: Vec
  positionPixel: Vec
  onSetPositionGlobal: (pos: Vec) => void
  onSetPositionMap: (pos: Vec) => void
  onSetPositionPixel: (pos: Vec) => void
}

export const GlobalRefControl = React.memo(
  ({
    onCancel,
    positionGlobal,
    positionMap,
    positionPixel,
    onSetPositionGlobal,
    onSetPositionMap,
    onSetPositionPixel,
  }: Props) => {
    const pond = usePond()

    const onSetUIOrigin = () => {
      if (positionPixel) {
        AdminUiFish.emitUpdateOrigin(pond, positionPixel)
      }
    }
    const onSetUIRef = () => {
      if (positionPixel) {
        AdminUiFish.emitUpdateRef(pond, positionPixel)
      }
    }
    const onSetGlobalOrigin = () => {
      if (positionMap) {
        GlobalRefFish.emitUpdateOrigin(pond, positionMap)
      }
    }
    const onSetGlobalRef = () => {
      if (positionMap) {
        GlobalRefFish.emitUpdateRef(pond, positionMap)
      }
    }
    const onResetRef = () => {
      AdminUiFish.emitUpdateOrigin(pond, [76, 880])
      AdminUiFish.emitUpdateRef(pond, [76, 850])
      GlobalRefFish.emitUpdateOrigin(pond, [0, 0])
      GlobalRefFish.emitUpdateRef(pond, [0, 1])
    }
    return (
      <>
        <div style={{ display: 'flex' }}>
          <Button color="yellow" onClick={() => onCancel()}>
            Back
          </Button>
          <Button color="primary" style={{ marginLeft: 12 }} onClick={() => onSetUIOrigin()}>
            Set UI Origin
          </Button>
          <Button color="primary" style={{ marginLeft: 12 }} onClick={() => onSetUIRef()}>
            Set UI Reference
          </Button>
          <Button color="primary" style={{ marginLeft: 12 }} onClick={() => onSetGlobalOrigin()}>
            Set Global Origin
          </Button>
          <Button color="primary" style={{ marginLeft: 12 }} onClick={() => onSetGlobalRef()}>
            Set Global Reference
          </Button>
          <Button color="neutral" style={{ marginLeft: 12 }} onClick={() => onResetRef()}>
            reset References
          </Button>
        </div>
        <div style={{ display: 'flex' }}>
          <div style={{ display: 'flex', margin: '12px 24px' }}>
            <div>
              <Typography variant="standard" textTransform="uppercase">
                Global
              </Typography>
              <div>
                <Input
                  lable="X:"
                  type="number"
                  onChanged={(value) => onSetPositionGlobal([+value, positionGlobal[1]])}
                  value={positionGlobal[0]}
                />
              </div>
              <div>
                <Input
                  lable="Y:"
                  type="number"
                  onChanged={(value) => onSetPositionGlobal([positionGlobal[0], +value])}
                  value={positionGlobal[1]}
                />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', margin: '12px 24px' }}>
            <div>
              <Typography variant="standard" textTransform="uppercase">
                Map
              </Typography>
              <div>
                <Input
                  lable="X:"
                  type="number"
                  onChanged={(value) => onSetPositionMap([+value, positionMap[1]])}
                  value={positionMap[0]}
                />
              </div>
              <div>
                <Input
                  lable="Y:"
                  type="number"
                  onChanged={(value) => onSetPositionMap([positionMap[0], +value])}
                  value={positionMap[1]}
                />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', margin: '12px 24px' }}>
            <div>
              <Typography variant="standard" textTransform="uppercase">
                UI Pixel (Global)
              </Typography>
              <div>
                <Input
                  lable="X:"
                  type="number"
                  onChanged={(value) => onSetPositionPixel([+value, positionPixel[1]])}
                  value={positionPixel[0]}
                />
              </div>
              <div>
                <Input
                  lable="Y:"
                  type="number"
                  onChanged={(value) => onSetPositionPixel([positionPixel[0], +value])}
                  value={positionPixel[1]}
                />
              </div>
            </div>
          </div>
        </div>
      </>
    )
  },
  (a, b) => a.positionGlobal === b.positionGlobal,
)
// tslint:disable-next-line: no-object-mutation
GlobalRefControl.displayName = 'GlobalRefControl'
