'use client'

import { Pencil, UserCheck } from 'lucide-react'

import type { ContactFields } from '@/lib/profile-prefill'

/**
 * Replaces the seven contact fields for a signed-in customer whose profile is
 * complete. They confirm rather than retype; "Edit" reveals the full fieldset.
 */
export function SignedInContact({
  contact,
  onEdit,
  source = 'account',
}: {
  contact: ContactFields
  onEdit: () => void
  /** Where the details came from, so the copy never overstates it. */
  source?: 'account' | 'device'
}) {
  const rows: Array<[string, string]> = [
    ['Name', contact.firstName + ' ' + contact.lastName],
    ['Organization', contact.organization],
    ['Email', contact.email],
    ['Phone', contact.phone],
    ['City', contact.city],
    ['Customer type', contact.customerType || '—'],
  ]

  return (
    <div className="rounded-card border border-hairline bg-ivory p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <UserCheck
            size={18}
            strokeWidth={1.7}
            className="mt-0.5 shrink-0 text-burgundy"
            aria-hidden="true"
          />
          <div>
            <h3 className="text-[14px] font-semibold text-navy">
              Sending as {contact.firstName} {contact.lastName}
            </h3>
            <p className="mt-1 text-[12.5px] leading-5 text-charcoal">
              {source === 'account'
                ? 'Taken from your account — nothing to retype.'
                : 'Taken from the details saved on this device — nothing to retype.'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex shrink-0 items-center gap-1.5 text-[13px] font-medium text-navy underline-offset-4 transition-colors hover:text-burgundy hover:underline"
        >
          <Pencil size={13} strokeWidth={1.8} aria-hidden="true" />
          Edit
        </button>
      </div>

      <dl className="mt-4 grid gap-x-6 gap-y-2 border-t border-hairline pt-4 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex gap-2 text-[12.5px]">
            <dt className="shrink-0 text-charcoal/80">{label}:</dt>
            <dd className="min-w-0 truncate font-medium text-navy">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
