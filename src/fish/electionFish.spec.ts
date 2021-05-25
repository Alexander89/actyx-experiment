import { Metadata } from '@actyx/pond/lib/types'
import {
  AcceptedEvent,
  ElectionFish,
  EventType,
  TimeoutRequestedEvent,
  VotedEvent,
  Event,
  VOTE_TIMEOUT,
  State,
  ForceReleaseEvent,
  VOTE_FORCE_RELEASE,
} from '../fish/electionFish'

const mkMetaData = (sourceId: string) => (timestamp: number, lamport: number): Metadata => ({
  isLocalEvent: false,
  tags: ['tags'],
  timestampMicros: timestamp * 1000,
  timestampAsDate: () => new Date(timestamp),
  lamport: 0,
  eventId: String(lamport).padStart(10000, '0') + '/' + sourceId,
})

const mkVote = (name: string, distance: number): VotedEvent => ({
  type: EventType.voted,
  id: 'elId',
  name,
  distance,
})
const mkAccept = (name: string): AcceptedEvent => ({
  type: EventType.accepted,
  id: 'elId',
  name,
})
const mkTimeOut = (): TimeoutRequestedEvent => ({
  type: EventType.timeoutRequested,
  id: 'elId',
})
const mkForceRelease = (name: string, releaseWinner: string): ForceReleaseEvent => ({
  type: EventType.forceRelease,
  id: 'elId',
  name,
  releaseWinner,
})
const { onEvent: onEventRaw, initialState } = ElectionFish.of('elId')
const onEvent = (p: State, [e, meta]: [Event, Metadata]) => onEventRaw(p, e, meta)

type EventList = [Event, Metadata][]
const nodeA = mkMetaData('A')
const nodeB = mkMetaData('B')
const nodeC = mkMetaData('C')

describe('dev', () => {
  describe('ElectionFish', () => {
    it('Simple accept Test', () => {
      const events: EventList = [
        [mkVote('B', 15), nodeB(5, 1)],
        [mkVote('C', 20), nodeC(6, 2)],
        [mkVote('A', 10), nodeA(1, 0)],
        [mkAccept('B'), nodeB(7, 3)],
        [mkAccept('C'), nodeC(8, 4)],
        [mkAccept('A'), nodeA(10, 6)],
      ]
      const state = events.reduce(onEvent, initialState)
      expect(state.state).toBe('elected')
      if (state.state === 'elected') {
        expect(state.winner).toBe('A')
        expect(state.votes).toHaveLength(3)
      }
    })
    it('Simple timeout Test', () => {
      const events: EventList = [
        [mkVote('B', 15), nodeB(5, 1)],
        [mkVote('C', 20), nodeC(6, 2)],
        [mkVote('A', 10), nodeA(1, 0)],
        [mkAccept('B'), nodeB(7, 3)],
        [mkAccept('C'), nodeC(8, 4)],

        [mkTimeOut(), nodeC(VOTE_TIMEOUT + 100, 4)],
        [mkVote('B', 15), nodeA(VOTE_TIMEOUT + 101, 0)],
        [mkTimeOut(), nodeC(VOTE_TIMEOUT + 101, 4)],
        [mkVote('C', 20), nodeC(VOTE_TIMEOUT + 102, 2)],
        [mkAccept('A'), nodeA(VOTE_TIMEOUT + 105, 6)], // invalid old accept, after Timeout
        [mkAccept('B'), nodeB(VOTE_TIMEOUT + 106, 3)],
      ]
      const state = events.reduce(onEvent, initialState)
      expect(state.state).toBe('elected')
      if (state.state === 'elected') {
        expect(state.winner).toBe('B')
        expect(state.votes).toHaveLength(2)
      }
    })
    it('eventual consistent fixed none timeout case', () => {
      const events: EventList = [
        [mkVote('B', 15), nodeB(5, 1)],
        [mkVote('C', 20), nodeC(6, 2)],
        [mkVote('A', 10), nodeA(1, 0)],
        [mkAccept('B'), nodeB(7, 3)],
        [mkAccept('C'), nodeC(8, 4)],
        [mkAccept('A'), nodeA(11, 6)],

        [mkTimeOut(), nodeC(VOTE_TIMEOUT + 100, 4)],
        [mkVote('B', 10), nodeA(VOTE_TIMEOUT + 101, 0)],
        [mkAccept('B'), nodeB(VOTE_TIMEOUT + 102, 3)],
      ]
      const state = events.reduce(onEvent, initialState)
      expect(state.state).toBe('elected')
      if (state.state === 'elected') {
        expect(state.winner).toBe('A')
        expect(state.votes).toHaveLength(3)
      }
    })
    it('force Release', () => {
      const eventsSetA: EventList = [
        [mkVote('B', 15), nodeB(2, 1)],
        [mkVote('A', 20), nodeA(5, 1)],
        [mkAccept('B'), nodeB(7, 3)],
      ]
      const eventsSetB: EventList = [
        [mkForceRelease('A', 'B'), nodeA(VOTE_FORCE_RELEASE + 100, 1)],

        [mkVote('A', 20), nodeA(VOTE_FORCE_RELEASE + 101, 1)],
        [mkAccept('A'), nodeA(VOTE_FORCE_RELEASE + 110, 6)],
      ]
      const stateA = eventsSetA.reduce(onEvent, initialState)
      expect(stateA.state).toBe('elected')
      if (stateA.state === 'elected') {
        expect(stateA.winner).toBe('B')
        expect(stateA.votes).toHaveLength(2)
      }
      const stateB = eventsSetB.reduce(onEvent, stateA)
      expect(stateB.state).toBe('elected')
      if (stateB.state === 'elected') {
        expect(stateB.winner).toBe('A')
        expect(stateB.votes).toHaveLength(1)
      }
    })
  })
})
