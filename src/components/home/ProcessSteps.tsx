import { PROCESS_STEPS } from '@/data/catalog'
import { Section, SectionHeading } from '@/components/ui/Section'

export function ProcessSteps() {
  return (
    <Section surface="ivory">
      <SectionHeading
        eyebrow="How it works"
        title="From brief to bulk delivery"
        description="A predictable four-step route from your first enquiry to uniforms on the floor."
      />

      <ol className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {PROCESS_STEPS.map((step) => (
          <li key={step.step} className="relative">
            <div className="flex items-center gap-4">
              <span
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-navy text-[14px] font-semibold text-navy"
              >
                {step.step}
              </span>
              <span aria-hidden="true" className="h-px flex-1 bg-hairline" />
            </div>
            <h3 className="mt-5 text-[16px] font-semibold text-navy">
              <span className="sr-only">Step {step.step}: </span>
              {step.title}
            </h3>
            <p className="mt-2.5 text-[13.5px] leading-7 text-charcoal">
              {step.description}
            </p>
          </li>
        ))}
      </ol>
    </Section>
  )
}
