export type CategorySlug =
  | 'school-college-uniforms'
  | 'custom-tshirts'
  | 'event-merchandise'
  | 'hospitality-uniforms'
  | 'sports-jerseys'

export interface ColorOption {
  /** Human-readable swatch name shown in the tooltip and read by screen readers. */
  name: string
  /** Hex value used only to paint the swatch. */
  hex: string
  /** Set for very light swatches so the ring stays visible on white. */
  light?: boolean
}

export interface Category {
  slug: CategorySlug
  name: string
  /** Short line used on the homepage grid. */
  teaser: string
  /** Longer copy used on the category page. */
  description: string
  image: string
  imageAlt: string
  /** Editable: the garment families this category covers. */
  highlights: string[]
}

export interface Product {
  id: string
  name: string
  category: CategorySlug
  /** Small label above the product name on the card. */
  categoryLabel: string
  summary: string
  colors: ColorOption[]
  sizes: string[]
  fabrics: string[]
  /** Minimum order quantity, in pieces. Editable sample value. */
  moq: number
  /**
   * Editable indicative price band in INR per piece. Replace with your own
   * commercial numbers, or set to `null` to show "Price on enquiry" instead.
   */
  indicativePriceInr: { from: number; to: number } | null
  brandingMethods: BrandingMethod[]
}

export type BrandingMethod =
  | 'Screen printing'
  | 'Embroidery'
  | 'Heat transfer'
  | 'Woven label'
  | 'No branding'

export interface QuoteItem {
  /** Stable key: product id + variant signature. */
  key: string
  productId: string
  productName: string
  category: CategorySlug
  categoryLabel: string
  quantity: number
  color: string
  sizes: string
  brandingMethod: BrandingMethod
  notes: string
}

export interface Industry {
  id: string
  name: string
  description: string
  needs: string[]
  relatedCategory: CategorySlug
}

export interface ProcessStep {
  step: number
  title: string
  description: string
}

export interface CustomizationOption {
  id: string
  title: string
  description: string
  bestFor: string
}

export type CustomerType =
  | 'School / College'
  | 'Corporate'
  | 'Hospitality'
  | 'Event agency'
  | 'Sports team'
  | 'Reseller'
  | 'Other'

export interface Profile {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  organization: string | null
  customer_type: CustomerType | null
  city: string | null
  consent_at: string | null
  created_at: string
  updated_at: string
}
