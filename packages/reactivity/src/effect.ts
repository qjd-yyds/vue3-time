import { isArray, isIntegerKey, isMap, extend } from '@vue/shared'
import { TrackOpTypes, TriggerOpTypes } from './operations'
import { createDep } from './dep'
import type { Dep } from './dep'

type KeyToDepMap = Map<any, Dep>

export type EffectScheduler = (...args: any[]) => any

export type DebuggerEventExtraInfo = {
  target: object
  type: TrackOpTypes | TriggerOpTypes
  key: any
  newValue?: any
  oldValue?: any
  oldTarget?: Map<any, any> | Set<any>
}

// 依赖数据集合target==>key==>Dep
const targetMap = new WeakMap<any, KeyToDepMap>()

// 当前激活的副作用
export let activeEffect: ReactiveEffect | undefined

// 是否可以收集
export let shouldTrack = true

export class ReactiveEffect<T = any> {
  active = true
  deps: Dep[] = [] // 依赖列表
  parent: ReactiveEffect | undefined = undefined // 上一级
  /**
   * @internal 内部使用
   */
  allowRecurse?: boolean
  onStop?: () => void
  constructor(
    public fn: () => T,
    public scheduler: EffectScheduler | null = null,
    scope?: any
  ) {}
  run() {
    if (!this.active) {
      return this.fn()
    }
    let parent: ReactiveEffect | undefined = activeEffect // 先获取上次激活
    let lastShouldTrack = shouldTrack
    while (parent) {
      if (parent == this) {
        return
      }
      parent = parent.parent
    }
    try {
      this.parent = parent
      // 激活的函数
      activeEffect = this
      shouldTrack = true
      return this.fn()
    } finally {
      // 此时依赖收集完成
      // 这里把激活的函数返回给上一级 出栈
      activeEffect = this.parent
      shouldTrack = lastShouldTrack
      this.parent = undefined
    }
  }
}
export interface ReactiveEffectRunner<T = any> {
  (): T
  effect: ReactiveEffect
}
// 副作用函数
export function effect<T>(fn: () => T, options?: any): ReactiveEffectRunner {
  // 把当前副作用放入
  const _effect = new ReactiveEffect(fn)
  // 这里是有option的情况,合并
  if (options) {
    extend(_effect, options)
    // if (options.scope) recordEffectScope(_effect, options.scope)
  }
  if (!options || !options.lazy) {
    // 如果不是延迟执行，执行run方法
    console.log('执行副作用函数了！run')
    _effect.run()
  }
  const runner = _effect.run.bind(_effect) as ReactiveEffectRunner
  runner.effect = _effect
  return runner
}

//  依赖收集
export function track(target: object, type: TrackOpTypes, key: unknown) {
  console.log('进行依赖收集====', target, type, key)
  if (shouldTrack && activeEffect) {
    // 对依赖的进行一个赋值
    let depsMap = targetMap.get(target)
    if (!depsMap) {
      targetMap.set(target, (depsMap = new Map()))
    }
    let dep = depsMap.get(key)
    if (!dep) {
      depsMap.set(key, (dep = createDep()))
    }
    // 这里是对开发环境的一个错误友好提示
    const eventInfo = __DEV__
      ? { effect, activeEffect, target, type, key }
      : undefined
    trackEffects(dep, eventInfo)
  }
}

export function trackEffects(
  dep: Dep,
  debuggerEventExtraInfo?: DebuggerEventExtraInfo
) {
  // 将副作用放入dep中
  dep.add(activeEffect!)
  // 在当前激活函数中也加入deps
  activeEffect?.deps.push(dep)
  console.log('目前所有收集的依赖==>', targetMap)
  // 下面会有一个开发环境处理操作,暂不处理
}

/**
 * @description: 触发依赖更新
 * @param {target} 触发更新的目标对象
 * @param {type} 触发的类型
 * @param {key} 修改的key
 * @param {newValue} 新值
 * @param {oldValue} 旧值
 * @param {oldTarget} 旧目标对象
 */
export function trigger(
  target: object,
  type: TriggerOpTypes,
  key: unknown,
  newValue?: unknown,
  oldValue?: unknown,
  oldTarget?: Map<unknown, unknown> | Set<unknown>
) {
  // 首先判断当前更新的对象是否有副作用关联
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    return
  }
  // 创建一个deps数组来保存所有的依赖
  const deps: (Dep | undefined)[] = []

  // 把获取的依赖放入deps中
  deps.push(depsMap.get(key))

  // 这里是开发阶段的错误收集
  const eventInfo = __DEV__
    ? { target, type, key, newValue, oldValue, oldTarget }
    : undefined
  if (deps.length === 1) {
    if (deps[0]) {
      if (__DEV__) {
        triggerEffects(deps[0], eventInfo)
      } else {
        triggerEffects(deps[0])
      }
    }
  }
}
// 触发依赖更新的副作用函数
export function triggerEffects(
  dep: Dep | ReactiveEffect[],
  debuggerEventExtraInfo?: DebuggerEventExtraInfo
) {
  console.log('触发依赖更新了！！')
  for (const effect of isArray(dep) ? dep : [...dep]) {
    // 首先拉平dep，传入的参数可能是dep也可能是dep数组
    // 这里依次拿出依赖执行
    // 首先判断当前激活副作用是否相同，只有不同才执行，为了解决副作用重复执行问题
    if (effect !== activeEffect) {
      if (effect.scheduler) {
        // 这里如果传入了调度器，那么不走run默认
        // 走调度器逻辑
        // 这里可以实现computed watch相关api
        effect.scheduler()
      } else {
        // 执行副作用
        effect.run()
      }
    }
  }
}
