'use client'

import Link from 'next/link'
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'

import { useQuote } from '@/components/quote/QuoteProvider'
import { Scrim, useModalBehaviour } from '@/components/ui/Overlay'
import { ButtonLink } from '@/components/ui/Button'
import { formatQuantity } from '@/lib/utils'

export function QuoteDrawer() {
  const { items, isDrawerOpen, closeDrawer, removeItem, updateItem, totalPieces, clear } =
    useQuote()
  const containerRef = useModalBehaviour(isDrawerOpen, closeDrawer)

  if (!isDrawerOpen) return null

  return (
    <>
      <Scrim onClick={closeDrawer} />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Quote bag"
        tabIndex={-1}
        className="fixed inset-y-0 right-0 z-50 flex w-[min(100vw,440px)] animate-slide-in-right flex-col bg-white shadow-lifted"
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-hairline px-5">
          <h2 className="text-[15px] font-semibold text-navy">
            Quote bag
            {items.length > 0 ? (
              <span className="ml-2 font-normal text-charcoal">
                ({items.length} {items.length === 1 ? 'item' : 'items'})
              </span>
            ) : null}
          </h2>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close quote bag"
            className="-mr-2 flex h-10 w-10 items-center justify-center rounded-[6px] text-navy transition-colors hover:bg-ivory"
          >
            <X size={20} strokeWidth={1.6} aria-hidden="true" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ivory">
              <ShoppingBag size={22} strokeWidth={1.5} className="text-navy" aria-hidden="true" />
            </span>
            <h3 className="text-[16px]">Your quote bag is empty</h3>
            <p className="text-[14px] leading-6 text-charcoal">
              Add uniforms from any category and we will price them together as one
              enquiry.
            </p>
            <ButtonLink href="/uniforms" onClick={closeDrawer} variant="secondary">
              Browse uniforms
            </ButtonLink>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-hairline overflow-y-auto px-5">
              {items.map((item) => (
                <li key={item.key} className="py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-charcoal/80">
                        {item.categoryLabel}
                      </p>
                      <h3 className="mt-1 truncate text-[14.5px] font-medium text-navy">
                        {item.productName}
                      </h3>
                      <dl className="mt-2 space-y-1 text-[12.5px] text-charcoal">
                        {item.color ? (
                          <div className="flex gap-1.5">
                            <dt className="text-charcoal/80">Colour:</dt>
                            <dd>{item.color}</dd>
                          </div>
                        ) : null}
                        {item.sizes ? (
                          <div className="flex gap-1.5">
                            <dt className="text-charcoal/80">Sizes:</dt>
                            <dd className="truncate">{item.sizes}</dd>
                          </div>
                        ) : null}
                        <div className="flex gap-1.5">
                          <dt className="text-charcoal/80">Branding:</dt>
                          <dd>{item.brandingMethod}</dd>
                        </div>
                        {item.notes ? (
                          <div className="flex gap-1.5">
                            <dt className="text-charcoal/80">Notes:</dt>
                            <dd className="line-clamp-2">{item.notes}</dd>
                          </div>
                        ) : null}
                      </dl>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.key)}
                      aria-label={'Remove ' + item.productName + ' from quote bag'}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] text-charcoal transition-colors hover:bg-ivory hover:text-burgundy"
                    >
                      <Trash2 size={16} strokeWidth={1.6} aria-hidden="true" />
                    </button>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex items-center rounded-[8px] border border-hairline">
                      <button
                        type="button"
                        onClick={() =>
                          updateItem(item.key, {
                            quantity: Math.max(1, item.quantity - 25),
                          })
                        }
                        aria-label={'Decrease quantity for ' + item.productName}
                        className="flex h-9 w-9 items-center justify-center text-navy transition-colors hover:bg-ivory"
                      >
                        <Minus size={15} strokeWidth={1.8} aria-hidden="true" />
                      </button>
                      <label className="sr-only" htmlFor={'qty-' + item.key}>
                        Quantity for {item.productName}
                      </label>
                      <input
                        id={'qty-' + item.key}
                        type="number"
                        min={1}
                        max={1000000}
                        value={item.quantity}
                        onChange={(event) => {
                          const next = Number.parseInt(event.target.value, 10)
                          updateItem(item.key, {
                            quantity: Number.isFinite(next) && next > 0 ? next : 1,
                          })
                        }}
                        className="h-9 w-16 border-x border-hairline bg-white text-center text-[13px] font-medium tabular-nums text-navy focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => updateItem(item.key, { quantity: item.quantity + 25 })}
                        aria-label={'Increase quantity for ' + item.productName}
                        className="flex h-9 w-9 items-center justify-center text-navy transition-colors hover:bg-ivory"
                      >
                        <Plus size={15} strokeWidth={1.8} aria-hidden="true" />
                      </button>
                    </div>
                    <span className="text-[12.5px] text-charcoal/75">pieces</span>
                  </div>
                </li>
              ))}
            </ul>

            <div className="shrink-0 space-y-4 border-t border-hairline px-5 py-5">
              <div className="flex items-center justify-between text-[13.5px]">
                <span className="text-charcoal">Total pieces</span>
                <span className="font-semibold tabular-nums text-navy">
                  {formatQuantity(totalPieces)}
                </span>
              </div>
              <p className="text-[12px] leading-5 text-charcoal/75">
                No payment is taken here. We review your bag and send a written quote.
              </p>
              <ButtonLink href="/quote" className="w-full" onClick={closeDrawer}>
                Request a quote
              </ButtonLink>
              <div className="flex items-center justify-between">
                <Link
                  href="/uniforms"
                  onClick={closeDrawer}
                  className="text-[13px] text-navy underline-offset-4 transition-colors hover:text-burgundy hover:underline"
                >
                  Continue browsing
                </Link>
                <button
                  type="button"
                  onClick={clear}
                  className="text-[13px] text-charcoal underline-offset-4 transition-colors hover:text-burgundy hover:underline"
                >
                  Clear bag
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
