import { deepStrictEqual } from 'assert'
import { AgvMapTransform } from '../fish/agvFish'
import {
  transformAngel,
  transformInvAngel,
  transformInvPos,
  transformPos,
} from '../math/translateMap'
import { Quaternion, Vec } from '../math/vec2d'
import * as Msg from './agvProtocol'

export const xyzToVec2 = ({ x, y }: Msg.Pos3D): Vec => [x, y]
export const xyzwToQuat = ({ x, y, z, w }: Msg.RotateQuaternion): Quaternion => [x, y, z, w]

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
