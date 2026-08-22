export interface ComposerBio {
  born: number
  died?: number
  fact: string
}

export const COMPOSER_BIOS: Record<string, ComposerBio> = {
  'bach-js': {
    born: 1685,
    died: 1750,
    fact: 'Wrote systematic keyboard cycles that worked through every major and minor key.',
  },
  'handel-gf': {
    born: 1685,
    died: 1759,
    fact: 'German-born, but spent his career in London writing operas and oratorios.',
  },
  'vivaldi-a': {
    born: 1678,
    died: 1741,
    fact: 'A Catholic priest who taught violin at a Venice orphanage for girls.',
  },
  'mozart-wa': {
    born: 1756,
    died: 1791,
    fact: 'Composing and touring as a performer by the age of six.',
  },
  'haydn-fj': {
    born: 1732,
    died: 1809,
    fact: 'Spent decades employed by the same aristocratic family, the Esterházys.',
  },
  'beethoven-l': {
    born: 1770,
    died: 1827,
    fact: 'Kept composing masterpieces after going completely deaf.',
  },
  'schubert-f': {
    born: 1797,
    died: 1828,
    fact: 'Wrote over 600 songs in a career cut short at just 31.',
  },
  'chopin-f': {
    born: 1810,
    died: 1849,
    fact: 'Wove Polish polonaise and mazurka rhythms into almost everything he wrote for piano.',
  },
  'brahms-j': {
    born: 1833,
    died: 1897,
    fact: "Took over 20 years to finish his first symphony, daunted by Beethoven's legacy.",
  },
  'tchaikovsky-p': {
    born: 1840,
    died: 1893,
    fact: 'Blended Russian folk color with sweeping, unabashedly emotional melody.',
  },
  'debussy-c': {
    born: 1862,
    died: 1918,
    fact: 'Rejected traditional harmony rules in favor of color and atmosphere.',
  },
  'stravinsky-i': {
    born: 1882,
    died: 1971,
    fact: 'His ballet The Rite of Spring caused a riot at its 1913 premiere.',
  },
  'copland-a': {
    born: 1900,
    died: 1990,
    fact: 'Captured wide-open American landscapes in his orchestral scores.',
  },
  'glass-p': {
    born: 1937,
    fact: 'Pioneered minimalism: small musical cells repeated and slowly transformed.',
  },
}
