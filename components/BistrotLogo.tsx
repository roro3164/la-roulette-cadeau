import Image from "next/image";

type Props = {
  className?: string;
  /** Noir sur fond clair (défaut) ; `dark` : version claire sur fond sombre (pop-up gain). */
  variant?: "light" | "dark";
  priority?: boolean;
};

/** Logo officiel (`public/logo-bistrot-musees-header.webp`). */
export function BistrotLogo({
  className = "",
  variant = "light",
  priority = false,
}: Props) {
  const tone =
    variant === "dark"
      ? "brightness-0 invert opacity-95"
      : "brightness-0";

  return (
    <Image
      src="/logo-bistrot-musees-header.webp"
      alt="Le Bistrot des Musées"
      width={360}
      height={120}
      priority={priority}
      className={`h-auto object-contain object-center sm:object-left ${tone} ${className}`}
    />
  );
}
