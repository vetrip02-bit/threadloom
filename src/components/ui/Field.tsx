'use client'

import { useId } from 'react'
import { cn } from '@/lib/utils'

const controlBase =
  'w-full rounded-[8px] border bg-white px-3.5 py-2.5 text-[14px] text-navy placeholder:text-charcoal/75 transition-colors duration-200 focus:border-burgundy'

interface BaseProps {
  label: string
  error?: string
  hint?: string
  required?: boolean
  className?: string
}

function Shell({
  label,
  error,
  hint,
  required,
  id,
  hintId,
  errorId,
  className,
  children,
}: BaseProps & {
  id: string
  hintId: string
  errorId: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-[13px] font-medium text-navy">
        {label}
        {required ? (
          <span className="ml-1 text-burgundy" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="ml-1 font-normal text-charcoal/80">(optional)</span>
        )}
      </label>
      {children}
      {hint ? (
        <p id={hintId} className="text-[12px] leading-5 text-charcoal/75">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-[12px] font-medium leading-5 text-burgundy">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function TextField({
  label,
  error,
  hint,
  required,
  className,
  ...props
}: BaseProps & React.InputHTMLAttributes<HTMLInputElement>) {
  const base = useId()
  const id = props.id ?? base
  const hintId = base + '-hint'
  const errorId = base + '-error'
  return (
    <Shell
      label={label}
      error={error}
      hint={hint}
      required={required}
      id={id}
      hintId={hintId}
      errorId={errorId}
      className={className}
    >
      <input
        {...props}
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={cn(hint && hintId, error && errorId) || undefined}
        className={cn(controlBase, error ? 'border-burgundy' : 'border-hairline')}
      />
    </Shell>
  )
}

export function TextAreaField({
  label,
  error,
  hint,
  required,
  className,
  ...props
}: BaseProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const base = useId()
  const id = props.id ?? base
  const hintId = base + '-hint'
  const errorId = base + '-error'
  return (
    <Shell
      label={label}
      error={error}
      hint={hint}
      required={required}
      id={id}
      hintId={hintId}
      errorId={errorId}
      className={className}
    >
      <textarea
        {...props}
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={cn(hint && hintId, error && errorId) || undefined}
        className={cn(
          controlBase,
          'min-h-[120px] resize-y leading-6',
          error ? 'border-burgundy' : 'border-hairline',
        )}
      />
    </Shell>
  )
}

export function SelectField({
  label,
  error,
  hint,
  required,
  className,
  options,
  placeholder,
  ...props
}: BaseProps & {
  options: readonly string[]
  placeholder?: string
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  const base = useId()
  const id = props.id ?? base
  const hintId = base + '-hint'
  const errorId = base + '-error'
  return (
    <Shell
      label={label}
      error={error}
      hint={hint}
      required={required}
      id={id}
      hintId={hintId}
      errorId={errorId}
      className={className}
    >
      <select
        {...props}
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={cn(hint && hintId, error && errorId) || undefined}
        className={cn(
          controlBase,
          'appearance-none bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10',
          error ? 'border-burgundy' : 'border-hairline',
        )}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%233E4147' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
        }}
      >
        {placeholder ? (
          <option value="">{placeholder}</option>
        ) : null}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </Shell>
  )
}

export function CheckboxField({
  label,
  error,
  id,
  ...props
}: {
  label: React.ReactNode
  error?: string
  id?: string
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const base = useId()
  const inputId = id ?? base
  const errorId = base + '-error'
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-start gap-3">
        <input
          {...props}
          id={inputId}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="mt-[3px] h-4 w-4 shrink-0 cursor-pointer rounded-[3px] border border-hairline accent-burgundy"
        />
        <label htmlFor={inputId} className="text-[13px] leading-6 text-charcoal">
          {label}
        </label>
      </div>
      {error ? (
        <p id={errorId} className="pl-7 text-[12px] font-medium text-burgundy">
          {error}
        </p>
      ) : null}
    </div>
  )
}
