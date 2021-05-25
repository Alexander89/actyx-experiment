import { DefinedState as Zone, ZoneProperties } from '../../../fish/zoneFish'
import * as React from 'react'
import { propsToString } from './drawLib'
import { TouchRipple, Typography } from '@actyx/industrial-ui'
import { FishName } from '@actyx/pond/lib/types'
import { Button, Input } from '../../../ui-common'

type Props = {
  onCancel: () => void
  onCreateZone: (selectedId: string, portalSize: number, properties: ZoneProperties) => void
  onActivateZone: (zoneId: string) => void
  onDeactivateZone: (zoneId: string) => void
  onDeleteZone: (zoneId: string) => void
  onUndo: () => void
  existingZones: ReadonlyArray<Zone>
}

export const ZoneControl = ({
  onCancel,
  onCreateZone,
  onActivateZone,
  onDeactivateZone,
  onDeleteZone,
  onUndo,
  existingZones,
}: Props): JSX.Element => {
  const [selectedId, setSelectedId] = React.useState<string>('')
  const [maxDevices, setMaxDevices] = React.useState<number>()
  const [noStop, setNoStop] = React.useState<boolean>()
  const [maxSpeed, setMaxSpeed] = React.useState<number>()
  const [portalSize, setPortalSize] = React.useState<number>(1.5)
  const [feedback, setFeedback] = React.useState<string>('')

  const getZoneProperties = (): ZoneProperties => [
    ...(maxDevices === undefined ? [] : ([{ type: 'maxDevices', maxDevices }] as ZoneProperties)),
    ...(noStop === undefined ? [] : ([{ type: 'noStop' }] as ZoneProperties)),
    ...(maxSpeed === undefined ? [] : ([{ type: 'maxSpeed', speed: maxSpeed }] as ZoneProperties)),
  ]

  const existingZoneIds = existingZones.map((z) => z.id)
  return (
    <>
      <div style={{ display: 'inline-flex' }}>
        <Button color="yellow" onClick={() => onCancel()} icon="arrow_back">
          Back
        </Button>
        <Button
          color="green"
          style={{ marginLeft: 12 }}
          onClick={() => {
            if (selectedId === '') {
              setFeedback('please set an id')
              return
            }
            onCreateZone(selectedId, portalSize, getZoneProperties())
            setSelectedId('')
          }}
          icon="save"
        >
          create/set Zone
        </Button>
        <Button color="yellow" style={{ marginLeft: 12 }} onClick={() => onUndo()} icon="undo">
          undo
        </Button>
      </div>
      <div>
        <div style={{ display: 'inline-flex' }}>
          <Input
            lable="Id:"
            type="text"
            placeholder="id"
            onChanged={(value) => {
              if (selectedId !== value) {
                setSelectedId(value)
                if (existingZoneIds.includes(value)) {
                  setFeedback(`Zone ${value} will be overwritten`)
                } else {
                  setFeedback('')
                }
              }
            }}
            value={selectedId}
          />
          <Input
            lable="Portal size:"
            type="number"
            placeholder="portal size"
            onChanged={(value) => portalSize !== +value && setPortalSize(+value)}
            value={portalSize}
          />
        </div>
      </div>
      <div style={{ display: 'inline-flex', flexDirection: 'column' }}>
        <Typography variant="distance">Zone Properties</Typography>
        <div
          style={{
            ...styles.propertyLine,
            backgroundColor: maxDevices === undefined ? 'grey' : 'white',
          }}
        >
          <TouchRipple
            style={{
              ...styles.checkBock,
              backgroundColor: maxDevices === undefined ? 'green' : 'red',
            }}
            onClick={() => (maxDevices === undefined ? setMaxDevices(1) : setMaxDevices(undefined))}
          >
            {maxDevices === undefined ? '+' : '-'}
          </TouchRipple>
          <Input
            lable="Max device count:"
            type="number"
            placeholder="disabled"
            disabled={maxDevices === undefined}
            onChanged={(value) =>
              maxDevices !== undefined &&
              maxDevices !== +value &&
              setMaxDevices(Math.max(Math.min(+value, 10), 1))
            }
            value={maxDevices || 0}
          />
        </div>
        <div
          style={{
            ...styles.propertyLine,
            backgroundColor: noStop === undefined ? 'grey' : 'white',
          }}
        >
          <TouchRipple
            style={{ ...styles.checkBock, backgroundColor: noStop === undefined ? 'green' : 'red' }}
            onClick={() => (noStop === undefined ? setNoStop(true) : setNoStop(undefined))}
          >
            {noStop === undefined ? '+' : '-'}
          </TouchRipple>
          <Typography variant="distance">No Stop</Typography>
        </div>
        <div
          style={{
            ...styles.propertyLine,
            backgroundColor: maxSpeed === undefined ? 'grey' : 'white',
          }}
        >
          <TouchRipple
            style={{
              ...styles.checkBock,
              backgroundColor: maxSpeed === undefined ? 'green' : 'red',
            }}
            onClick={() => (maxSpeed === undefined ? setMaxSpeed(100) : setMaxSpeed(undefined))}
          >
            {maxSpeed === undefined ? '+' : '-'}
          </TouchRipple>
          <Input
            lable="Max speed"
            type="number"
            placeholder="disabled"
            disabled={maxSpeed === undefined}
            onChanged={(value) =>
              maxSpeed !== undefined &&
              maxSpeed !== +value &&
              setMaxSpeed(Math.max(Math.min(+value, 100), 10))
            }
            value={maxSpeed || 0}
          />
          <Typography variant="distance">%</Typography>
        </div>
      </div>
      <div>
        <Typography variant="distance" color="#ff0000">
          {feedback}
        </Typography>
      </div>
      <div>
        {existingZones.map((z) => (
          <ZoneListEntry
            key={z.id}
            zone={z}
            onActivateZone={onActivateZone}
            onDeactivateZone={onDeactivateZone}
            onDeleteZone={onDeleteZone}
          />
        ))}
      </div>
    </>
  )
}
const styles: Record<string, React.CSSProperties> = {
  propertyLine: {
    display: 'inline-flex',
    padding: '5px 30px',
    placeItems: 'center',
  },
  checkBock: {
    width: 50,
    height: 50,
    borderRadius: '15%',
    boxShadow: 'inset darkgreen 0px 0px 10px',
    display: 'block',
    fontSize: '2em',
    fontWeight: 'bold',
    textAlign: 'center',
    verticalAlign: 'middle',
    lineHeight: '45px',
  },
}

// tslint:disable-next-line: no-object-mutation
ZoneControl.displayName = 'ZoneControl'

type ZoneListEntryProps = {
  zone: Zone
  onActivateZone: (zoneId: FishName) => void
  onDeactivateZone: (zoneId: FishName) => void
  onDeleteZone: (zoneId: FishName) => void
}

const ZoneListEntry = React.memo(
  ({ zone, onActivateZone, onDeactivateZone, onDeleteZone }: ZoneListEntryProps) => (
    <div key={zone.id} style={{ display: 'flex' }}>
      <div style={{ flex: '0 0 150px', alignSelf: 'center' }}>
        <Typography variant="standard">{zone.id}</Typography>
      </div>
      <div style={{ flex: '0 0 150px', alignSelf: 'center' }}>
        <Typography variant="standard">{zone.type}</Typography>
      </div>
      <div style={{ flex: '0 0 150px', alignSelf: 'center' }}>
        <Typography variant="standard">{propsToString(zone.properties)}</Typography>
      </div>
      <div
        style={{
          flex: '0 0 300px',
          display: 'inline-flex',
          alignSelf: 'center',
          textAlign: 'right',
        }}
      >
        {zone.type === 'inactive' && (
          <Button color="primary" onClick={() => onActivateZone(FishName.of(zone.id))}>
            activate
          </Button>
        )}
        {zone.type === 'active' && (
          <Button color="yellow" onClick={() => onDeactivateZone(FishName.of(zone.id))}>
            deactivate
          </Button>
        )}
        <Button
          color="red"
          icon="delete"
          style={{ marginLeft: 12 }}
          onClick={() => onDeleteZone(FishName.of(zone.id))}
        >
          delete
        </Button>
      </div>
    </div>
  ),
  (a, b) =>
    a.zone.id === b.zone.id &&
    a.zone.type === b.zone.type &&
    a.zone.properties === b.zone.properties,
)
// tslint:disable-next-line: no-object-mutation
ZoneListEntry.displayName = 'ZoneListEntry'
