'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { QuoteItem } from '@/types'

const BAG_KEY = 'uniform-quote-bag'

interface QuoteContextValue {
  items: QuoteItem[]
  count: number
  totalPieces: number
  /** True until localStorage has been read, so the UI can avoid a count flash. */
  hydrated: boolean
  isDrawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
  addItem: (item: Omit<QuoteItem, 'key'>) => void
  updateItem: (key: string, patch: Partial<Omit<QuoteItem, 'key'>>) => void
  removeItem: (key: string) => void
  clear: () => void
}

const QuoteContext = createContext<QuoteContextValue | null>(null)

function readBag(key: string): QuoteItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item): item is QuoteItem =>
        Boolean(item) && typeof item.key === 'string' && typeof item.quantity === 'number',
    )
  } catch {
    return []
  }
}

function writeBag(key: string, items: QuoteItem[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(items))
  } catch {
    // Quota or private-mode failure: the bag simply stays in memory.
  }
}

/** Items that match on product + variant are the same line. */
function makeKey(item: Omit<QuoteItem, 'key'>): string {
  return [item.productId, item.color, item.sizes, item.brandingMethod]
    .join('::')
    .toLowerCase()
}

export function QuoteProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<QuoteItem[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [isDrawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    setItems(readBag(BAG_KEY))
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    writeBag(BAG_KEY, items)
  }, [items, hydrated])

  const addItem = useCallback((item: Omit<QuoteItem, 'key'>) => {
    const key = makeKey(item)
    setItems((current) => {
      const existing = current.find((i) => i.key === key)
      if (existing) {
        return current.map((i) =>
          i.key === key ? { ...i, quantity: i.quantity + item.quantity } : i,
        )
      }
      return [...current, { ...item, key }]
    })
    setDrawerOpen(true)
  }, [])

  const updateItem = useCallback(
    (key: string, patch: Partial<Omit<QuoteItem, 'key'>>) => {
      setItems((current) =>
        current.map((item) => (item.key === key ? { ...item, ...patch } : item)),
      )
    },
    [],
  )

  const removeItem = useCallback((key: string) => {
    setItems((current) => current.filter((item) => item.key !== key))
  }, [])

  const clear = useCallback(() => setItems([]), [])


  const value = useMemo<QuoteContextValue>(
    () => ({
      items,
      count: items.length,
      totalPieces: items.reduce((sum, item) => sum + item.quantity, 0),
      hydrated,
      isDrawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      addItem,
      updateItem,
      removeItem,
      clear,
    }),
    [items, hydrated, isDrawerOpen, addItem, updateItem, removeItem, clear],
  )

  return <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>
}

export function useQuote(): QuoteContextValue {
  const context = useContext(QuoteContext)
  if (!context) throw new Error('useQuote must be used inside a QuoteProvider')
  return context
}
