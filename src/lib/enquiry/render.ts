import type { QuoteRequestInput } from '@/lib/validation/schemas'

/** Escapes text before it is placed into the HTML body of the email. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const SOURCE_LABEL: Record<QuoteRequestInput['source'], string> = {
  quote: 'Quote builder',
  contact: 'Contact page',
  customization: 'Customization request',
}

export function enquirySubject(input: QuoteRequestInput, reference: string): string {
  return (
    '[' + reference + '] ' +
    SOURCE_LABEL[input.source] +
    ' — ' +
    input.organization +
    ' (' +
    input.estimatedQuantity +
    ' pcs)'
  )
}

/** Plain-text body. Always sent, so the enquiry is readable in any client. */
export function enquiryText(input: QuoteRequestInput, reference: string): string {
  const lines: string[] = [
    'New enquiry — ' + SOURCE_LABEL[input.source],
    'Reference: ' + reference,
    '',
    'CONTACT',
    '  Name:         ' + input.firstName + ' ' + input.lastName,
    '  Organization: ' + input.organization,
    '  Email:        ' + input.email,
    '  Phone:        ' + input.phone,
    '  City:         ' + input.city,
    '',
    'REQUIREMENT',
    '  Estimated quantity: ' + input.estimatedQuantity + ' pcs',
    '  Expected by:        ' + (input.expectedDate || 'not specified'),
    '',
    input.requirements,
    '',
  ]

  if (input.items.length > 0) {
    lines.push('ITEMS (' + input.items.length + ')')
    input.items.forEach((item, index) => {
      lines.push('  ' + (index + 1) + '. ' + item.productName)
      lines.push('       Quantity: ' + item.quantity)
      if (item.color) lines.push('       Colour:   ' + item.color)
      if (item.sizes) lines.push('       Sizes:    ' + item.sizes)
      lines.push('       Branding: ' + item.brandingMethod)
      if (item.notes) lines.push('       Notes:    ' + item.notes)
    })
    lines.push('')
  } else {
    lines.push('ITEMS: none selected from the catalogue', '')
  }

  lines.push('Consent to be contacted: yes')
  lines.push('Reply directly to this email to reach the customer.')
  return lines.join('\n')
}

/** HTML body. Deliberately plain so it renders the same everywhere. */
export function enquiryHtml(input: QuoteRequestInput, reference: string): string {
  const e = escapeHtml
  const row = (label: string, value: string) =>
    '<tr><td style="padding:4px 14px 4px 0;color:#3E4147;font-size:13px;white-space:nowrap">' +
    e(label) +
    '</td><td style="padding:4px 0;color:#132238;font-size:13px;font-weight:600">' +
    e(value) +
    '</td></tr>'

  const items =
    input.items.length === 0
      ? '<p style="margin:0;color:#3E4147;font-size:13px">No catalogue items selected.</p>'
      : '<ol style="margin:0;padding-left:18px;color:#3E4147;font-size:13px;line-height:1.7">' +
        input.items
          .map((item) => {
            const detail = [
              'Qty ' + item.quantity,
              item.color ? 'Colour: ' + item.color : '',
              item.sizes ? 'Sizes: ' + item.sizes : '',
              'Branding: ' + item.brandingMethod,
              item.notes ? 'Notes: ' + item.notes : '',
            ]
              .filter(Boolean)
              .join(' &middot; ')
            return (
              '<li><strong style="color:#132238">' +
              e(item.productName) +
              '</strong><br>' +
              e(detail).replace(/&amp;middot;/g, '&middot;') +
              '</li>'
            )
          })
          .join('') +
        '</ol>'

  return [
    '<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:640px">',
    '<p style="margin:0 0 4px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#7A1F33">',
    e(SOURCE_LABEL[input.source]),
    '</p>',
    '<h1 style="margin:0 0 2px;font-size:20px;color:#132238">New enquiry</h1>',
    '<p style="margin:0 0 20px;font-size:12px;color:#3E4147">Reference ',
    e(reference),
    '</p>',
    '<h2 style="margin:0 0 8px;font-size:13px;color:#132238">Contact</h2>',
    '<table style="border-collapse:collapse;margin:0 0 20px">',
    row('Name', input.firstName + ' ' + input.lastName),
    row('Organization', input.organization),
    row('Email', input.email),
    row('Phone', input.phone),
    row('City', input.city),
    '</table>',
    '<h2 style="margin:0 0 8px;font-size:13px;color:#132238">Requirement</h2>',
    '<table style="border-collapse:collapse;margin:0 0 12px">',
    row('Estimated quantity', input.estimatedQuantity + ' pcs'),
    row('Expected by', input.expectedDate || 'not specified'),
    '</table>',
    '<p style="margin:0 0 20px;padding:12px 14px;background:#F7F4EF;border-radius:8px;color:#3E4147;font-size:13px;line-height:1.7;white-space:pre-wrap">',
    e(input.requirements),
    '</p>',
    '<h2 style="margin:0 0 8px;font-size:13px;color:#132238">Items</h2>',
    items,
    '<p style="margin:20px 0 0;padding-top:14px;border-top:1px solid #E8E8E8;color:#3E4147;font-size:12px">',
    'Reply directly to this email to reach the customer.',
    '</p>',
    '</div>',
  ].join('')
}
