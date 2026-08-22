// Generates a deterministic, answer-free "sheet music" placeholder image so the game
// works fully offline before the backend can serve real cropped excerpts.
function mulberry32(seed: number) {
  let a = seed
  return function random() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function generatePlaceholderScoreImage(seed: number): string {
  const random = mulberry32(seed)
  const width = 640
  const height = 240
  const staffTop = 70
  const staffGap = 16

  const lines = Array.from(
    { length: 5 },
    (_, i) =>
      `<line x1="24" y1="${staffTop + i * staffGap}" x2="${width - 24}" y2="${staffTop + i * staffGap}" stroke="#1e293b" stroke-width="1.5" />`,
  ).join('')

  const notes = Array.from({ length: 28 }, (_, i) => {
    const x = 48 + i * 21 + random() * 6
    const y = staffTop - staffGap + random() * (staffGap * 7)
    return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="5.5" ry="4" fill="#0f172a" transform="rotate(-15 ${x.toFixed(1)} ${y.toFixed(1)})" />`
  }).join('')

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="${width}" height="${height}" fill="#f8fafc" />
    ${lines}
    ${notes}
  </svg>`

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
