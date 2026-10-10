export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description?: string
  children?: React.ReactNode
}) {
  return (
    <header className="border-b border-hairline bg-white">
      <div className="shell py-12 md:py-16">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-4 max-w-3xl text-[30px] leading-[1.15] md:text-[42px]">
          {title}
        </h1>
        {description ? (
          <p className="mt-5 max-w-2xl text-[15.5px] leading-8 text-charcoal">
            {description}
          </p>
        ) : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </header>
  )
}
