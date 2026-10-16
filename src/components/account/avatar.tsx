function initials(name: string) {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]);
  return (letters.join("") || "?").toUpperCase();
}

/** Profile photo when there is one, otherwise initials on neon. */
export function Avatar({
  name,
  src,
  className = "size-8 rounded-lg text-[13px]",
}: {
  name: string;
  src?: string;
  className?: string;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- provider photos come from many hosts
      <img src={src} alt="" referrerPolicy="no-referrer" className={`shrink-0 object-cover ${className}`} />
    );
  }
  return (
    <span aria-hidden className={`grid shrink-0 place-items-center bg-neon font-display font-extrabold text-ink ${className}`}>
      {initials(name)}
    </span>
  );
}
