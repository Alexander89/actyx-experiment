import { RxPond } from '@actyx-contrib/rx-pond'
import { driveOrderSystem } from './agvDriveOrder'
import { driver } from './agvDriver'

export { DriveInfo, CurrentPosition } from './agvDriver'

RxPond.default()
  .then((pond) => {
    try {
      const { deviceName: agvName } = JSON.parse(
        process.env.AX_APP_SETTINGS || '{"deviceName": "agv1"}',
      )

      const driveInfo = driver(pond, agvName)
      driveOrderSystem(pond, agvName, driveInfo)
    } catch (e) {
      console.error('settings invalid')
    }
  })
  .catch(console.error)
