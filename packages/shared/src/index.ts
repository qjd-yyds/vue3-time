export const objectToString = Object.prototype.toString
export const toTypeString = (value: unknown) => objectToString.call(value)

// 判断是否是数组类型
export const isArray = Array.isArray

// 判断是否是对象
export const isObject = (val: unknown): val is Record<any, any> =>
  val !== null && typeof val === 'object'

// 判断是否是Map数据类型
export const isMap = (value: unknown): value is Map<any, any> =>
  toTypeString(value) === '[object Map]'

// 判断是否是字符串
export const isString = (value: unknown): value is string =>
  typeof value === 'string'

// 合并
export const extend = Object.assign

// 判断一个key是不是数字类型的字符串
export const isIntegerKey = (key: unknown): key is string =>
  isString(key) && key !== 'NAN' && key[0] !== '-' && '' + parseInt(key) === key

const hasOwnProperty = Object.prototype.hasOwnProperty
// 判断对象中是否存在key，忽略原型属性
export const hasOwn = (
  val: object,
  key: string | symbol
): key is keyof typeof val => hasOwnProperty.call(val, key)
