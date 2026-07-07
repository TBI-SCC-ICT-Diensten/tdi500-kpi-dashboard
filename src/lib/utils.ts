import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * cn — de shadcn class-merge helper: clsx (conditionele classes) doorgegeven
 * aan tailwind-merge (dedupliceert conflicterende Tailwind-utilities, laatste
 * wint). Fundament voor elke shadcn-primitive (ui/*). tailwind-merge v2 =
 * Tailwind v3 (v3 van tailwind-merge is voor Tailwind v4 — bewust niet).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
