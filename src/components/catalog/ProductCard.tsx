'use client'

import { useState } from 'react'
import { Check, Plus } from 'lucide-react'

import type { Product } from '@/types'
import { useQuote } from '@/components/quote/QuoteProvider'
import { cn, formatInr, formatQuantity } from '@/lib/utils'

/**
 * Product card with configurable variants.
 *
 * Deliberately shows no discount, rating or review count - the business has
 * not supplied any, and inventing them would be a fabricated claim.
 */
export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useQuote()
  const [colorIndex, setColorIndex] = useState(0)
  const [justAdded, setJustAdded] = useState(false)

  const color = product.colors[colorIndex]!

  function handleAdd() {
    addItem({
      productId: product.id,
      productName: product.name,
      category: product.category,
      categoryLabel: product.categoryLabel,
      quantity: product.moq,
      color: color.name,
      sizes: 'To be confirmed',
      brandingMethod: product.brandingMethods[0]!,
      notes: '',
    })
    setJustAdded(true)
    window.setTimeout(() => setJustAdded(false), 1800)
  }

  return (
    <article
      id={product.id}
      className="group flex scroll-mt-28 flex-col rounded-card border border-hairline bg-white p-5 transition-shadow duration-300 ease-editorial hover:shadow-card"
    >
      {/*
        Image area. The sample catalogue ships without per-product photography,
        so this is an intentional typographic placeholder on ivory rather than a
        stock image that would misrepresent the product.
        TODO(owner): drop your product photo in here.
      */}
      <div className="relative mb-5 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-image bg-ivory">
        <span
          aria-hidden="true"
          className="h-16 w-16 rounded-full border border-hairline transition-transform duration-500 ease-editorial group-hover:scale-110"
          style={{ backgroundColor: color.hex }}
        />
        <span className="absolute bottom-3 left-4 text-[11px] font-medium uppercase tracking-[0.12em] text-charcoal/80">
          {color.name}
        </span>
      </div>

      <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-charcoal/80">
        {product.categoryLabel}
      </p>
      <h3 className="mt-1.5 text-[16px] font-semibold leading-snug text-navy">
        {product.name}
      </h3>
      <p className="mt-2 text-[13.5px] leading-6 text-charcoal">{product.summary}</p>

      <fieldset className="mt-4">
        <legend className="text-[12px] font-medium text-charcoal/80">
          Available colours
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {product.colors.map((option, index) => {
            const selected = index === colorIndex
            return (
              <button
                key={option.name}
                type="button"
                onClick={() => setColorIndex(index)}
                aria-pressed={selected}
                title={option.name}
                className={cn(
                  'h-7 w-7 rounded-full transition-all duration-200 ease-editorial',
                  selected
                    ? 'ring-2 ring-navy ring-offset-2 ring-offset-white'
                    : 'ring-1 ring-hairline hover:ring-charcoal/40',
                )}
                style={{ backgroundColor: option.hex }}
              >
                <span className="sr-only">
                  {option.name}
                  {selected ? ' (selected)' : ''}
                </span>
              </button>
            )
          })}
        </div>
      </fieldset>

      <dl className="mt-5 space-y-1.5 border-t border-hairline pt-4 text-[13px]">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-charcoal/80">Minimum order</dt>
          <dd className="font-medium tabular-nums text-navy">
            {formatQuantity(product.moq)} pcs
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-charcoal/80">Indicative price</dt>
          <dd className="text-right font-medium tabular-nums text-navy">
            {product.indicativePriceInr ? (
              <>
                {formatInr(product.indicativePriceInr.from)}
                {' – '}
                {formatInr(product.indicativePriceInr.to)}
                <span className="ml-1 font-normal text-charcoal/80">/ pc</span>
              </>
            ) : (
              <span className="font-normal text-charcoal">Price on enquiry</span>
            )}
          </dd>
        </div>
      </dl>
      {/* TODO(owner): replace the sample price band in src/data/catalog.ts. */}
      <p className="mt-2 text-[11.5px] leading-5 text-charcoal/80">
        Sample band, excluding GST and branding. Final pricing depends on fabric,
        quantity and artwork.
      </p>

      <button
        type="button"
        onClick={handleAdd}
        className={cn(
          'mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[8px] text-[14px] font-medium transition-colors duration-200',
          justAdded
            ? 'bg-navy text-white'
            : 'bg-burgundy text-white hover:bg-burgundy-hover',
        )}
      >
        {justAdded ? (
          <>
            <Check size={17} strokeWidth={2} aria-hidden="true" />
            Added to quote
          </>
        ) : (
          <>
            <Plus size={17} strokeWidth={2} aria-hidden="true" />
            Add to Quote
          </>
        )}
      </button>
      <p className="sr-only" role="status">
        {justAdded ? product.name + ' added to your quote bag.' : ''}
      </p>
    </article>
  )
}
