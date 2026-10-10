'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { QuoteItem } from '@/types'

const GUEST_KEY = 'uniform-quote-bag:guest'
const userKey = (userId: string) => 'uniform-quote-bag:' + userId

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
  /** Merges the guest bag into the signed-in user's bag. */
  mergeGuestBag: (userId: string) => void
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
  const storageKey = useRef(GUEST_KEY)

  useEffect(() => {
    setItems(readBag(GUEST_KEY))
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    writeBag(storageKey.current, items)
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

  /**
   * On sign-in, fold anything the guest collected into the account's own bag
   * and switch the storage key so future writes belong to that account.
   */
  const mergeGuestBag = useCallback((userId: string) => {
    const target = userKey(userId)
    if (storageKey.current === target) return

    const guest = readBag(GUEST_KEY)
    const stored = readBag(target)
    const merged = [...stored]

    for (const item of guest) {
      const match = merged.find((i) => i.key === item.key)
      if (match) match.quantity += item.quantity
      else merged.push(item)
    }

    storageKey.current = target
    try {
      window.localStorage.removeItem(GUEST_KEY)
    } catch {
      // ignore
    }
    writeBag(target, merged)
    setItems(merged)
  }, [])

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
      mergeGuestBag,
    }),
    [items, hydrated, isDrawerOpen, addItem, updateItem, removeItem, clear, mergeGuestBag],
  )

  return <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>
}

export function useQuote(): QuoteContextValue {
  const context = useContext(QuoteContext)
  if (!context) throw new Error('useQuote must be used inside a QuoteProvider')
  return context
}
