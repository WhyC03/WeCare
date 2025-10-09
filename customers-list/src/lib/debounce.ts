export function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let t: number | undefined
  return (...args: Parameters<T>) => {
    if (t) window.clearTimeout(t)
    t = window.setTimeout(() => fn(...args), delay)
  }
}
