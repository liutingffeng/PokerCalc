/**
 * Lodash 工具库
 * 
 * 这个文件导出 Lodash 库中常用的函数，可以在项目中任何地方导入使用
 * 例如：import { isEmpty, isArray } from '../../utils/lodash'
 */

/**
 * 检查值是否为空
 * @param value 要检查的值
 * @returns 如果值为空，则返回 true，否则返回 false
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) {
    return true;
  }
  
  if (typeof value === 'string' || Array.isArray(value)) {
    return value.length === 0;
  }
  
  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }
  
  return false;
}

/**
 * 检查值是否为数组
 * @param value 要检查的值
 * @returns 如果值是数组，则返回 true，否则返回 false
 */
export function isArray(value: any): boolean {
  return Array.isArray(value);
}

/**
 * 创建一个深拷贝的值
 * @param value 要深拷贝的值
 * @returns 深拷贝后的值
 */
export function cloneDeep<T>(value: T): T {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  
  if (Array.isArray(value)) {
    return value.map(item => cloneDeep(item)) as unknown as T;
  }
  
  const result = {} as T;
  for (const key in value) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      result[key] = cloneDeep(value[key]);
    }
  }
  
  return result;
}

/**
 * 查找数组中第一个满足条件的元素的索引
 * @param array 要搜索的数组
 * @param predicate 断言函数
 * @returns 找到元素的索引，否则返回 -1
 */
export function findIndex<T>(array: T[], predicate: (value: T, index: number, array: T[]) => boolean): number {
  if (!Array.isArray(array)) {
    return -1;
  }
  
  for (let i = 0; i < array.length; i++) {
    if (predicate(array[i], i, array)) {
      return i;
    }
  }
  
  return -1;
}