/** Petite rangée d’étoiles façon avis Google (décoratif). */
export function GoogleStarsRow() {
  return (
    <div
      className="flex items-center justify-center gap-0.5 py-1"
      aria-hidden
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className="h-5 w-5 text-amber-500"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.887a1 1 0 00-1.176 0l-3.976 2.887c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ))}
    </div>
  );
}
