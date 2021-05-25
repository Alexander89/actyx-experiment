export type TimeStamp = {
  secs: number
  nsecs: number
}

export type GoToGoalMessage = {
  header: {
    stamp: TimeStamp
    frame_id: ''
    seq: 1
  }
  goal_id: {
    stamp: TimeStamp
    id: string
  }
  goal: {
    move_id: {
      data: number
    }
  }
}

export type ArrivedMessage = {
  result: {
    message: string
    success: boolean
  }
}

export type CancelMoveMessage = {
  stamp: TimeStamp
  id: string | undefined
}

// eslint-disable-next-line @typescript-eslint/ban-types
const hasProperty = <T extends object, K extends string>(
  obj: T,
  prop: K,
): obj is T & Record<K, unknown> => obj.hasOwnProperty(prop)

// eslint-disable-next-line @typescript-eslint/ban-types
const isObject = (obj: unknown): obj is object => typeof obj === 'object' && obj !== null
const isString = (v: unknown): v is string => typeof v === 'string'
const isBoolean = (v: unknown): v is boolean => typeof v === 'boolean'

// eslint-disable-next-line @typescript-eslint/ban-types
export const isArrivedMessage = (msg: unknown): msg is ArrivedMessage =>
  isObject(msg) &&
  hasProperty(msg, 'result') &&
  isObject(msg.result) &&
  hasProperty(msg.result, 'message') &&
  isString(msg.result.message) &&
  hasProperty(msg.result, 'success') &&
  isBoolean(msg.result.success)

export const mkDockToMessage = (move_id: string): GoToGoalMessage => ({
  header: {
    stamp: { secs: 0, nsecs: 0 },
    frame_id: '',
    seq: 1,
  },
  goal_id: {
    stamp: { secs: 0, nsecs: 0 },
    id: '',
  },
  goal: {
    move_id: { data: parseInt(move_id) },
  },
})
export const mkCancelMoveToMessage = (): CancelMoveMessage => ({
  stamp: {
    secs: 0,
    nsecs: 0,
  },
  id: '',
})
