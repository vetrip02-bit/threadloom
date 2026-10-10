import { ANNOUNCEMENT } from '@/lib/site'

export function AnnouncementBar() {
  return (
    <div className="border-b border-hairline bg-ivory">
      <div className="shell flex min-h-9 items-center justify-center py-1.5">
        {/*
          Wraps rather than truncates: at 360px the message is wider than the
          viewport, and clipping it would hide "Enquire for volume pricing".
        */}
        <p className="text-balance text-center text-[11.5px] font-medium leading-5 tracking-[0.06em] text-navy sm:tracking-[0.08em] md:text-[12px]">
          {ANNOUNCEMENT}
        </p>
      </div>
    </div>
  )
}
