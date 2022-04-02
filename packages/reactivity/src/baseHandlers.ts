import { isArray, isObject, isIntegerKey, hasOwn } from '@vue/shared'
import { reactive, Target } from './reactive'
import { TrackOpTypes, TriggerOpTypes } from './operations'
import { track, trigger } from './effect'

const get = /*#__PURE__*/ createGetter()
const set = /*#__PURE__*/ createSetter()
// 创建get拦截器
function createGetter(isReadonly = false, shallow = false) {
  return function get(target: Target, key: string | symbol, receiver: object) {
    console.log('触发了get操作')
    // 这里处理数组
    const targetIsArray = isArray(target)

    // 使用reflect进行代理映射
    const res = Reflect.get(target, key, receiver)
    // 依赖收集
    if (!isReadonly) {
      // todos...
      track(target, TrackOpTypes.GET, key)
    }
    // 因为是浅层，不需要深度，直接返回
    if (shallow) {
      return res
    }
    // 如果访问的是一个对象，返回的是包装后的对象，对其再次进行reactive包裹
    if (isObject(res)) {
      // return isReadonly ? readonly(res) : reactive(res)
      return reactive(res)
    }
    return res
  }
}
// 创建set拦截器
function createSetter(shallow = false) {
  return function set(
    target: object,
    key: string | symbol,
    value: unknown,
    receiver: object
  ) {
    // 这里先获取旧值
    let oldValue = (target as any)[key]
    console.log('拦截set操作', target, key, `${oldValue}===>${value}`)
    // 使用reflect进行代理映射
    const result = Reflect.set(target, key, value, receiver)
    // 在设置之后触发依赖更新
    // 首先判断当前设置的值是新增还是修改
    // 这里还要判断一下是数组还是对象
    const hadKey =
      isArray(target) && isIntegerKey(key)
        ? Number(key) < target.length
        : hasOwn(target, key)
    trigger(target, TriggerOpTypes.SET, key, value, oldValue)
    return result
  }
}
export const mutableHandlers: ProxyHandler<object> = {
  get,
  set
}
