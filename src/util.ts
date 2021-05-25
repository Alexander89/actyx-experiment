/* eslint-disable @typescript-eslint/no-explicit-any */
import { RxPond } from '@actyx-contrib/rx-pond'
import { Fish } from '@actyx/pond'
import { Observable, combineLatest, of } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

export const pickRandom = <S>(input: Array<S>): S => input[Math.floor(Math.random() * input.length)]
export const isUpperCase = (input: string): boolean => input.toUpperCase() === input
export const fromCamelCase = (input: string): string => {
  let out = ''
  for (let i = 0; i < input.length; i++) {
    const letter = input[i]
    if (i === 0) {
      out += letter.toUpperCase()
    } else if (isUpperCase(letter)) {
      out += ' ' + letter.toLowerCase()
    } else {
      out += letter
    }
  }
  return out
}

export const getSettings = <S>(settings: S): S => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (typeof ax === 'undefined') {
    return settings
  } else {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return JSON.parse(ax.appSettings()) as S
    } catch (e) {
      console.error('can not parse Settings', e)
      return settings
    }
  }
}

type PondObserve =
  | {
      observe: RxPond['observe']
    }
  | RxPond['observe']

const obs = (pond: PondObserve): RxPond['observe'] =>
  typeof pond === 'function' ? pond : pond.observe

export const observeRegistry = <RegS, P, S>(
  pond: PondObserve,
  registryFish: Fish<RegS, any>,
  mapFn: (state: RegS) => ReadonlyArray<P>,
  entityFish: (prop: P) => Fish<S, any>,
): Observable<ReadonlyArray<S>> =>
  obs(pond)(registryFish).pipe(
    map(mapFn),
    switchMap((names) =>
      names.length === 0
        ? of<ReadonlyArray<S>>()
        : combineLatest(names.map((name) => obs(pond)(entityFish(name)))),
    ),
  )
