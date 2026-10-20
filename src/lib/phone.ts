const DEFAULT_COUNTRY_CODE = '225'

/** Format international `+<indicatif><numéro>` ; un numéro local à 10 chiffres est considéré ivoirien. */
export function toE164(input: string): string | null {
  let value = input.trim().replace(/[\s.\-()]/g, '')
  if (value.startsWith('00')) value = `+${value.slice(2)}`
  const digits = value.replace(/^\+/, '')
  if (!/^\d+$/.test(digits)) return null
  if (!value.startsWith('+') && digits.length === 10) return `+${DEFAULT_COUNTRY_CODE}${digits}`
  if (digits.length < 8 || digits.length > 15) return null
  return `+${digits}`
}
