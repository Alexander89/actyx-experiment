import { RxPond } from '@actyx-contrib/rx-pond'
import * as mqtt from 'mqtt'
import { Observable, interval } from 'rxjs'
import { filter, map, switchMap, tap, take } from 'rxjs/operators'
import {
  AgvEventType,
  AgvFish,
  GlobalRefFish,
  MaterialRequestEventType,
  MaterialRequestFish,
  AgvState,
  GlobalRefState,
  StationFish,
} from '../fish'
import * as V from '../math/vec2d'
import {
  AgvPipelineStateAndStation,
  isAgvActiveStateWithDriveOrder,
  isDefineAgvState,
  isSendOfDriveOrderRequired,
  isStationValid,
} from './agvDriver.util'
import * as Msg from './agvProtocol'
import { getTransFn, xyzToVec2, xyzwToQuat } from './util'

type MotionType = 'moving' | 'stopped' | 'unknown'

export type CurrentPosition = {
  orientationRad: number
  position: V.Vec
  speed: number
}

export type DriveInfo = Observable<CurrentPosition>

export const driver = (rxPond: RxPond, agvName: string): DriveInfo => {
  const pond = rxPond.originalPond
  return new Observable<CurrentPosition>((nextPos) => {
    console.log('driver started')

    /////////////////////////////////////////////////////////////////////
    // Global variables
    //
    /** last known state of the local AGV from the pond */
    let agvState: AgvState = {
      id: agvName,
      type: 'undefined',
    }
    /** global Reference calculate the relative coordinates of the destination */
    let globalRef: GlobalRefState = {
      origin: [0, 0],
      ref: [1, 0],
    }
    /** current position of the agv from the MQTT interface */
    let currentPosition: CurrentPosition = {
      orientationRad: 0,
      position: V.vec2(0, 0),
      speed: 0,
    }

    /** Ts of current position to messure the speed @todo use value from AGV */
    let tsCurrentPosition = Date.now()

    /////////////////////////////////////////////////////////////////////
    // setup mqtt connection
    //

    /** local mqtt connection to the local Broker */
    const client = mqtt.connect('mqtt://localhost')
    let errorCounter = 0
    client.on('connect', () => {
      errorCounter = 0
      console.log('MQTT connected')
      client.subscribe(['pose', 'docking_succeeded', 'odom'])
    })

    client.on('error', () => {
      errorCounter++
      if (errorCounter > 3 && agvState.type === 'moving') {
        console.error('AgvEventType.stopped lost connection')
        AgvFish.emitPostEvent(pond, {
          type: AgvEventType.stopped,
          id: agvName,
        })
      }
    })
    // update the globalRef, to the GlobalRefFish
    pond.observe(GlobalRefFish.global(), (s) => (globalRef = s))

    // update position 6 times per min
    interval(10000).subscribe(() =>
      AgvFish.emitUpdatePosition(
        pond,
        agvName,
        currentPosition.position,
        currentPosition.orientationRad,
        currentPosition.speed, // @TODO define speed
      ),
    )

    // handle drive orders and send drive command
    rxPond
      // get current AgvState
      .observe(AgvFish.of(agvName))
      .pipe(
        // ignore all agv undefined AGV states
        filter(isDefineAgvState),
        // add last state to pipeline to check if the driveOrder changed
        map((state) => ({ state, lastAgvState: agvState })),
        // store state to global var to use it in other dataFlows
        tap(({ state }) => (agvState = state)),
        // if there was a drive order and it is gone now, send the stop to the AGV via MQTT
        tap(({ state, lastAgvState }) => {
          if (
            state.driveOrder === undefined &&
            lastAgvState.type !== 'undefined' &&
            lastAgvState.driveOrder !== undefined
          ) {
            console.log('TODO: cancel goal_dock_on => cancel_dock_on')
            const msg = Msg.mkCancelMoveToMessage('')
            client.publish('cancel_dock_on', JSON.stringify(msg))
          }
        }),
        // just continue if the agv is active an has a drive order
        filter(isAgvActiveStateWithDriveOrder),
        // just continue if drive order has changed
        filter(isSendOfDriveOrderRequired),
        // add destination station to stream and drop the last state
        switchMap((s) =>
          rxPond
            .observe(StationFish.of(s.state.driveOrder.station))
            .pipe(map((stationState) => [s.state, stationState] as AgvPipelineStateAndStation)),
        ),
        // just continue if drive order has changed
        filter(isStationValid),
      )
      // send moveToMessage via MQTT to AGV
      .subscribe(([state, station]) => {
        console.log('start drive order', state.driveOrder)
        const [transform, transAngle] = getTransFn(state.mapTransform, globalRef.origin)
        const moveToMessage = Msg.mkMoveToMessage(
          transform(station.preDockPos),
          transAngle(station.preDockAngleRad),
          transform(station.dockPos),
          transAngle(station.dockAngleRad),
        )
        console.log('moveToMessage', moveToMessage)
        client.publish('goal_dock_on', JSON.stringify(moveToMessage))
      })

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // MQTT message handler
    //
    //////////////////////////////////////////////////////////////////////////////////////////////////////

    /** last motion state for de duplication and just post changes */
    let lastAgvMotionState: MotionType = 'unknown'

    /**
     * Twist package contains the movement vector
     *
     * feed AgvEventType.moveStarted or AgvEventType.stopped
     */
    const handleTwistPackage = (msg: Msg.TwistData) => {
      const twist = msg.twist
      const vec = xyzToVec2(twist.linear)
      const moving = V.vLength(vec) + twist.angular.z > 0
      if (lastAgvMotionState === 'unknown' || moving !== (lastAgvMotionState === 'moving')) {
        const newState = moving ? 'moving' : 'stopped'
        console.log('moving changed to:', moving, newState)
        lastAgvMotionState = newState

        setTimeout(() => {
          if (!newState && currentPosition.speed !== 0) {
            currentPosition.speed = 0
            nextPos.next(currentPosition)
          }
        }, 100)

        AgvFish.emitPostEvent(pond, {
          type: moving ? AgvEventType.moveStarted : AgvEventType.stopped,
          id: agvName,
        })
      }
    }

    /**
     * Handle the StatusCode.SUCCEEDED (3) from the AGV
     *
     * Removes the drive order first: feed: driveOrderRemoved
     *
     * According to the last state, the Material request is updated:
     * - assigned ==> agvArrivedOnCommissioning
     * - onDrive ==> arrivedOnDestination
     * - backToCommissioning ==> arrivedBackOnCommissioning
     * @todo add error handling
     */
    const handleStatusPackage = async (msg: Msg.StatusData) => {
      const status = msg.status
      console.log(status, agvState.type)

      if (
        (agvState.type === 'moving' || agvState.type === 'stopped') &&
        status === Msg.StatusCode.SUCCEEDED
      ) {
        // remove drive order when AGV arrived
        if (agvState.driveOrder) {
          const station = await rxPond
            .observe(StationFish.of(agvState.driveOrder.station))
            .pipe(take(1))
            .toPromise()

          if (station.type !== 'undefined') {
            // remove order when AGV is closer than 1 meter
            // const [transform] = getTransFn(agvState.mapTransform, globalRef.origin)
            // if (V.vLength(V.sub(currentPosition.position, transform(station.dockPos))) < 1) {
            AgvFish.emitPostEvent(pond, {
              type: AgvEventType.driveOrderRemoved,
              id: agvName,
            })
            // }
          }
        }

        // if AGV drive with a materialRequest, remove it
        console.log(agvState.materialRequest)
        if (agvState.materialRequest) {
          const mrState = await rxPond
            .observe(MaterialRequestFish.of(agvState.materialRequest))
            .pipe(take(1))
            .toPromise()
          if (mrState.type === 'active') {
            switch (mrState.currentStep) {
              case 'assigned':
                MaterialRequestFish.emitPostableEvent(pond, {
                  type: MaterialRequestEventType.agvArrivedOnCommissioning,
                  pickUpCommissioningDest: mrState.pickUpCommissioningDest,
                  id: agvState.materialRequest,
                })
                break
              case 'onDrive':
                MaterialRequestFish.emitPostableEvent(pond, {
                  type: MaterialRequestEventType.arrivedOnDestination,
                  destination: mrState.destination,
                  id: agvState.materialRequest,
                })
                break
              case 'backToCommissioning':
                MaterialRequestFish.emitPostableEvent(pond, {
                  type: MaterialRequestEventType.arrivedBackOnCommissioning,
                  commissioning: mrState.pickUpCommissioningDest,
                  id: agvState.materialRequest,
                })
                break
            }
          }
        }
      } else {
        console.log('other status: ', Msg.StatusCodeTrans[status])
      }
    }

    const handlePosePackage = (msg: Msg.PoseData) => {
      const pose = msg.pose
      const position = xyzToVec2(pose.position)

      const now = Date.now()
      const deltaT = (now - tsCurrentPosition) / 1000
      const distance = V.vLength(V.sub(position, currentPosition.position))
      const speed = distance / deltaT

      currentPosition = {
        orientationRad: V.quaternionToEuler(xyzwToQuat(pose.orientation))[2],
        position,
        speed,
      }
      tsCurrentPosition = now
      nextPos.next(currentPosition)
    }

    client.on('message', (_topic, payload) => {
      try {
        const data = JSON.parse(payload.toString())

        if (Msg.isStatusMessage(data)) {
          handleStatusPackage(data.status).catch(console.error)
        } else if (Msg.isTwistMessage(data)) {
          handleTwistPackage(data.twist)
        } else if (Msg.isPoseMessage(data)) {
          handlePosePackage(data)
        }
      } catch (e) {
        console.log('not so ideal:', e, payload.toString())
      }
    })
  })
}
