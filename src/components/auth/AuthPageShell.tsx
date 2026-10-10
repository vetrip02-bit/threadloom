import { Breadcrumbs } from '@/components/catalog/Breadcrumbs'

/** Full-page auth layout used on mobile and as the direct-link experience. */
export function AuthPageShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <>
      <Breadcrumbs trail={[{ href: '/', label: 'Home' }, { href: '#', label: title }]} />
      <div className="shell py-12 md:py-16">
        <div className="mx-auto max-w-[560px]">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-3 text-[28px] leading-tight md:text-[34px]">{title}</h1>
          <p className="mt-4 text-[14.5px] leading-7 text-charcoal">{description}</p>
          <div className="mt-9 rounded-card border border-hairline p-6 md:p-8">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}
