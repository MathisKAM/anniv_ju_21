import type { OptionArtKind } from '../types'

/** Small line illustrations drawn in the background of an answer. They use currentColor. */
export function OptionArt({ kind }: { kind: OptionArtKind }) {
  return (
    <svg
      className="answer__art"
      viewBox="0 0 120 80"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {kind === 'computer' && (
        <>
          <rect x="42" y="20" width="36" height="36" rx="4" />
          <rect x="52" y="30" width="16" height="16" rx="2" />
          <path d="M50 20v-9M60 20v-9M70 20v-9M50 56v9M60 56v9M70 56v9M42 30h-9M42 40h-9M42 50h-9M78 30h9M78 40h9M78 50h9" />
          <path d="M33 40H18v-12h-8M87 30h15v18h10M60 65v8h24" />
          <circle cx="10" cy="28" r="2.4" />
          <circle cx="112" cy="48" r="2.4" />
          <circle cx="84" cy="73" r="2.4" />
        </>
      )}
      {kind === 'network' && (
        <>
          <path d="M60 40 24 18M60 40l38-22M60 40 22 62M60 40l40 24M24 18 22 62M98 18l2 46" />
          <circle cx="60" cy="40" r="9" />
          <circle cx="24" cy="18" r="6" />
          <circle cx="98" cy="18" r="6" />
          <circle cx="22" cy="62" r="6" />
          <circle cx="100" cy="64" r="6" />
          <circle cx="60" cy="40" r="2.4" />
        </>
      )}
      {kind === 'servers' && (
        <>
          <rect x="30" y="8" width="60" height="18" rx="3" />
          <rect x="30" y="31" width="60" height="18" rx="3" />
          <rect x="30" y="54" width="60" height="18" rx="3" />
          <path d="M38 17h22M38 40h22M38 63h22" />
          <circle cx="75" cy="17" r="2" />
          <circle cx="83" cy="17" r="2" />
          <circle cx="75" cy="40" r="2" />
          <circle cx="83" cy="40" r="2" />
          <circle cx="75" cy="63" r="2" />
          <circle cx="83" cy="63" r="2" />
          <path d="M14 18v44M106 18v44" strokeDasharray="2 5" />
        </>
      )}
      {kind === 'telecom' && (
        <>
          <g transform="translate(66 30) scale(1.15) rotate(-35) translate(-60 -36)">
            <rect x="50" y="26" width="20" height="20" rx="3" />
            <rect x="22" y="29" width="22" height="14" rx="1.5" />
            <rect x="76" y="29" width="22" height="14" rx="1.5" />
            <path d="M44 36h6M70 36h6M33 29v14M87 29v14" />
            <path d="M60 46v8" />
          </g>
          <path d="M42 66a22 22 0 0 1 16 -12" />
          <path d="M34 74a34 34 0 0 1 28 -22" />
          <path d="M26 80a46 46 0 0 1 40 -32" />
        </>
      )}
    </svg>
  )
}
