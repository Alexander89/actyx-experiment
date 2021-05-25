import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Pond } from '@actyx-contrib/react-pond'
import { App } from './App'
import { getSettings } from '../util'

const onError = () => {
  setTimeout(() => location.reload(), 2500)
}

const defaultSettings = {
  stationId: 'Station 1',
  goalId: '10',
}
const { stationId, goalId } = getSettings(defaultSettings)

ReactDOM.render(
  <React.StrictMode>
    <Pond loadComponent={<div>Connecting to ActyxOS</div>} onError={onError}>
      <App stationId={stationId} goalId={goalId} />
    </Pond>
  </React.StrictMode>,
  document.getElementById('root'),
)
