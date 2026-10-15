const PALETTES = [
  ['#9C4A56', '#C48992'],
  ['#7F3A45', '#B56872'],
  ['#5C3A40', '#9C4A56'],
  ['#8A404B', '#D4A8AE'],
  ['#3A2428', '#B05C68'],
  ['#9C4A56', '#E5D6D1'],
] as const

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}

export function coverGradient(seed: string): string {
  const palette = PALETTES[hashString(seed) % PALETTES.length]
  return `linear-gradient(145deg, ${palette[0]} 0%, ${palette[1]} 100%)`
}
