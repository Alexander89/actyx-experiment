import { deepStrictEqual } from 'assert'
import { AgvMapTransform } from '../fish/agvFish'
import {
  transformAngel,
  transformInvAngel,
  transformInvPos,
  transformPos,
} from '../math/translateMap'
import { Vec } from '../math/vec2d'

type TransFns = [(pos: Vec) => Vec, (rad: number) => number]
export const getTransFn = (agvMapTrans: AgvMapTransform, globalOrigin: Vec): TransFns => {
  const transformData = {
    translate: agvMapTrans.translate,
    rotate: agvMapTrans.rotateRad,
    scaleFactor: agvMapTrans.scale,
  }
  return [transformPos(globalOrigin, transformData), transformAngel(transformData)]
}
export const getTransInvFn = (agvMapTrans: AgvMapTransform, globalOrigin: Vec): TransFns => {
  const transformData = {
    translate: agvMapTrans.translate,
    rotate: agvMapTrans.rotateRad,
    scaleFactor: agvMapTrans.scale,
  }
  return [transformInvPos(globalOrigin, transformData), transformInvAngel(transformData)]
}

export const deepEq = <T>(a: T, b: T): boolean => {
  try {
    deepStrictEqual(a, b)
    return true
  } catch (_) {
    return false
  }
}
