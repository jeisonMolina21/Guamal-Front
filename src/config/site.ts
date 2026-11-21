/**
 * Datos de contacto del sitio en un solo lugar.
 * Cambia PUBLIC_WHATSAPP_NUMBER en .env (solo dígitos con código de país, ej. 573001234567).
 */
const raw = (import.meta.env.PUBLIC_WHATSAPP_NUMBER as string | undefined) ?? '573001234567';
const digits = raw.replace(/\D/g, '');

function format(d: string) {
  // Colombia: +57 300 123 4567
  if (d.startsWith('57') && d.length === 12) return `+57 ${d.slice(2, 5)} ${d.slice(5, 8)} ${d.slice(8)}`;
  return `+${d}`;
}

export const SITE = {
  whatsapp: digits,
  phoneDisplay: format(digits),
  phoneHref: `tel:+${digits}`,
} as const;
