import { isObject } from '@vue/shared'
import { mutableHandlers } from './baseHandlers'
export const enum ReactiveFlags {
  SKIP = '__v_skip',
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
  IS_SHALLOW = '__v_isShallow',
  RAW = '__v_raw'
}

export interface Target {
  [ReactiveFlags.SKIP]?: boolean
  [ReactiveFlags.IS_REACTIVE]?: boolean
  [ReactiveFlags.IS_READONLY]?: boolean
  [ReactiveFlags.IS_SHALLOW]?: boolean
  [ReactiveFlags.RAW]?: any
}

export const reactiveMap = new WeakMap<Target, any>()
export const shallowReactiveMap = new WeakMap<Target, any>()
export const readonlyMap = new WeakMap<Target, any>()
export const shallowReadonlyMap = new WeakMap<Target, any>()
/**
 * @description: reactive 内部吐出的对象
 * @param {object} target 需要被劫持对象
 * @return {boolean} isReadonly 是否是只读
 * @return {ProxyHandler} baseHandlers 访问器属性
 * @return {ProxyHandler} ProxyHandler 访问器属性
 * @return {WeakMap} proxyMap 依赖对象
 */
function createReativeObject(
  target: Target,
  isReadonly: Boolean,
  baseHandlers: ProxyHandler<any>,
  // collectionHandlers: ProxyHandler<any>,
  proxyMap: WeakMap<Target, any>
) {
  // 边界判断，是否是一个对象，如果不是开发环境报错
  if (!isObject(target)) {
    if (__DEV__) {
      console.warn(`value cannot be made reactive: ${String(target)}`)
    }
    return target
  }
  // 这里创建一个proxy
  const proxy = new Proxy(target, baseHandlers)
  proxyMap.set(target, proxy)
  return proxy
}

// 导出reactive函数
export function reactive(target: Object) {
  return createReativeObject(
    target,
    false,
    mutableHandlers,
    // mutablecollectionHandlers,
    reactiveMap
  )
}
