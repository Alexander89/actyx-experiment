export type TimeStamp = {
  secs: number
  nsecs: number
}

export type IncomingHeader = {
  header: {
    stamp: TimeStamp
    frame_id: string
    seq: number
  }
}

export type Result = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  result: {}
}
export type CommandHeader = {
  header: {
    frame_id: 'map' | ''
  }
}

export type PoseData = {
  pose: {
    position: Pos3D
    orientation: RotateQuaternion
  }
  covariance: [number]
}

export type TwistData = {
  twist: {
    linear: Pos3D
    angular: RotateEuler
  }
  covariance: [number]
}

export type StatusData = {
  status: StatusCode
  text: string
  goal_id: {
    stamp: TimeStamp
    id: string
  }
}

export type IncomingPoseMessage = PoseData & IncomingHeader

export type IncomingTwistMessage = {
  twist: TwistData
} & PoseData &
  IncomingHeader

export type IncomingStatusMessage = {
  status: StatusData
} & IncomingHeader &
  Result

export type IncomingMessage = IncomingPoseMessage | IncomingStatusMessage | IncomingTwistMessage

export type GoalPoseMessage = {
  goal_id?: {
    stamp: TimeStamp
    id: string
  }
  goal: {
    dock_goal: {
      header?: CommandHeader
      pose: PosAngle
      dock_pose: PosAngle
    }
  }
} & CommandHeader
export type CancelMoveMessage = {
  stamp: TimeStamp
  id: string | undefined
}

export type CommandMessage = GoalPoseMessage | CancelMoveMessage

const ownProperty = (obj: Record<string, unknown>, prop: string) =>
  Object.getOwnPropertyNames(obj).includes(prop)

export const isPoseMessage = (msg: IncomingMessage): msg is IncomingPoseMessage =>
  ownProperty(msg, 'pose')

export const isTwistMessage = (msg: IncomingMessage): msg is IncomingTwistMessage =>
  ownProperty(msg, 'twist')

export const isStatusMessage = (msg: IncomingMessage): msg is IncomingStatusMessage =>
  ownProperty(msg, 'status')

type Vec = [number, number]
export const mkMoveToMessage = (
  preDockPos: Vec,
  preDockAngleRad: number,
  dockPos: Vec,
  dockAngleRad: number,
): GoalPoseMessage => ({
  header: {
    frame_id: 'map',
  },
  goal: {
    dock_goal: {
      pose: {
        x: preDockPos[0],
        y: preDockPos[1],
        theta: preDockAngleRad,
      },
      dock_pose: {
        x: dockPos[0],
        y: dockPos[1],
        theta: dockAngleRad,
      },
    },
  },
})
export const mkCancelMoveToMessage = (id: string): CancelMoveMessage => ({
  id,
  stamp: {
    secs: 0,
    nsecs: 0,
  },
})
export enum StatusCode {
  PENDING = 0,
  ACTIVE = 1,
  PREEMPTED = 2,
  SUCCEEDED = 3,
  ABORTED = 4,
  REJECTED = 5,
  PREEMPTING = 6,
  RECALLING = 7,
  RECALLED = 8,
  LOST = 9,
}
export const StatusCodeTrans: Record<StatusCode, string> = {
  [StatusCode.PENDING]: 'PENDING',
  [StatusCode.ACTIVE]: 'ACTIVE',
  [StatusCode.PREEMPTED]: 'PREEMPTED',
  [StatusCode.SUCCEEDED]: 'SUCCEEDED',
  [StatusCode.ABORTED]: 'ABORTED',
  [StatusCode.REJECTED]: 'REJECTED',
  [StatusCode.PREEMPTING]: 'PREEMPTING',
  [StatusCode.RECALLING]: 'RECALLING',
  [StatusCode.RECALLED]: 'RECALLED',
  [StatusCode.LOST]: 'LOST',
}
export type Pos3D = {
  x: number
  y: number
  z: number
}

export type PosAngle = {
  x: number
  y: number
  theta: number
}

export type RotateEuler = {
  x: number
  y: number
  z: number
}
export type RotateQuaternion = {
  x: number
  y: number
  z: number
  w: number
}
