import { Fish, FishId, PendingEmission, Pond, Reduce, Tag } from '@actyx/pond'

export const VOTE_ACCEPT = 10_000
export const VOTE_TIMEOUT = 15_000
export const VOTE_TIMEOUT_MICROS = VOTE_TIMEOUT * 1000
export const VOTE_FORCE_RELEASE = 5 * 60 * 1_000

/*
 * Fish State
 */
type Vote = {
  name: string
  distance: number
  localTimeStampMicros: number // , für timeout
}
type TimeoutElections = Array<{
  votes: ReadonlyArray<Vote>
  timeOutTimeStampMicros: number
}>

export type ElectionOpen = {
  state: 'open' | 'timeout'
  votes: Array<Vote>
  timeoutElections: TimeoutElections
}
export type ElectionElected = {
  state: 'elected'
  votes: ReadonlyArray<Vote>
  winner: string
  timeoutElections: TimeoutElections
}
export type Election = ElectionOpen | ElectionElected

export type State = Election

/**
 * Fish Events
 */

export enum EventType {
  timeoutRequested = 'timeoutRequested',
  voted = 'voted',
  accepted = 'accepted',
  forceRelease = 'forceRelease',
}
export type TimeoutRequestedEvent = {
  type: EventType.timeoutRequested
  id: string
}
export type VotedEvent = {
  type: EventType.voted
  id: string
  name: string
  distance: number
}
export type AcceptedEvent = {
  type: EventType.accepted
  id: string
  name: string
}
export type ForceReleaseEvent = {
  type: EventType.forceRelease
  id: string
  releaseWinner: string
  name: string
}
export type Event = VotedEvent | AcceptedEvent | TimeoutRequestedEvent | ForceReleaseEvent

export const onEvent: Reduce<State, Event> = (state, event, { timestampMicros }) => {
  switch (event.type) {
    case EventType.voted: {
      if (state.state === 'elected') {
        return state
      }

      // check if event.name already voted for this election
      if (state.votes.some((vote) => vote.name === event.name)) {
        return state
      }

      const newVote: Vote = {
        name: event.name,
        distance: event.distance,
        localTimeStampMicros: timestampMicros,
      }
      return {
        state: 'open',
        votes: [...state.votes, newVote].sort((a, b) => a.distance - b.distance),
        timeoutElections: state.timeoutElections,
      }
    }
    case EventType.accepted: {
      if (state.state !== 'open') {
        return state
      }

      // ignore when no running election or nobody vote
      if (state.votes.length === 0) {
        console.log('accept a empty Vote')
        return state
      }

      const winnerVote = state.votes[0]
      // ignore when the first vote is spooky
      if (!winnerVote || !winnerVote.name) {
        return state
      }

      // only accept if you win election
      if (winnerVote.name === event.name) {
        return {
          ...state,
          state: 'elected',
          winner: winnerVote.name,
        }
      }
      return state
    }
    case EventType.timeoutRequested: {
      const ownVote = [...state.votes]
        .sort((a, b) => a.localTimeStampMicros - b.localTimeStampMicros)
        .shift()
      if (
        state.state == 'open' &&
        ownVote &&
        ownVote.localTimeStampMicros + VOTE_TIMEOUT_MICROS < timestampMicros
      ) {
        state.timeoutElections.push({
          timeOutTimeStampMicros: timestampMicros,
          votes: state.votes,
        })
        return {
          ...state,
          state: 'timeout',
          votes: [],
        }
      }
      return state
    }
    case EventType.forceRelease: {
      if (state.state !== 'elected' || state.winner !== event.releaseWinner) {
        return state
      }

      state.timeoutElections.push({
        timeOutTimeStampMicros: timestampMicros,
        votes: state.votes,
      })
      return {
        ...state,
        state: 'timeout',
        votes: [],
      }
    }
  }
  return state
}

/**
 * Fish Commands
 */

const emitVote = (pond: Pond, id: string, name: string, distance: number): PendingEmission =>
  pond.emit(electionTag.withId(id), {
    type: EventType.voted,
    id,
    name,
    distance,
  })
const emitAccept = (pond: Pond, id: string, name: string): PendingEmission =>
  pond.emit(electionTag.withId(id), {
    type: EventType.accepted,
    id,
    name,
  })
const emitRequestTimeout = (pond: Pond, id: string): PendingEmission =>
  pond.emit(electionTag.withId(id), { type: EventType.timeoutRequested, id })

const electionTag = Tag<Event>('election')

export const ElectionFish = {
  tags: {},
  of: (id: string): Fish<State, Event> => ({
    fishId: FishId.of('ax.election', id, 0),
    initialState: {
      state: 'open',
      votes: [],
      timeoutElections: [],
    },
    where: electionTag.withId(id),
    onEvent,
  }),
  openElections: (): Fish<Record<string, boolean>, Event> => ({
    fishId: FishId.of('ax.election.open', 'openElections', 0),
    initialState: {},
    where: electionTag,
    onEvent: (state, _event) => {
      return state
    },
  }),
  voteFor: async (pond: Pond, id: string, name: string, distance: number): Promise<() => void> => {
    await emitVote(pond, id, name, distance).toPromise()
    let timeOutHandle: number | undefined = undefined
    const stop = pond.keepRunning(ElectionFish.of(id), (state) => {
      // request timeout
      if (timeOutHandle === undefined && state.state === 'open') {
        timeOutHandle = (setTimeout(() => {
          emitRequestTimeout(pond, id)
          timeOutHandle = undefined
        }, VOTE_TIMEOUT) as any) as number
      }
      if (timeOutHandle === undefined && state.state == 'elected') {
        clearTimeout(timeOutHandle)
        stop()
      }
    })
    let acceptTimeout: number | undefined = (setTimeout(() => {
      pond.run(ElectionFish.of(id), (state) => {
        if (state.state === 'open') {
          emitAccept(pond, id, name)
        }
      })
      acceptTimeout = undefined
    }, VOTE_ACCEPT) as any) as number

    return () => {
      stop()
      timeOutHandle && clearTimeout(timeOutHandle)
      acceptTimeout && clearTimeout(acceptTimeout)
    }
  },
  emitVote,
  emitAccept,
  emitRequestTimeout,
}
