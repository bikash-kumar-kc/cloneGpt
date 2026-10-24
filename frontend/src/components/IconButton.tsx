import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "ghost" | "primary" | "solid";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
  active?: boolean; // highlighted (blue) state
}

const base =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  // transparent, hover background (plus / volume buttons)
  ghost:
    "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700",
  // blue filled (send, active mic, active volume)
  primary: "bg-blue-500 text-white hover:bg-blue-600",
  // black/white filled (idle mic)
  solid:
    "bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200",
};

export default function IconButton({
  children,
  variant = "ghost",
  active = false,
  className = "",
  type = "button",
  ...props
}: IconButtonProps) {
  const style = active ? variants.primary : variants[variant];

  return (
    <button type={type} className={`${base} ${style} ${className}`} {...props}>
      {children}
    </button>
  );
}