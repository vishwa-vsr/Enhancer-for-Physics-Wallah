"use client"

import { ShaderMetal } from "@/components/ui/shader-metal"

const settings = {
  color: "#F2F3F5",
  ribbons: 3,
  speed: 0.3,
  iridescence: 0.2,
  interactive: true,
}

export default function ShaderMetalDemo(props: Partial<typeof settings>) {
  const s = { ...settings, ...props }

  return (
    <div className="flex min-h-[520px] w-full items-center justify-center bg-background p-4">
      <div className="relative aspect-[16/9] min-h-[360px] w-full max-w-5xl overflow-hidden rounded-xl border border-border bg-background">
        <ShaderMetal
          metal="chrome"
          color={s.color}
          ribbons={s.ribbons}
          speed={s.speed}
          iridescence={s.iridescence}
          interactive={s.interactive}
        />
      </div>
    </div>
  )
}
