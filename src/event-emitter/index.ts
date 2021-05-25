import { Pond } from '@actyx/pond'
import { setupEveryThing } from '../admin/defaultSetup'
import { MaterialRequestFish, AgvFish, StationFish, MaterialRequestEventType } from '../fish'

const agv1Id = 'agv1'
const agv2Id = 'RoadRunner'
const station1Id = 'MyPC'
const station2Id = 'MyPC2'
//const mrId = 'd7a196d0-7150-48d3-b71e-c393d093b719'

Pond.default().then(async (pond) => {
  if (false) {
    setupEveryThing(pond)
  }

  pond.observe(AgvFish.of(agv1Id), console.log)
  pond.observe(AgvFish.of(agv2Id), console.log)
  pond.observe(MaterialRequestFish.registry(), console.log)
  pond.observe(StationFish.of(station1Id), console.log)
  pond.observe(StationFish.of(station2Id), console.log)

  MaterialRequestFish.emitPostableEvent(pond, {
    type: MaterialRequestEventType.arrivedOnDestination,
    destination: 'Workstation 1',
    id: '',
  })
  // pond.feed(GlobalRefFish, FishName.of('ref'))({
  //   type: GlobalRefCommandType.updateOrigin,
  //   pos: [0, 0],
  // }).toPromise()
  // pond.feed(GlobalRefFish, FishName.of('ref'))({
  //   type: GlobalRefCommandType.updateRef,
  //   pos: [0, 1],
  // }).toPromise()

  //AgvFish.emitStopAssignedMaterialRequest(pond, agv1Id, mrId)

  /*
  const agv1GlobTrans = createTransformData([0, 0], [0, 1], [0, 0], [0, 1])
  AgvFish.emitPostEvent(pond, {
    type: AgvEventType.mapTransformSet,
    id: agv1Id,
    transform: {
      rotateRad: agv1GlobTrans.rotate,
      scale: agv1GlobTrans.scaleFactor,
      translate: agv1GlobTrans.translate,
    },
    origin: [0, 0],
    reference: [0, 1],
  })
  */
  /*

  feedAgv1(
    {
      type: AgvCommandType.postEvent,
      event: {
        type: AgvEventType.driveOrderSet,
        order: {
          maxSpeed: 100,
          move: 'drive',
          station: FishName.of('MyPC')
        }
      }
    }
  ).toPromise()

  feedAgv1(
    {
      type: AgvCommandType.postEvent,
      event: {
        type: AgvEventType.materialRequestAssigned,
        materialRequest: mrId
      }
    }
  ).toPromise()
  */
  /*
 feedAgv1({
    type: AgvCommandType.postEvent,
    event: {
      type: AgvEventType.offlineChanged,
      offline: false,
    },
  }).toPromise()
  pond.feed(MaterialRequestFish, mrId)(
    {
      type: MaterialRequestCommandType.postEvent,
      event: {
        type: MaterialRequestEventType.agvArrivedOnCommissioning,
        pickUpCommissioningDest: 'Storage1'
      }
    }
  ).toPromise()
  */
  /*
  pond.feed(MaterialRequestFish, mrId)(
    {
      type: MaterialRequestCommandType.postEvent,
      event: {
        type: MaterialRequestEventType.unassigned,
        agvId: FishName.of('Storage1')
      }
    }
  ).toPromise()
  */
  /*
  pond.feed(MaterialRequestFish, mrId)(
    {
      type: MaterialRequestCommandType.postEvent,
      event: {
        type: MaterialRequestEventType.assigned,
        agvId: FishName.of('agv1')
      }
    }
  ).toPromise()
  feedAgv1(
    {
      type: AgvCommandType.postEvent,
      event: {
        type: AgvEventType.materialRequestAssigned,
        materialRequest: mrId
      }
    }
  ).toPromise()
  pond.feed(MaterialRequestFish, mrId)(
    {
      type: MaterialRequestCommandType.postEvent,
      event: {
        type: MaterialRequestEventType.assigned,
        agvId: 'Storage1'
      }
    }
  ).toPromise()

  */

  /*
  feedAgv1(
    {
      type: AgvCommandType.postEvent,
      event: {
        type: AgvEventType.stopped,
      }
    }
  ).toPromise()
  feedAgv1(
    {
      type: AgvCommandType.postEvent,
      event: {
        type: AgvEventType.positionUpdated,
        position: [1,2],
        rotation: 1.52,
        speed: 0
      }
    }
  ).toPromise()
  feedAgv1(
    {
      type: AgvCommandType.postEvent,
      event: {
        type: AgvEventType.metaDataUpdated,
        battery: 85,
        agvType: 'apollon'
      }
    }
  ).toPromise()
  */
})
