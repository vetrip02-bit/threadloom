'use client'

import { EnquiryForm } from '@/components/quote/EnquiryForm'

export function CustomizationRequestForm() {
  return (
    <EnquiryForm
      source="customization"
      requirementsLabel="What would you like customised?"
      requirementsPlaceholder="Garments, colours, where the logo should sit, preferred branding method, and anything we should know about your artwork."
      submitLabel="Start customization request"
      successTitle="Customization request received"
      successBody="Thank you. Our team will review your artwork notes and come back with a branding recommendation and a mock-up."
    />
  )
}
