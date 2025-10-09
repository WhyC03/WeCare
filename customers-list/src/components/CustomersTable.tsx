import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { Customer } from '../lib/data'
import type { SortState } from '../App'

const ROW_HEIGHT = 56 // px
const PAGE_SIZE = 30

export const CustomersTable: React.FC<{
  sort: SortState
  onSortChange: (s: SortState) => void
  requestWindow: (offset: number, limit: number) => Promise<Customer[]>
}> = ({ sort, onSortChange, requestWindow }) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [rows, setRows] = useState<Customer[]>([])
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  // Load first page
  useEffect(() => {
    setRows([])
    setOffset(0)
    setHasMore(true)
    loadMore(0)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort])

  const loadMore = async (start: number) => {
    const chunk = await requestWindow(start, PAGE_SIZE)
    setRows((prev) => (start === 0 ? chunk : prev.concat(chunk)))
    setOffset(start + chunk.length)
    if (chunk.length < PAGE_SIZE) setHasMore(false)
  }

  const onScroll = () => {
    const el = containerRef.current!
    if (!hasMore) return
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 200) {
      loadMore(offset)
    }
  }

  const toggleSort = (key: keyof Customer) => {
    onSortChange((prev) => {
      if (prev.key === key) {
        return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
      }
      return { key, dir: 'asc' }
    })
  }

  return (
    <div className="table-container" ref={containerRef} onScroll={onScroll}>
      <table className="table">
        <thead className="sticky">
          <tr>
            <th style={{ width: 36 }}> </th>
            <th onClick={() => toggleSort('name')} className="sortable">Customer</th>
            <th style={{ width: 80 }} onClick={() => toggleSort('score')} className="sortable">Score</th>
            <th onClick={() => toggleSort('email')} className="sortable">Email</th>
            <th onClick={() => toggleSort('lastMessageAt')} className="sortable">Last message sent at</th>
            <th onClick={() => toggleSort('addedBy')} className="sortable">Added by</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.id} className="row">
              <td><input type="checkbox" aria-label={`select-${c.id}`} /></td>
              <td>
                <div className="customer">
                  <img className="avatar" src={c.avatar} alt="avatar" width={32} height={32} />
                  <div className="c-meta">
                    <div className="c-name">{c.name}</div>
                    <div className="c-sub">{c.phone}</div>
                  </div>
                </div>
              </td>
              <td>{c.score}</td>
              <td>{c.email}</td>
              <td>{new Date(c.lastMessageAt).toLocaleString(undefined, {
                year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit'
              })}</td>
              <td>{c.addedBy}</td>
            </tr>
          ))}
          {hasMore && (
            <tr>
              <td colSpan={6} className="loading">Loading…</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
