import { Client, SimpleLogger } from '@actyx/os-sdk'

const ax = Client()
const cs = ax.consoleService

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export let log: SimpleLogger = undefined

if (log === undefined) {
  const innerLog = cs.SimpleLogger({
    logName: 'de.agv-experiment',
    producerName: 'simpleAgv',
    producerVersion: '0.1.0',
  })
  log = {
    debug: (msg: string, additionalData?: unknown) => {
      additionalData ? console.debug(msg, additionalData) : console.debug(msg)
      innerLog.debug(msg, additionalData)
    },
    info: (msg: string, additionalData?: unknown) => {
      additionalData ? console.log(msg, additionalData) : console.log(msg)
      innerLog.info(msg, additionalData)
    },
    warn: (msg: string, additionalData?: unknown) => {
      additionalData ? console.warn(msg, additionalData) : console.warn(msg)
      innerLog.warn(msg, additionalData)
    },
    error: (msg: string, additionalData?: unknown) => {
      additionalData ? console.error(msg, additionalData) : console.error(msg)
      innerLog.error(msg, additionalData)
    },
  }
}
