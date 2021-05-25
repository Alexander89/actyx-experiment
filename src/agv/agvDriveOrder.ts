import { RxPond } from '@actyx-contrib/rx-pond'
import { combineLatest, of } from 'rxjs'
import {
  map,
  filter,
  share,
  debounceTime,
  switchMap,
  distinctUntilChanged,
  tap,
} from 'rxjs/operators'
import { AgvFish, ElectionFish, MaterialRequestEventType, StationFish } from '../fish'
import { ElectionElected } from '../fish/electionFish'
import { ActiveState as MrActiveState, MaterialRequestFish } from '../fish/materialRequestFish'
import { vec2 } from '../math/vec2d'
import { observeRegistry } from '../util'
import { CurrentPosition, DriveInfo } from './agvDriver'
import {
  isActiveAgvStateWithMr,
  isDefineAgvState,
  isMrActiveState,
  MrAgvData,
  toMrAgvData,
} from './agvDriveOrder.util'

export const driveOrderSystem = (rxPond: RxPond, agvName: string, driveInfo: DriveInfo): void => {
  const pond = rxPond.originalPond
  /**
   * set currentPos globally to access it in the streams.
   *
   * The pos update will be triggered to frequently so it is not in the streams to reduce the load
   */
  let currentPos: CurrentPosition = {
    orientationRad: 0,
    position: vec2(0, 0),
    speed: 0,
  }
  driveInfo.subscribe((pos) => (currentPos = pos))

  /**
   * Agv State. undefined state is filtered out
   */
  const agvState$ = rxPond.observe(AgvFish.of(agvName)).pipe(filter(isDefineAgvState), share())

  /**
   * When the agv drive order is empty, the current material request, assigned to the agv is emitted
   */
  const currentAgvAssignedMatReq$ = agvState$.pipe(
    // just trigger the pipeline when the driveOrder change
    distinctUntilChanged(),
    // only react to state changes when the agv is active an has a material request
    filter(isActiveAgvStateWithMr),
    // continue only if the AGV do not have a drive order
    // when the MR is onDrive or backToCommissioning, he should have a drive order
    filter((agvState) => agvState.driveOrder === undefined),
    // just trigger the pipeline when the driveOrder change
    // distinctUntilChanged((a, b) => a.driveOrder === b.driveOrder),
    // switch to the state of the material request
    switchMap((agvState) => rxPond.observe(MaterialRequestFish.of(agvState.materialRequest))),
    // only continue if the material request is active
    filter(isMrActiveState),
  )

  // create drive orders when the assigned material request changed to onDrive
  // if currentStep === onDrive, drive to mrState.destination
  currentAgvAssignedMatReq$
    .pipe(
      // only trigger pipeline, if the value changed to avoid multiple emitExecuteMaterialRequest
      distinctUntilChanged((a, b) => a.id === b.id && a.currentStep === b.currentStep),
      // if currentStep === onDrive, drive to mrState.destination
      filter((mrState) => mrState.currentStep === 'onDrive'),
    )
    .subscribe((mrState) => {
      console.log('exec Mat Req onDrive', mrState)
      AgvFish.emitExecuteMaterialRequest(pond, agvName, mrState.id, mrState.destination)
    })

  // create drive orders when the assigned material request changed to backToCommissioning
  // if currentStep === backToCommissioning, drive to mrState.pickUpCommissioningDest
  currentAgvAssignedMatReq$
    .pipe(
      // only trigger pipeline, if the value changed to avoid multiple emitExecuteMaterialRequest
      distinctUntilChanged((a, b) => a.id === b.id && a.currentStep === b.currentStep),
      // if currentStep === backToCommissioning, drive to mrState.pickUpCommissioningDest
      filter((mrState) => mrState.currentStep === 'backToCommissioning'),
    )
    .subscribe((mrState) => {
      console.log('exec Mat Req backToCommissioning', mrState)
      AgvFish.emitExecuteMaterialRequest(pond, agvName, mrState.id, mrState.pickUpCommissioningDest)
    })

  /**
   * All material request which a not assigned to a agv
   */
  const unassignedMatReq$ = observeRegistry(
    rxPond,
    MaterialRequestFish.registry(),
    Object.keys,
    MaterialRequestFish.of,
  ).pipe(
    map((mrs) => mrs.filter(isMrActiveState).filter((mrState) => mrState.currentStep === 'idle')),
  )
  unassignedMatReq$.subscribe((s) => console.log('unassignedMatReq ', s.length))

  /**
   * enriched stream with the not assigned material requests, including some metadata
   */
  const unassignedMatReqWithElectionAndCoords$ = unassignedMatReq$.pipe(
    switchMap((mrs) =>
      mrs.length === 0
        ? of<MrAgvData[]>([])
        : combineLatest(
            mrs.map((mr) =>
              combineLatest([
                of(mr),
                rxPond.observe(ElectionFish.of(mr.id)),
                rxPond.observe(StationFish.of(mr.pickUpCommissioningDest)),
                rxPond.observe(StationFish.of(mr.destination)),
              ]).pipe(map(toMrAgvData(currentPos))),
            ),
          ),
    ),
    share(),
  )
  unassignedMatReqWithElectionAndCoords$.subscribe((s) =>
    console.log(
      'unassignedMatReqWithElectionAndCoords',
      s.map((i) => i.materialRequest.currentStep + ' ' + i.election.state),
    ),
  )

  /**
   * stream with the closest and not assigned material request to this AGV.
   *
   * closest to the pickupDist
   */
  const closestUnassignedMatReq$ = unassignedMatReqWithElectionAndCoords$.pipe(
    // reduce the array and just return the material request with the closest pickup station
    map((mrs) =>
      mrs.reduce<MrAgvData | undefined>(
        (acc, mr) => (acc === undefined || mr.pickupDist < acc.pickupDist ? mr : acc),
        undefined,
      ),
    ),
    // just trigger the pipeline when the material request change or the distance. (distance is required for the vote)
    distinctUntilChanged(
      (a, b) =>
        a !== b &&
        a !== undefined &&
        b !== undefined &&
        a.materialRequest.id === b.materialRequest.id &&
        a.pickupDist === b.pickupDist,
    ),
  )
  closestUnassignedMatReq$.subscribe((s) =>
    console.log('closestUnassignedMatReq ', s === undefined ? 'none' : s.materialRequest.id),
  )

  /**
   * all material request where the agv take part on the election to do the Job
   */
  const participatedElections$ = unassignedMatReq$.pipe(
    switchMap((mrs) =>
      combineLatest(
        mrs.map((mr) => combineLatest([of(mr), rxPond.observe(ElectionFish.of(mr.id))])),
      ).pipe(
        map((mrEls) =>
          mrEls.find(([_, election]) => election.votes.find((v) => v.name === agvName)),
        ),
      ),
    ),
    share(),
  )
  participatedElections$.subscribe((s) =>
    console.log('participatedElections', s && s[0].id + ' ' + s[1].state),
  )

  // When an election is won assign the agv to the election and execute the Material request
  const wonButNotAssignedElections$ = participatedElections$
    // only open material requests / participated elections who are completed and were the winner is the local agv
    .pipe(
      filter(
        (s): s is [MrActiveState, ElectionElected] =>
          s !== undefined &&
          s[0].currentStep === 'idle' &&
          s[1].state === 'elected' &&
          s[1].winner === agvName,
      ),
    )
  // wonButNotAssignedElections$.subscribe((s) => console.log('wonButNotAssignedElections', s))
  // assign AGV to MaterialRequest and execute material request with the AGV
  wonButNotAssignedElections$.subscribe(([mr]) => {
    console.log('wonButNotAssignedElections', mr.id)
    MaterialRequestFish.emitPostableEvent(pond, {
      type: MaterialRequestEventType.assigned,
      agvId: agvName,
      id: mr.id,
    })
    AgvFish.emitExecuteMaterialRequest(pond, agvName, mr.id, mr.pickUpCommissioningDest)
  })

  /// if he is ready for a task and do not take part in any election, The agv should vote to start the nearest Material Request
  combineLatest([
    // boolean stream if the agv is ready to do a new driveOrder
    agvState$.pipe(map((s) => s.type === 'stopped' && !s.driveOrder && !s.materialRequest)),
    // boolean stream if agv do not already participate in a election
    participatedElections$.pipe(
      map((el) => el === undefined),
      distinctUntilChanged(),
    ),
    // stream of the closest and unassigned material request
    closestUnassignedMatReq$,
  ])
    .pipe(
      tap(([waitForDriveOrder, notInElection, mr]) =>
        console.log('agv state', waitForDriveOrder, notInElection, mr?.election.state),
      ),
      // debounce for 0.5 secondes to debounce the fish
      debounceTime(500),
      // just trigger the vote, it the agv waitForDriveOrder and is notInElection
      filter(([waitForDriveOrder, notInElection]) => waitForDriveOrder && notInElection),
      // drop the rest and keep the closestUnassignedMatReq
      map(([, , closestUnassignedMatReq]) => closestUnassignedMatReq),
    )
    .subscribe((mrAgvData) => {
      console.log('vote for ', mrAgvData && mrAgvData.materialRequest.id)
      // vote for materialRequest
      mrAgvData &&
        ElectionFish.voteFor(pond, mrAgvData.materialRequest.id, agvName, mrAgvData.pickupDist)
    })

  // always have a eye one the election to unassign when the election is lost later
  agvState$
    .pipe(
      filter(isActiveAgvStateWithMr),
      // get the state of the ElectionFish
      switchMap((agvState) =>
        rxPond
          .observe(ElectionFish.of(agvState.materialRequest))
          // use map to keep the agvState in the pipeline
          .pipe(map((election) => ({ agvState, election }))),
      ),
      // if the agv is not any longer the winner of the election, unassign the MR
      filter(({ election }) => election.state !== 'elected' || election.winner !== agvName),
    )
    .subscribe(({ agvState, election }) => {
      console.log(
        'Eventual consistency case, that two dev won the collection and one has to stop it in the run',
        agvState,
        election,
      )
      AgvFish.emitStopAssignedMaterialRequest(pond, agvName, agvState.materialRequest)
    })

  // if the assigned MR is done. stop the assigned MR for the Agv too
  agvState$
    .pipe(
      // only react to state changes when the agv is active an has a material request
      filter(isActiveAgvStateWithMr),
      // switch to the state of the material request
      switchMap((state) => rxPond.observe(MaterialRequestFish.of(state.materialRequest))),
      // just react when the material request is done
      filter((mrState) => mrState.type === 'done'),
      // when the material request is done, stop the assigned material request on the agv.
      // @TODO probably the agv can be send to a parking position here
    )
    .subscribe((mrState) => {
      MaterialRequestFish.emitPostableEvent(pond, {
        type: MaterialRequestEventType.unassigned,
        id: mrState.id,
        agvId: agvName,
      })
      AgvFish.emitStopAssignedMaterialRequest(pond, agvName, mrState.id)
    })
}
