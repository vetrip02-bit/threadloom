import type {
  Category,
  CustomizationOption,
  Industry,
  ProcessStep,
  Product,
} from '@/types'

/**
 * SAMPLE CATALOGUE — editable.
 *
 * Every product, colour, MOQ and price band below is illustrative seed data so
 * the storefront renders with realistic content. Replace it with your own range
 * before going live. No claim here is presented as a verified fact about the
 * business.
 */

export const CATEGORIES: Category[] = [
  {
    slug: 'school-college-uniforms',
    name: 'School & College Uniforms',
    teaser:
      'Blazers, shirts, trousers, pinafores and house-colour knitwear for full-session supply.',
    description:
      'Complete uniform programmes for schools and colleges — summer and winter sets, house colours, sports kit and accessories, produced against an approved size chart so repeat orders stay consistent across the academic year.',
    image: '/images/school-college-uniforms.png',
    imageAlt:
      'Three students in navy blazers, striped ties and grey uniform bottoms standing in a college corridor.',
    highlights: [
      'Summer and winter sets',
      'House-colour ties, belts and badges',
      'Blazers, pinafores and knitwear',
      'Size-set sampling before bulk',
    ],
  },
  {
    slug: 'custom-tshirts',
    name: 'Custom T-Shirts',
    teaser:
      'Cotton and blended tees in round and polo necks, printed or embroidered to your artwork.',
    description:
      'Bulk T-shirts and polos in combed cotton, cotton-rich blends and performance knits. Choose GSM, neck style, fit and sleeve length, then add your logo by screen printing, embroidery or heat transfer.',
    image: '/images/custom-tshirts.png',
    imageAlt:
      'Three people wearing plain white, burgundy and navy round-neck T-shirts in a retail studio.',
    highlights: [
      'Combed cotton, blends and dri-fit',
      'Round neck, polo and henley',
      'Unisex and tailored fits',
      'Front, back and sleeve branding',
    ],
  },
  {
    slug: 'event-merchandise',
    name: 'Event Merchandise',
    teaser:
      'Crew tees, polos, caps, lanyards and tote bags produced to an event deadline.',
    description:
      'Coordinated merchandise for conferences, weddings, launches and campaigns — crew apparel, caps, lanyards, badges and bags built around a single artwork set and delivered against your event date.',
    image: '/images/event-merchandise.png',
    imageAlt:
      'Two event crew members in navy polos and caps arranging tote bags, folded shirts and lanyards at a venue counter.',
    highlights: [
      'Crew tees, polos and caps',
      'Lanyards, badge holders and totes',
      'Date-led production planning',
      'Split delivery to multiple venues',
    ],
  },
  {
    slug: 'hospitality-uniforms',
    name: 'Restaurant & Hotel Uniforms',
    teaser:
      'Front-office, service, housekeeping and kitchen uniforms in wash-durable fabrics.',
    description:
      'Role-wise hospitality uniforms — front office, F&B service, housekeeping, kitchen and spa — cut in fabrics chosen for repeated industrial laundering and finished with the trims and piping that carry your property identity.',
    image: '/images/hospitality-uniforms.png',
    imageAlt:
      'A bell-desk attendant in a burgundy bandhgala and a service associate in a waistcoat standing in a hotel lobby.',
    highlights: [
      'Front office and concierge',
      'F&B service and bar',
      'Housekeeping and kitchen',
      'Wash-durable fabric options',
    ],
  },
  {
    slug: 'sports-jerseys',
    name: 'Sports Jerseys',
    teaser:
      'Breathable team jerseys, shorts and track sets with numbers, names and sponsor marks.',
    description:
      'Team kit in moisture-managing knits — jerseys, shorts, track sets and bibs — with sublimated or printed numbers, player names and sponsor placements for school teams, clubs and corporate tournaments.',
    image: '/images/sports-jerseys.png',
    imageAlt:
      'Three athletes in navy, white and burgundy team jerseys and shorts on an indoor court.',
    highlights: [
      'Dri-fit and interlock knits',
      'Numbers, names and sponsor marks',
      'Match and training sets',
      'Youth through adult sizing',
    ],
  },
]

export const CATEGORY_BY_SLUG = new Map(CATEGORIES.map((c) => [c.slug, c]))

const NAVY = { name: 'Navy', hex: '#132238' }
const BURGUNDY = { name: 'Burgundy', hex: '#7A1F33' }
const WHITE = { name: 'White', hex: '#FFFFFF', light: true }
const IVORY = { name: 'Ivory', hex: '#F7F4EF', light: true }
const CHARCOAL = { name: 'Charcoal', hex: '#3E4147' }
const GREY = { name: 'Mid grey', hex: '#8E9298' }
const BOTTLE = { name: 'Bottle green', hex: '#1F4034' }
const SKY = { name: 'Sky blue', hex: '#A9C4DC', light: true }
const BLACK = { name: 'Black', hex: '#14161A' }
const SAND = { name: 'Sand', hex: '#C8B79A', light: true }

/** Editable sample range. Prices are indicative bands in INR per piece. */
export const PRODUCTS: Product[] = [
  {
    id: 'school-blazer-set',
    name: 'School Blazer & Trouser Set',
    category: 'school-college-uniforms',
    categoryLabel: 'School & College',
    summary:
      'Structured poly-viscose blazer with matching trousers or skirt, finished with your crest.',
    colors: [NAVY, CHARCOAL, BOTTLE],
    sizes: ['22', '24', '26', '28', '30', '32', '34', '36', '38', '40'],
    fabrics: ['Poly-viscose suiting', 'Wool-blend suiting'],
    moq: 100,
    indicativePriceInr: { from: 1150, to: 1950 },
    brandingMethods: ['Embroidery', 'Woven label'],
  },
  {
    id: 'school-shirt',
    name: 'Classic Uniform Shirt',
    category: 'school-college-uniforms',
    categoryLabel: 'School & College',
    summary:
      'Half or full sleeve poly-cotton shirt with reinforced placket and optional house trim.',
    colors: [WHITE, SKY, IVORY],
    sizes: ['22', '24', '26', '28', '30', '32', '34', '36', '38', '40'],
    fabrics: ['Poly-cotton 65/35', 'Cotton rich'],
    moq: 200,
    indicativePriceInr: { from: 285, to: 480 },
    brandingMethods: ['Embroidery', 'Woven label', 'No branding'],
  },
  {
    id: 'round-neck-tee',
    name: 'Combed Cotton Round-Neck Tee',
    category: 'custom-tshirts',
    categoryLabel: 'Custom T-Shirts',
    summary:
      '180 GSM bio-washed combed cotton with ribbed collar and shoulder-to-shoulder tape.',
    colors: [WHITE, NAVY, BURGUNDY, BLACK, BOTTLE],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
    fabrics: ['180 GSM combed cotton', '160 GSM cotton blend'],
    moq: 50,
    indicativePriceInr: { from: 215, to: 390 },
    brandingMethods: ['Screen printing', 'Embroidery', 'Heat transfer', 'No branding'],
  },
  {
    id: 'corporate-polo',
    name: 'Corporate Pique Polo',
    category: 'custom-tshirts',
    categoryLabel: 'Custom T-Shirts',
    summary:
      'Matty or pique polo with ribbed collar, three-button placket and contrast tipping option.',
    colors: [NAVY, WHITE, CHARCOAL, BURGUNDY, SAND],
    sizes: ['S', 'M', 'L', 'XL', 'XXL', '3XL'],
    fabrics: ['220 GSM matty', '200 GSM pique', 'Dri-fit pique'],
    moq: 50,
    indicativePriceInr: { from: 340, to: 620 },
    brandingMethods: ['Embroidery', 'Screen printing', 'Heat transfer'],
  },
  {
    id: 'event-crew-kit',
    name: 'Event Crew Kit',
    category: 'event-merchandise',
    categoryLabel: 'Event Merchandise',
    summary:
      'Crew polo with cap and lanyard, packed per person and labelled by venue or team.',
    colors: [NAVY, BLACK, BURGUNDY, IVORY],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    fabrics: ['220 GSM matty', 'Brushed cotton twill (cap)'],
    moq: 75,
    indicativePriceInr: { from: 520, to: 880 },
    brandingMethods: ['Embroidery', 'Screen printing', 'Heat transfer'],
  },
  {
    id: 'canvas-tote',
    name: 'Canvas Delegate Tote',
    category: 'event-merchandise',
    categoryLabel: 'Event Merchandise',
    summary:
      '12 oz cotton canvas tote with reinforced handles and a single or multi-colour print.',
    colors: [IVORY, NAVY, BLACK],
    sizes: ['One size'],
    fabrics: ['12 oz cotton canvas', '10 oz cotton canvas'],
    moq: 100,
    indicativePriceInr: { from: 165, to: 340 },
    brandingMethods: ['Screen printing', 'Heat transfer'],
  },
  {
    id: 'service-waistcoat',
    name: 'F&B Service Waistcoat',
    category: 'hospitality-uniforms',
    categoryLabel: 'Restaurant & Hotel',
    summary:
      'Lined waistcoat with contrast piping, cut to pair with your shirt and trouser spec.',
    colors: [CHARCOAL, NAVY, BURGUNDY, BLACK],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    fabrics: ['Poly-viscose suiting', 'Easy-care twill'],
    moq: 40,
    indicativePriceInr: { from: 780, to: 1380 },
    brandingMethods: ['Embroidery', 'Woven label'],
  },
  {
    id: 'chef-coat',
    name: 'Double-Breasted Chef Coat',
    category: 'hospitality-uniforms',
    categoryLabel: 'Restaurant & Hotel',
    summary:
      'Long-sleeve chef coat in wash-durable cotton-rich twill with heat-resistant buttons.',
    colors: [WHITE, BLACK, CHARCOAL],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    fabrics: ['Cotton-rich twill', 'Poly-cotton twill'],
    moq: 40,
    indicativePriceInr: { from: 720, to: 1240 },
    brandingMethods: ['Embroidery', 'Woven label', 'No branding'],
  },
  {
    id: 'match-jersey',
    name: 'Team Match Jersey',
    category: 'sports-jerseys',
    categoryLabel: 'Sports Jerseys',
    summary:
      'Moisture-managing knit jersey with raglan panels, numbers, names and sponsor placements.',
    colors: [NAVY, BURGUNDY, WHITE, BOTTLE, GREY],
    sizes: ['22', '24', '26', '28', 'S', 'M', 'L', 'XL', 'XXL'],
    fabrics: ['Dri-fit interlock', 'Polyester micro-mesh'],
    moq: 25,
    indicativePriceInr: { from: 330, to: 640 },
    brandingMethods: ['Heat transfer', 'Screen printing', 'Embroidery'],
  },
  {
    id: 'track-set',
    name: 'Training Track Set',
    category: 'sports-jerseys',
    categoryLabel: 'Sports Jerseys',
    summary:
      'Jacket and jogger set in brushed polyester with side taping and zip pockets.',
    colors: [NAVY, BLACK, CHARCOAL, BURGUNDY],
    sizes: ['24', '26', '28', 'S', 'M', 'L', 'XL', 'XXL'],
    fabrics: ['Brushed NS lycra', 'Polyester tricot'],
    moq: 30,
    indicativePriceInr: { from: 880, to: 1480 },
    brandingMethods: ['Embroidery', 'Heat transfer'],
  },
]

export function productsByCategory(slug: Product['category']): Product[] {
  return PRODUCTS.filter((p) => p.category === slug)
}

/** Shown on the homepage "Popular uniform solutions" grid. */
export const FEATURED_PRODUCT_IDS = [
  'school-blazer-set',
  'round-neck-tee',
  'corporate-polo',
  'service-waistcoat',
  'match-jersey',
  'event-crew-kit',
]

export const FEATURED_PRODUCTS = FEATURED_PRODUCT_IDS.map(
  (id) => PRODUCTS.find((p) => p.id === id)!,
).filter(Boolean)

export const PROCESS_STEPS: ProcessStep[] = [
  {
    step: 1,
    title: 'Share requirements',
    description:
      'Tell us the roles to be dressed, garment types, rough quantities, colours and the date you need stock by.',
  },
  {
    step: 2,
    title: 'Approve design or sample',
    description:
      'We put together fabric options and a branding mock-up, then produce a sample set for you to sign off.',
  },
  {
    step: 3,
    title: 'Confirm sizes & quantity',
    description:
      'Run a size set across your team, lock the final size-wise breakup and confirm the order quantity.',
  },
  {
    step: 4,
    title: 'Production & delivery',
    description:
      'Bulk production runs against the approved sample, with packing and dispatch to the locations you nominate.',
  },
]

export const CUSTOMIZATION_OPTIONS: CustomizationOption[] = [
  {
    id: 'screen-printing',
    title: 'Screen printing',
    description:
      'Ink pushed through a prepared screen, one screen per colour. Holds up well on cotton and cotton-rich knits over repeated washes.',
    bestFor: 'Large runs with a fixed, limited-colour logo',
  },
  {
    id: 'embroidery',
    title: 'Embroidery',
    description:
      'Your artwork digitised into a stitch file and sewn directly into the garment. Gives a raised, textured finish on chest, sleeve or cap panels.',
    bestFor: 'Blazers, polos, waistcoats, chef coats and caps',
  },
  {
    id: 'heat-transfer',
    title: 'Heat transfer',
    description:
      'Artwork cut or printed onto transfer film and pressed onto the garment. Handles gradients, photographic detail and per-piece names and numbers.',
    bestFor: 'Jerseys with player names, numbers and sponsor marks',
  },
  {
    id: 'fabric-colour',
    title: 'Fabric & colour selection',
    description:
      'Pick GSM, weave and finish per garment, then match shades against a physical swatch before bulk so repeat orders stay on tone.',
    bestFor: 'House colours and brand-matched palettes',
  },
  {
    id: 'size-runs',
    title: 'Custom size runs',
    description:
      'Size sets produced from your own measurement chart, including extended and youth sizes, so fit is checked before the bulk cut.',
    bestFor: 'Mixed teams and non-standard fit requirements',
  },
]

export const INDUSTRIES: Industry[] = [
  {
    id: 'education',
    name: 'Education',
    description:
      'Schools, colleges and training institutes running a full uniform programme across an academic session.',
    needs: [
      'Session-wide supply against one approved spec',
      'House colours, crests and class-wise variants',
      'Size sets for new admissions and mid-year joiners',
    ],
    relatedCategory: 'school-college-uniforms',
  },
  {
    id: 'corporate',
    name: 'Corporate teams',
    description:
      'Offices, retail floors, facility teams and field staff who need a consistent, brand-matched look.',
    needs: [
      'Role-wise dress codes across locations',
      'Onboarding kits for new joiners',
      'Repeat top-ups on the same approved spec',
    ],
    relatedCategory: 'custom-tshirts',
  },
  {
    id: 'hospitality',
    name: 'Hospitality',
    description:
      'Hotels, restaurants, cafes, cloud kitchens and banquet operators dressing several departments at once.',
    needs: [
      'Department-wise uniform sets',
      'Fabrics selected for industrial laundering',
      'Trims and piping that carry the property identity',
    ],
    relatedCategory: 'hospitality-uniforms',
  },
  {
    id: 'events',
    name: 'Events',
    description:
      'Agencies, conference organisers and brand teams producing crew and delegate merchandise to a date.',
    needs: [
      'Crew apparel plus caps, lanyards and bags',
      'Artwork applied consistently across item types',
      'Delivery planned backwards from the event date',
    ],
    relatedCategory: 'event-merchandise',
  },
  {
    id: 'sports',
    name: 'Sports',
    description:
      'School teams, clubs, academies and corporate tournaments kitting out squads for a season or a fixture.',
    needs: [
      'Match and training kit in one colourway',
      'Player names, numbers and sponsor placements',
      'Youth through adult sizing in the same run',
    ],
    relatedCategory: 'sports-jerseys',
  },
]

export const TRUST_POINTS = [
  {
    id: 'bulk',
    title: 'Bulk-order support',
    description: 'Enquiries handled at wholesale volumes, with size-wise breakups.',
  },
  {
    id: 'branding',
    title: 'Custom embroidery & printing',
    description: 'Your logo applied by embroidery, screen print or heat transfer.',
  },
  {
    id: 'sizes',
    title: 'Flexible size ranges',
    description: 'Youth through extended adult sizes within the same order.',
  },
  {
    id: 'assistance',
    title: 'Dedicated order assistance',
    description: 'One point of contact from enquiry through to dispatch.',
  },
] as const

export const BRANDING_METHODS = [
  'Screen printing',
  'Embroidery',
  'Heat transfer',
  'Woven label',
  'No branding',
] as const

export const CUSTOMER_TYPES = [
  'School / College',
  'Corporate',
  'Hospitality',
  'Event agency',
  'Sports team',
  'Reseller',
  'Other',
] as const
