import { RxPond } from '@actyx-contrib/rx-pond'
import { driver } from './agvDriver'
const defaultSettings = {
  deviceName: 'agv1',
  mqtt: 'mqtt://localhost',
  topics: {
    cancel: 'move_id_cancel',
    arrived: 'move_id_result',
    moveTo: 'move_id_goal',
  },
}

export type Settings = typeof defaultSettings

RxPond.default()
  .then((pond) => {
    try {
      const settings = JSON.parse(
        process.env.AX_APP_SETTINGS || JSON.stringify(defaultSettings),
      ) as Settings
      driver(pond, settings)
    } catch (e) {
      console.error('settings invalid')
    }
  })
  .catch(console.error)
