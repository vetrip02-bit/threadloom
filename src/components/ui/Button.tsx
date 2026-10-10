import Link from 'next/link'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'quiet'
type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 font-medium transition-colors duration-200 ease-editorial disabled:cursor-not-allowed disabled:opacity-55'

const variants: Record<Variant, string> = {
  primary: 'bg-burgundy text-white hover:bg-burgundy-hover',
  secondary:
    'border border-navy bg-white text-navy hover:bg-navy hover:text-white',
  ghost:
    'border border-hairline bg-white text-navy hover:border-navy hover:text-navy',
  quiet: 'text-navy underline-offset-4 hover:text-burgundy hover:underline',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 rounded-[6px] px-4 text-[13px]',
  md: 'h-11 rounded-[8px] px-6 text-[14px]',
  lg: 'h-12 rounded-[8px] px-7 text-[15px]',
}

interface SharedProps {
  variant?: Variant
  size?: Size
  className?: string
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: SharedProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        base,
        variant === 'quiet' ? 'h-auto p-0' : sizes[size],
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function ButtonLink({
  href,
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: SharedProps & { href: string } & Omit<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    'href'
  >) {
  return (
    <Link
      href={href}
      className={cn(
        base,
        variant === 'quiet' ? 'h-auto p-0' : sizes[size],
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  )
}
