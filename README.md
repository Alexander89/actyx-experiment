# Project structure

## 1. advanced use-case:

First use-case to validate if Actyx could fulfill the requirements from Bär-Automation.

There are many started but completed stuff in the project waiting for a continuation or a scrap. The main complexity is in the Admin-UI and the agvDriveOrder incl. Election process. The rest is straightforward to fulfill the minimum requirements.

## use-case

The shift leader creates production orders in the order system. The worker at the workstation can start a production order. This will automatically generate a material request. The horde of AGVs will start an election based on (for now) the distance to the destination. The winner of the election will execute the material request and drive to the required storage. Next, the worker at the storage will get a list of the required material on the tablet and put it on top of the AGV after acknowledging the task. The AGV will drive to the destination. The worker at the workstation will see the loaded material on his tablet and could unload the material or reject the delivery. In the case of a rejection, the material will be sent back to the storage, and the Storage worker gets the order on his tablet to unload the AGV again.

## Structure
- agv
  - driver to communicate with the AGV (MQTT)
  - election process for material requests to drive-orders
  - react to AGV state
  - read position of agv
- event emitter
  - test tool to create events for development proposes
- fish
  - adminUiFish  =  mapping for UI image to the global ref
  - agvFish  =  state of the agv
  - electionFish  =  Process to elect agv for next drive order
  - globalRefFish  =  Positions to map the stations to the agv (incomplete)
  - materialRequestFish  =  Material request, and lifecycle
  - productionOrderFish  =  Production order, and lifecycle
  - stationFish  =  position of a station + registry
  - zoneFish  =  contains all zone information + registry
- math
  - default vector stuff
  - Zone calculation/validation
  - translate coordinates
- mqttMockAgv
  - (probably broken after simple use-case changes)
- ui-common
  - reuseable UI components
- Admin
  - configure Use-case
- order-system
  - create production orders with required material
- storage
  - load and unload AGV
- workstation
  - create material-requests
  - receive/unload material
  - reject material


## 2. simple use-case:

This use-case was planed to be the minimal product a customer could need.

## use-case

A couple of workstations are spread over the shop floor. On each station, you can order an AGV and send him to another station if the AGV appears. It is so simple that a station could be a workstation, storage, parking place, or charging station. If an AGV arrives, the worker can send it to another station or release its duty. If it is released, any other workstation can call the AGV again.

***This is going to be the starting point for the upcoming feature requests from Bär-Automation***

## Structure

- simpleagv
  - driver to communicate with the AGV (MQTT)
  - react to AGV state and start / cancel drive-orders
- fish
  - simpleAgvFish  =  current state and drive order of the agv
  - simpleStationFish  =  Global station ID + current state of the Station
- mqttMockAgv
  - simulate moving AGV (line) and send arrived message
- ui-common
  - reuseable UI components
- kanbanstation
  - request AGV
  - send AGV
  - dismiss
