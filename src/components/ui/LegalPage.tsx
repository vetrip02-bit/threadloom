import { Breadcrumbs } from '@/components/catalog/Breadcrumbs'
import { PageHeader } from '@/components/ui/PageHeader'

export function LegalPage({
  href,
  label,
  title,
  description,
  updated,
  children,
}: {
  href: string
  label: string
  title: string
  description: string
  updated: string
  children: React.ReactNode
}) {
  return (
    <>
      <Breadcrumbs trail={[{ href: '/', label: 'Home' }, { href, label }]} />
      <PageHeader eyebrow="Legal" title={title} description={description} />
      <div className="shell py-12 md:py-16">
        <div className="max-w-3xl">
          <p className="mb-10 rounded-card border border-hairline bg-ivory p-5 text-[13px] leading-7 text-charcoal">
            <strong className="font-semibold text-navy">Template only.</strong> This page
            is a starting point, not legal advice. Have it reviewed against the Indian
            Information Technology Act and its SPDI rules, the Digital Personal Data
            Protection Act 2023, and your own contractual terms before you publish.
            Last updated: {updated}.
          </p>
          <div className="space-y-8 text-[14.5px] leading-8 text-charcoal [&_h2]:text-[19px] [&_h2]:font-semibold [&_h2]:text-navy [&_li]:ml-5 [&_li]:list-disc [&_p+p]:mt-4 [&_ul]:mt-3 [&_ul]:space-y-2">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}
