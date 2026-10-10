'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

import { Button } from '@/components/ui/Button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Digest only: never surface internal error text to the visitor.
    console.error('[app] Unhandled error', error.digest ?? '')
  }, [error])

  return (
    <div className="shell py-20 md:py-28">
      <div className="max-w-2xl">
        <AlertTriangle size={28} strokeWidth={1.5} className="text-burgundy" aria-hidden="true" />
        <h1 className="mt-5 text-[30px] leading-tight md:text-[38px]">
          Something went wrong at our end
        </h1>
        <p className="mt-5 text-[15.5px] leading-8 text-charcoal">
          The page could not be loaded. Try again — if it keeps happening, send your
          requirement by email and we will pick it up from there.
        </p>
        {error.digest ? (
          <p className="mt-4 text-[12.5px] text-charcoal/80">
            Reference: <span className="tabular-nums">{error.digest}</span>
          </p>
        ) : null}

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Button onClick={reset}>Try again</Button>
          <Link
            href="/contact"
            className="inline-flex h-11 items-center justify-center rounded-[8px] border border-navy px-6 text-[14px] font-medium text-navy transition-colors hover:bg-navy hover:text-white"
          >
            Contact us
          </Link>
        </div>
      </div>
    </div>
  )
}
