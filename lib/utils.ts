import { twMerge } from 'tailwind-merge'

/**
 * Minimal local implementation of `clsx` to avoid requiring the external package.
 * Handles strings, numbers, arrays and objects (object keys are included when their value is truthy).
 */
function clsx(...inputs: any[]): string {
  const classes: string[] = []

  const push = (val: any) => {
    if (val === null || val === undefined || val === false) return
    if (typeof val === 'string' || typeof val === 'number') {
      if (String(val).length) classes.push(String(val))
    } else if (Array.isArray(val)) {
      val.forEach(push)
    } else if (typeof val === 'object') {
      for (const key in val) {
        if (Object.prototype.hasOwnProperty.call(val, key) && (val as any)[key]) {
          classes.push(key)
        }
      }
    }
  }

  inputs.forEach(push)
  return classes.join(' ')
}

export function cn(...inputs: any[]) {
  return twMerge(clsx(...inputs))
}
