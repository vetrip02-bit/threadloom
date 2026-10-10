export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

/** Formats a whole-rupee amount using the Indian digit grouping. */
export function formatInr(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatQuantity(value: number): string {
  return new Intl.NumberFormat('en-IN').format(value)
}

/** Today in YYYY-MM-DD, used as the `min` for expected-date inputs. */
export function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}
