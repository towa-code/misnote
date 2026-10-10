// Small field pieces shared by the question forms (register, edit).

// Explicit "必須" badge: clearer for students than a bare asterisk
export function RequiredBadge() {
  return (
    <span className="ml-1.5 rounded bg-primary px-1.5 py-px text-[10px] font-bold tracking-normal text-white">
      必須
    </span>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M6 8L1 3h10z" />
    </svg>
  );
}

export function SelectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted">
        <ChevronDownIcon />
      </span>
    </div>
  );
}
