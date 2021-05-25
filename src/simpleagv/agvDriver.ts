import { RxPond } from '@actyx-contrib/rx-pond'
import * as mqtt from 'mqtt'
import { combineLatest, of } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
import { Settings } from '.'
import { SimpleStationFish } from '../fish/simpleStationFish'
import { State as SimpleAgvState, SimpleAgvFish } from '../fish/simpleAgvFish'
import * as Msg from './agvProtocol'
import { log } from './logger'

export const driver = (rxPond: RxPond, settings: Settings): void => {
  const pond = rxPond.originalPond
  log.info('driver started')

  log.info('settings', settings)
  const { deviceName: agvName, mqtt: mqttUrl, topics } = settings

  SimpleAgvFish.emitAvailable(pond, agvName)
  log.info('Available message send', agvName)

  /////////////////////////////////////////////////////////////////////
  // Global variables
  //
  /** last known state of the local AGV from the pond */
  let agvState: SimpleAgvState = {
    id: agvName,
    type: 'undefined',
  }

  let stations: Record<string, string> = {}

  /////////////////////////////////////////////////////////////////////
  // setup mqtt connection
  //

  /** local mqtt connection to the local Broker */
  const client = mqtt.connect(mqttUrl)
  let errorCounter = 0
  client.on('connect', () => {
    errorCounter = 0
    log.info('MQTT connected')
    client.subscribe([topics.arrived])
  })

  client.on('error', () => {
    errorCounter++
    if (errorCounter > 3) {
      log.error('lost connection mqtt connection')
    }
  })

  rxPond
    .observe(SimpleStationFish.availableStations())
    .pipe(
      map(Object.keys),
      switchMap((stations) =>
        stations.length
          ? combineLatest(stations.map((id) => rxPond.observe(SimpleStationFish.of(id))))
          : of([]),
      ),
      map((stations) =>
        stations
          .map((station) => ({ [station.id]: station.goalId }))
          .reduce<Record<string, string>>((acc, e) => ({ ...acc, ...e }), {}),
      ),
    )
    .subscribe((list) => (stations = list))

  // handle drive orders and send drive command
  // get current AgvState
  pond.keepRunning(SimpleAgvFish.of(agvName), async (state, enq) => {
    agvState = state
    log.debug('currentState', state)
    if (state.type === 'undefined') {
      log.warn('configuration missing', state)
    }
    if (state.type === 'requestForDrive') {
      const to = stations[state.to]
      if (to === undefined) {
        log.error('navigate to unknown')
      } else {
        SimpleAgvFish.emitLeft(enq, state.id, state.from)
        SimpleAgvFish.emitMovementStarted(enq, state.id, state.from, state.to)

        const moveToMessage = Msg.mkDockToMessage(to)
        log.info('send dock To Message', moveToMessage)
        client.publish(topics.moveTo, JSON.stringify(moveToMessage))
      }
    }

    if (state.type === 'offline') {
      const msg = Msg.mkCancelMoveToMessage()
      log.info('send cancel Message', msg)
      client.publish(topics.cancel, JSON.stringify(msg))
    }
  })

  //////////////////////////////////////////////////////////////////////////////////////////////////////
  //
  // MQTT message handler
  //
  //////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Handle the StatusCode.SUCCEEDED (3) from the AGV
   *
   * @todo add error handling
   */
  const handleStatusPackage = ({ result }: Msg.ArrivedMessage) => {
    log.info('handleStatusPackage', { result, state: agvState })

    if (result.success) {
      if (agvState.type === 'driving' || agvState.type === 'requestForDrive') {
        // if AGV drive with a materialRequest, remove it
        const { from, to } = agvState
        log.info('finish drive / arrived', { state: agvState.type, from, to })
        SimpleAgvFish.emitArrived(pond, agvName, to)
      } else {
        log.warn('arrived somewhere but agv not in driving', {
          status: result.message,
          agv: agvState,
        })
      }
    } else {
      log.info('other status: ', result)
    }
  }

  client.on('message', (_topic, payload) => {
    try {
      const data = JSON.parse(payload.toString())
      if (Msg.isArrivedMessage(data)) {
        handleStatusPackage(data)
      }
    } catch (e) {
      log.error('failed to parse message', { error: e, message: payload.toString() })
    }
  })
}
