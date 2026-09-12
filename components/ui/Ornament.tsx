/** The hairline-and-diamond divider that separates blocks in the comps. */
export function Ornament({ className = "" }: { className?: string }) {
  return (
    <div className={`rule-ornament ${className}`} aria-hidden="true">
      <svg width="16" height="8" viewBox="0 0 16 8" fill="none">
        <path
          d="M1 4h5l2-2 2 2h5"
          stroke="currentColor"
          strokeWidth="0.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.8"
        />
      </svg>
    </div>
  );
}
