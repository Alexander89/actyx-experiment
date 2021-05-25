import { Typography, Input } from '@actyx/industrial-ui'
import { FishName } from '@actyx/pond/lib/types'
import { deepStrictEqual } from 'assert'
import * as React from 'react'
import { Vec } from '../../../math/vec2d'
import { Button } from '../../../ui-common'
import { PositionData } from './Map'

const defaultPosData: PositionData = {
  dockAngleRad: 0,
  dockPos: [0, 0],
  name: '',
  preDockAngleRad: 0,
  preDockPos: [0, 0],
}

const degToRad = (deg: number): number => (deg / 360) * 2 * Math.PI

const radToDeg = (rad: number): number => (rad / (2 * Math.PI)) * 360

type Props = {
  existingPositionNames: ReadonlyArray<string>
  mousePosition?: Vec
  selected?: PositionData
  tempPosition?: PositionData
  onCreateAddPosition: (position: PositionData) => void
  onUpdateTempDrawing: (position: PositionData) => void
  onDelete: () => void
  onCancel: () => void
  duplicateSelected: () => void
}

export const PositionControl = React.memo(
  ({
    existingPositionNames,
    mousePosition,
    selected,
    tempPosition,
    onCreateAddPosition,
    onUpdateTempDrawing,
    onDelete,
    onCancel,
    duplicateSelected,
  }: Props) => {
    const position = selected || tempPosition || defaultPosData

    existingPositionNames.includes(position.name)

    const feedback = () => {
      if (position.name === '') {
        return 'please set an name/id'
      }
      if (!selected && existingPositionNames.includes(position.name)) {
        return `${position.name} already exists`
      }
      return ''
    }

    const savePos = () => {
      if (feedback() === '') {
        onCreateAddPosition(position)
        onUpdateTempDrawing(defaultPosData)
      }
    }

    return (
      <>
        <div style={{ display: 'inline-flex' }}>
          <Button color="yellow" onClick={() => onCancel()} icon="arrow_back">
            Back
          </Button>
          {(selected && (
            <>
              <Button color="red" style={{ marginLeft: 12 }} onClick={onDelete} icon="delete">
                Delete selected
              </Button>
              <Button
                color="primary"
                style={{ marginLeft: 12 }}
                onClick={savePos}
                icon="control_camera"
              >
                move
              </Button>
              <Button
                color="primary"
                style={{ marginLeft: 12 }}
                onClick={duplicateSelected}
                icon="filter_none"
              >
                Duplicate
              </Button>
            </>
          )) || (
            <Button color="green" style={{ marginLeft: 12 }} onClick={savePos} icon="save">
              set position
            </Button>
          )}
        </div>
        <div>
          <Typography variant="distance">ID/Name:</Typography>
          <Input
            type="text"
            placeholder="id"
            onChange={({ target }) => {
              const { name } = position
              const newName = FishName.of(target.value)
              if (name !== newName) {
                const newPos = {
                  ...position,
                  name: newName,
                }
                onUpdateTempDrawing(newPos)
              }
            }}
            value={position.name}
          />
        </div>
        <div style={{ display: 'flex' }}>
          <div style={{ display: 'flex' }}>
            <div>
              <div>Pre dock position</div>

              <div>
                <Typography variant="standard">X:</Typography>{' '}
                <Input
                  type="number"
                  onChange={({ target }) => {
                    const newX = +target.value
                    if (newX !== position.preDockPos[0]) {
                      const newPos: PositionData = {
                        ...position,
                        preDockPos: [newX, position.preDockPos[1]],
                      }
                      onUpdateTempDrawing(newPos)
                    }
                  }}
                  value={position.preDockPos[0]}
                />
              </div>
              <div>
                <Typography variant="standard">Y:</Typography>{' '}
                <Input
                  type="number"
                  onChange={({ target }) => {
                    if (+target.value !== position.preDockPos[1]) {
                      onUpdateTempDrawing({
                        ...position,
                        preDockPos: [position.preDockPos[0], +target.value],
                      })
                    }
                  }}
                  value={position.preDockPos[1]}
                />
              </div>
              <div>
                <Typography variant="standard">Angle:</Typography>{' '}
                <Input
                  type="number"
                  onChange={({ target }) => {
                    const rad = degToRad(+target.value)
                    if (rad !== position.preDockAngleRad) {
                      onUpdateTempDrawing({ ...position, preDockAngleRad: rad })
                    }
                  }}
                  value={radToDeg(position.preDockAngleRad)}
                />
              </div>

              {mousePosition && (
                <Button
                  color="primary"
                  onClick={() => onUpdateTempDrawing({ ...position, preDockPos: mousePosition })}
                >
                  set cursor pos
                </Button>
              )}
            </div>
          </div>
          <div style={{ display: 'flex' }}>
            <div>
              <div>dock position</div>
              <div>
                <Typography variant="standard">X:</Typography>{' '}
                <Input
                  type="number"
                  onChange={({ target }) => {
                    if (+target.value !== position.dockPos[0]) {
                      onUpdateTempDrawing({
                        ...position,
                        dockPos: [+target.value, position.dockPos[1]],
                      })
                    }
                  }}
                  value={position.dockPos[0]}
                />
              </div>
              <div>
                <Typography variant="standard">Y:</Typography>{' '}
                <Input
                  type="number"
                  onChange={({ target }) => {
                    if (+target.value !== position.dockPos[1]) {
                      onUpdateTempDrawing({
                        ...position,
                        dockPos: [position.dockPos[0], +target.value],
                      })
                    }
                  }}
                  value={position.dockPos[1]}
                />
              </div>
              <div>
                <Typography variant="standard">Angle:</Typography>{' '}
                <Input
                  type="number"
                  onChange={({ target }) => {
                    const rad = degToRad(+target.value)
                    if (rad !== position.dockAngleRad) {
                      onUpdateTempDrawing({ ...position, dockAngleRad: rad })
                    }
                  }}
                  value={radToDeg(position.dockAngleRad)}
                />
              </div>
              {mousePosition && (
                <Button
                  color="primary"
                  onClick={() => onUpdateTempDrawing({ ...position, dockPos: mousePosition })}
                >
                  Set current pos
                </Button>
              )}
            </div>
          </div>
        </div>
        <div>
          <Typography variant="distance" color="#ff0000">
            {feedback()}
          </Typography>
        </div>
      </>
    )
  },
  (a, b) => {
    try {
      deepStrictEqual(
        [a.existingPositionNames, a.mousePosition, a.selected, a.tempPosition],
        [b.existingPositionNames, b.mousePosition, b.selected, b.tempPosition],
      )
      return true
    } catch (e) {
      return false
    }
  },
)
// tslint:disable-next-line: no-object-mutation
PositionControl.displayName = 'PositionControl'
