import aedes from 'aedes'
import { createServer } from 'net'
import { interval } from 'rxjs'
import { takeWhile, tap } from 'rxjs/operators'
import {
  GoalPoseMessage,
  IncomingMessage,
  IncomingPoseMessage,
  IncomingStatusMessage,
  IncomingTwistMessage,
  PoseData,
  StatusCode,
} from '../agv/agvProtocol'
import { add, eq, radToQuaternion, scale, sub, vec2, vLength } from '../math/vec2d'
import { ArrivedMessage } from '../simpleagv/agvProtocol'

const mqttServer = aedes()
const server = createServer(mqttServer.handle)
const port = 1883

server.listen(port, () => {
  console.log('server started and listening on port ', port)
})

let curPos = vec2(0, 0)
mqttServer.subscribe(
  'goal_dock_on',
  (msg, _) => {
    try {
      const cmd = JSON.parse(msg.payload.toString()) as GoalPoseMessage
      const { x, y } = cmd.goal.dock_goal.dock_pose
      const dest = vec2(x, y)
      if (eq(curPos, dest)) {
        execCmd('arrived')
      } else {
        const move = sub(dest, curPos)
        const lng = vLength(move)

        const driveTime = lng / 0.9 // 0.5 m/ms
        const driveTimeMs = driveTime * 1000 // 0.5 m/ms

        const sec = Math.floor(driveTime) - 1
        const movePerSec = scale(move, 1 / sec)
        const radians = -Math.atan2(move[0], move[1])
        interval(500)
          .pipe(
            takeWhile((i) => i < sec),
            tap((i) => {
              const moveToNow = add(curPos, scale(movePerSec, i))
              execCmd('pos', [`${moveToNow[0]}`, `${moveToNow[1]}`, `${radians}`])
            }),
          )
          .subscribe({
            complete: () => (curPos = dest),
          })
        setTimeout(() => execCmd('drive'), 1)
        setTimeout(() => execCmd('stop'), driveTimeMs)
        setTimeout(() => execCmd('arrived'), driveTimeMs + 500)
      }
    } catch (e) {
      console.error(e)
    }
  },
  () => undefined,
)
let driveV2Timer: NodeJS.Timeout | undefined = undefined
mqttServer.subscribe(
  'move_id_goal',
  (_msg, _) => {
    try {
      driveV2Timer = setTimeout(() => {
        driveV2Timer = undefined
        execCmd('arrivedV2')
      }, 5000)
    } catch (e) {
      console.error(e)
    }
  },
  () => undefined,
)
mqttServer.subscribe(
  'move_id_cancel',
  (_msg, _) => {
    try {
      if (driveV2Timer) {
        clearTimeout(driveV2Timer)
      }
    } catch (e) {
      console.error(e)
    }
  },
  () => undefined,
)

const publishMsg = <T extends IncomingMessage>(data: T) => {
  mqttServer.publish(
    {
      cmd: 'publish',
      topic: 'pose',
      dup: false,
      qos: 2,
      retain: false,
      payload: JSON.stringify(data),
    },
    console.error,
  )
}
const publishArrivedMsg = (data: ArrivedMessage) => {
  mqttServer.publish(
    {
      cmd: 'publish',
      topic: 'move_id_result',
      dup: false,
      qos: 2,
      retain: false,
      payload: JSON.stringify(data),
    },
    console.error,
  )
}

const stamp = { nsecs: 0, secs: 0 }
const header = { frame_id: '', stamp, seq: 0 }
const poseFn = (x: number, y: number, zRad = 0): PoseData => {
  const [orX, orY, z, w] = radToQuaternion(0, 0, zRad)
  return {
    pose: {
      orientation: { x: orX, y: orY, z, w },
      position: { x, y, z: 0 },
    },
    covariance: [0],
  }
}

process.stdin.on('data', (data) => {
  const input = data.toString().trim()
  const [cmd, ...props] = input.split(' ')
  execCmd(cmd, props)
})

const execCmd = (cmd: string, props: ReadonlyArray<string> = []) => {
  const pose =
    props.length === 3
      ? poseFn(+props[0], +props[1], +props[2])
      : props.length === 2
      ? poseFn(+props[0], +props[1])
      : poseFn(curPos[0], curPos[1])
  switch (cmd) {
    case 'drive': {
      publishMsg<IncomingTwistMessage>({
        header,
        ...pose,
        twist: {
          covariance: [0],
          twist: {
            angular: { x: 0, y: 0, z: Math.PI },
            linear: { x: 1, y: 0, z: 0 },
          },
        },
      })
      break
    }
    case 'stop': {
      publishMsg<IncomingTwistMessage>({
        header,
        ...pose,
        twist: {
          covariance: [0],
          twist: {
            angular: { x: 0, y: 0, z: 0 },
            linear: { x: 0, y: 0, z: 0 },
          },
        },
      })
      break
    }
    case 'pos': {
      publishMsg<IncomingPoseMessage>({
        header,
        ...pose,
      })
      break
    }
    case 'arrived': {
      publishMsg<IncomingStatusMessage>({
        header,
        result: {},
        status: {
          goal_id: { id: 'abc', stamp },
          status: StatusCode.SUCCEEDED,
          text: 'arrived',
        },
      })
      break
    }
    case 'arrivedV2': {
      publishArrivedMsg({
        result: {
          message: "Wuhu, I'm here",
          success: true,
        },
      })
      break
    }
    case 'f': {
      setTimeout(() => execCmd('drive'), 10)
      setTimeout(() => execCmd('arrived'), 500)
      setTimeout(() => execCmd('stop'), 1000)
      break
    }
    default:
      console.log('drive, stop, pos, arrived')
  }
}
