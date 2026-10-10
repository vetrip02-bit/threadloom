import { cn } from '@/lib/utils'

export function Section({
  children,
  className,
  surface = 'white',
  id,
  ...rest
}: {
  children: React.ReactNode
  className?: string
  /** Ivory is the only supporting surface; everything else stays white. */
  surface?: 'white' | 'ivory'
  id?: string
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <section
      id={id}
      className={cn(
        'py-16 md:py-20 lg:py-24',
        surface === 'ivory' ? 'bg-ivory' : 'bg-white',
        className,
      )}
      {...rest}
    >
      <div className="shell">{children}</div>
    </section>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  action,
}: {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  action?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'mb-10 flex flex-col gap-5 md:mb-12',
        align === 'center'
          ? 'items-center text-center'
          : 'md:flex-row md:items-end md:justify-between',
      )}
    >
      <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
        {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
        <h2 className="text-[26px] leading-tight md:text-[34px]">{title}</h2>
        {description ? (
          <p className="mt-4 text-[15px] leading-7 text-charcoal md:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
