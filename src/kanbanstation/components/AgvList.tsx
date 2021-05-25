import { Table, TableBody, TableHeader, TableRow, Typography } from '@actyx/industrial-ui'
import * as React from 'react'
import { Button } from '../../ui-common'
import { BodyCell, HeaderCell } from './tableContent'
import { AgvMetaData, isAgvState, State as SimpleAgvState } from '../../fish/simpleAgvFish'
import { SettingsDialog } from './SettingsDialog'

type Props = {
  availableAgvs: SimpleAgvState[]
  onEnable: (agvId: string) => void
  onDisable: (agvId: string) => void
  onSetConfig: (agvId: string, metadata: AgvMetaData) => void
}
export const AgvList = ({
  availableAgvs,
  onEnable,
  onDisable,
  onSetConfig,
}: Props): JSX.Element => {
  const [showSettings, setShowSettings] = React.useState<AgvMetaData | undefined>(undefined)
  return (
    <>
      {showSettings && (
        <SettingsDialog
          agv={showSettings}
          onClose={() => setShowSettings(undefined)}
          onSave={(settings) => {
            onSetConfig(showSettings.id, settings)
            setShowSettings(undefined)
          }}
        />
      )}
      <div style={{ marginBottom: 24 }}>
        <Typography variant="distance" textTransform="uppercase" bold>
          All Agvs
        </Typography>
      </div>
      <Table alternateColor>
        <TableHeader>
          <TableRow>
            <HeaderCell>Name</HeaderCell>
            <HeaderCell>Type</HeaderCell>
            <HeaderCell>State</HeaderCell>
            <HeaderCell>Docked Agv</HeaderCell>
            <HeaderCell>Action</HeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {availableAgvs.map((agv) => (
            <TableRow key={agv.id}>
              <BodyCell>{agv.id}</BodyCell>
              <BodyCell>{isAgvState.defined(agv) ? agv.agvType : ''}</BodyCell>
              <BodyCell>{agv.type}</BodyCell>
              <BodyCell>{isAgvState.docked(agv) ? agv.dockedAt : ''}</BodyCell>
              <BodyCell>
                {isAgvState.offline(agv) ? (
                  <div style={{ display: 'flex' }}>
                    <Button color="primary" onClick={() => setShowSettings(agv)}>
                      Settings
                    </Button>
                    <Button color="green" onClick={() => onEnable(agv.id)}>
                      Enable
                    </Button>
                  </div>
                ) : isAgvState.defined(agv) ? (
                  <div style={{ display: 'flex' }}>
                    <Button color="primary" onClick={() => setShowSettings(agv)}>
                      Settings
                    </Button>
                    <Button color="red" onClick={() => onDisable(agv.id)}>
                      Disable
                    </Button>
                  </div>
                ) : (
                  <div style={{ display: 'flex' }}>
                    <Button
                      color="green"
                      onClick={() =>
                        setShowSettings({
                          agvType: '',
                          id: agv.id,
                        })
                      }
                    >
                      Settings
                    </Button>
                  </div>
                )}
              </BodyCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}
