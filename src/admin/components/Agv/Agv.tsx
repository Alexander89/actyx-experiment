import { usePond, useRegistryFish } from '@actyx-contrib/react-pond'
import { AgvEventType, AgvFish, GlobalRefState } from '../../../fish'
import { createTransformData } from '../../../math/translateMap'
import { Vec } from '../../../math/vec2d'
import * as React from 'react'
import { Typography, Input } from '@actyx/industrial-ui'
import { setupEveryThing } from '../../defaultSetup'
import { AgvDetails } from './AgvDetails'
import { MatReqDetails } from './MatReqDetails'
import { Button } from '../../../ui-common'

type Props = {
  globalRef: GlobalRefState
}

type Details = {
  type: 'agv' | 'matReq'
  id: string
}

export const Agv = ({ globalRef }: Props): JSX.Element => {
  const pond = usePond()
  const [agvName, setAgvName] = React.useState('')
  const [agvType, setAgvType] = React.useState('')
  const [showDetailsFor, setShowDetailsFor] = React.useState<Details | undefined>()

  const agvs = useRegistryFish(AgvFish.registry(), Object.keys, AgvFish.of).map((s) => s.state)

  const resetInput = () => {
    setAgvName('')
    setAgvType('')
  }

  const addAgv = () => {
    AgvFish.emitSetup(pond, {
      type: AgvEventType.setupAgv,
      id: agvName,
      agvType,
      battery: 100,
      position: [0, 0],
      rotation: 0,
      speed: 0,
      origin: globalRef.origin,
      reference: globalRef.ref,
      transform: {
        rotateRad: 0,
        scale: 1,
        translate: [0, 0],
      },
    })
  }

  const stopDriveOrder = (id: string) => () =>
    AgvFish.emitPostEvent(pond, { type: AgvEventType.driveOrderRemoved, id })

  const setOffline = (id: string, offline: boolean) => () => {
    AgvFish.emitPostEvent(pond, { type: AgvEventType.offlineChanged, id, offline })
  }
  const useGlobalRefPoints = (id: string) => () =>
    updateOriginReference(id, globalRef.origin, globalRef.ref)

  const resetSystem = () => {
    console.log('resetSystem')
    setupEveryThing(pond)
  }

  const updateOriginReference = (id: string, origin: Vec, reference: Vec) => () => {
    const transform = createTransformData(globalRef.origin, globalRef.ref, origin, reference)
    AgvFish.emitPostEvent(pond, {
      type: AgvEventType.mapTransformSet,
      id,
      origin,
      reference,
      transform: {
        rotateRad: transform.rotate,
        scale: transform.scaleFactor,
        translate: transform.translate,
      },
    })
  }

  const { buttonBar } = styling
  return (
    <div>
      {showDetailsFor &&
        ((showDetailsFor.type === 'agv' && (
          <AgvDetails agvName={showDetailsFor.id} onClose={() => setShowDetailsFor(undefined)} />
        )) ||
          (showDetailsFor.type === 'matReq' && (
            <MatReqDetails id={showDetailsFor.id} onClose={() => setShowDetailsFor(undefined)} />
          )))}
      <br />
      <div style={{ display: 'flex' }}>
        <div
          style={{
            margin: '12px 24px',
            padding: '24px 36px',
            backgroundColor: '#fcfcfc',
            borderRadius: 12,
            width: 500,
          }}
        >
          <div style={{ marginBottom: 15 }}>
            <Typography variant="standard" bold textTransform="uppercase">
              Define new Agv
            </Typography>
          </div>
          <div>
            <div style={{ marginBottom: 15 }}>
              <Typography variant="subtext">Name: </Typography>
              <div style={{ flex: '1' }}></div>
              <Input
                type="text"
                placeholder="Agv Name"
                value={agvName}
                onChange={({ target }) => setAgvName(target.value)}
              />
            </div>
            <div style={{ marginBottom: 15 }}>
              <Typography variant="subtext">Type: </Typography>
              <div style={{ flex: '1' }}></div>
              <Input
                type="text"
                placeholder="Agv Type"
                value={agvType}
                onChange={({ target }) => setAgvType(target.value)}
              />
            </div>
          </div>
          <div style={buttonBar}>
            <Button color="primary" icon="add" onClick={addAgv}>
              define AGV
            </Button>{' '}
            <Button color="red" icon="delete" onClick={resetInput}>
              reset
            </Button>
          </div>
        </div>
        <div style={{ flex: '1' }}></div>
        <div
          style={{
            margin: '12px 24px',
            padding: '24px 36px',
            backgroundColor: '#fcfcfc',
            borderRadius: 12,
            width: 300,
          }}
        >
          <div style={{ marginBottom: 24 }}>
            <Typography variant="standard" bold textTransform="uppercase">
              System Setup
            </Typography>
          </div>
          <Button color="red" icon="error" onClick={resetSystem}>
            Standart Demo Setup
          </Button>
        </div>
      </div>

      <br />
      <div
        style={{
          margin: '12px 24px',
          padding: '24px 36px',
          backgroundColor: '#fcfcfc',
          borderRadius: 12,
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <Typography variant="standard" bold textTransform="uppercase">
            Avg Status
          </Typography>
        </div>
        {agvs.map((agv, idx) => {
          if (agv.type === 'undefined') {
            return <div>error</div>
          }
          return (
            <div
              key={agv.id}
              style={{
                display: 'flex',
                flexDirection: 'row',
                borderBottom: 'solid #0375b3 2px',
                borderTop: idx == 0 ? 'solid #0375b3 2px' : 'none',
              }}
            >
              <div
                style={{
                  marginRight: 10,
                  padding: '12px 24px',
                  flex: '1',
                }}
              >
                <div
                  onClick={() => setShowDetailsFor({ type: 'agv', id: agv.id })}
                  style={{ marginBottom: 12 }}
                >
                  <Typography variant="standard" bold textTransform="uppercase">
                    {agv.id} {agv.agvType} {agv.type}
                  </Typography>
                </div>
                {agv.driveOrder && (
                  <div>
                    <Typography variant="standard">
                      Drive Order: {JSON.stringify(agv.driveOrder)}
                    </Typography>
                  </div>
                )}
                {agv.type !== 'offline' && agv.materialRequest && (
                  <div>
                    <Typography variant="standard">
                      <span
                        onClick={() =>
                          agv.materialRequest &&
                          setShowDetailsFor({ type: 'matReq', id: agv.materialRequest })
                        }
                      >
                        Material Request: {agv.materialRequest}
                      </span>
                    </Typography>
                  </div>
                )}
                <div>
                  <Typography variant="standard">
                    Position: ({(agv.position[0] || 0).toFixed(2)},{' '}
                    {(agv.position[1] || 0).toFixed(2)}) Rotation:{' '}
                    {(2 * Math.PI * agv.rotation || 0).toFixed(2)}° Speed:{' '}
                    {(agv.speed || 0).toFixed(2)} m/s
                  </Typography>
                  {agv.type === 'offline' && (
                    <div>
                      <div style={{ display: 'inline-flex' }}>
                        <Button color="primary" onClick={useGlobalRefPoints(agv.id)}>
                          Pos as reference points
                        </Button>{' '}
                        <Button
                          color="primary"
                          onClick={updateOriginReference(agv.id, agv.position, agv.reference)}
                        >
                          Pos as origin
                        </Button>{' '}
                        <Button
                          color="primary"
                          onClick={updateOriginReference(agv.id, agv.origin, agv.position)}
                        >
                          Same as Global reference
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div
                style={{
                  padding: 10,
                }}
              >
                {agv.driveOrder && (
                  <Button color="primary" onClick={stopDriveOrder(agv.id)}>
                    Stop drive order
                  </Button>
                )}
                {agv.type === 'stopped' && agv.materialRequest && (
                  <Button
                    color="primary"
                    onClick={() =>
                      agv.materialRequest &&
                      AgvFish.emitStopAssignedMaterialRequest(pond, agv.id, agv.materialRequest)
                    }
                  >
                    Stop assigned material request
                  </Button>
                )}
                {agv.type === 'offline' && (
                  <Button color="green" onClick={setOffline(agv.id, false)}>
                    Online
                  </Button>
                )}
                {agv.type !== 'offline' && !agv.materialRequest && (
                  <Button color="yellow" onClick={setOffline(agv.id, true)}>
                    Offline
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const styling: Record<string, React.CSSProperties> = {
  root: {
    margin: 10,
  },
  wrapper: {
    display: 'flex',
    justifyContent: 'space-around',
  },
  buttonBar: {
    display: 'flex',
    marginTop: 35,
    textAlign: 'right',
  },
}
