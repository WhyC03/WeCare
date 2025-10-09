import React, { useEffect, useMemo, useRef, useState } from 'react'
import { generateCustomers, type Customer } from './lib/data'
import { CustomersTable } from './components/CustomersTable'
import { debounce } from './lib/debounce'

export type SortState = { key: keyof Customer | null; dir: 'asc' | 'desc' }

export const App: React.FC = () => {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortState>({ key: null, dir: 'asc' })
  const [total, setTotal] = useState(0)

  // Create worker once
  const workerRef = useRef<Worker | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const worker = new Worker(new URL('./worker/dataWorker.ts', import.meta.url), { type: 'module' })
    workerRef.current = worker

    worker.onmessage = (e: MessageEvent) => {
      const msg = e.data
      if (msg.type === 'ready') {
        setTotal(msg.total)
        setReady(true)
      }
    }

    worker.postMessage({ type: 'init' })

    return () => worker.terminate()
  }, [])

  const handleSearch = useMemo(
    () => debounce((value: string) => {
      setQuery(value)
    }, 250),
    []
  )

  const requestWindow = (offset: number, limit: number) => {
    return new Promise<Customer[]>((resolve) => {
      const id = Math.random().toString(36).slice(2)
      const worker = workerRef.current!
      const onMessage = (e: MessageEvent) => {
        const msg = e.data
        if (msg.type === 'window' && msg.id === id) {
          worker.removeEventListener('message', onMessage as any)
          resolve(msg.rows)
        }
      }
      worker.addEventListener('message', onMessage as any)
      worker.postMessage({ type: 'window', id, offset, limit, query, sort })
    })
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">DoubleTick</div>
        <button className="menu">⋮</button>
      </header>

      <div className="toolbar">
        <div className="title">All Customers <span className="badge">{total.toLocaleString()}</span></div>
        <div className="controls">
          <div className="search">
            <input
              aria-label="Search"
              placeholder="Search Customers"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className="filters">
            <button className="filters-btn">Add Filters ▾</button>
            <div className="filters-menu">
              <div>Filter 1</div>
              <div>Filter 2</div>
              <div>Filter 3</div>
              <div>Filter 4</div>
            </div>
          </div>
        </div>
      </div>

      <CustomersTable sort={sort} onSortChange={setSort} requestWindow={requestWindow} />
    </div>
  )
}
