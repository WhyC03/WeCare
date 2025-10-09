import { generateCustomers, type Customer } from '../lib/data'

// Hold data in worker memory
let data: Customer[] | null = null

self.onmessage = (e: MessageEvent) => {
  const msg = e.data as any
  if (msg.type === 'init') {
    if (!data) data = generateCustomers(1_000_000)
    ;(self as any).postMessage({ type: 'ready', total: data.length })
    return
  }
  if (msg.type === 'window') {
    const { id, offset, limit, query, sort } = msg as {
      id: string
      offset: number
      limit: number
      query: string
      sort: { key: keyof Customer | null; dir: 'asc' | 'desc' }
    }
    const rows = getWindow(offset, limit, query, sort)
    ;(self as any).postMessage({ type: 'window', id, rows })
    return
  }
}

function getWindow(offset: number, limit: number, query: string, sort: { key: keyof Customer | null; dir: 'asc' | 'desc' }) {
  if (!data) return []
  let view = data

  if (query) {
    const q = query.toLowerCase()
    view = view.filter((r) => r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || r.phone.includes(q))
  }

  if (sort.key) {
    const dir = sort.dir === 'asc' ? 1 : -1
    const key = sort.key
    view = view.slice().sort((a: any, b: any) => {
      const av = a[key]
      const bv = b[key]
      if (av < bv) return -1 * dir
      if (av > bv) return 1 * dir
      return 0
    })
  }

  return view.slice(offset, offset + limit)
}
