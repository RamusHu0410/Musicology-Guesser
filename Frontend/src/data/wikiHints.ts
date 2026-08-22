import type { EraId } from '../types/domain'

// Fun, beginner-facing one-liners — deliberately short, not textbook definitions. Keyed by id so
// they work whichever backend (mock or real) supplied the reference list, since the two disagree
// on which composers/regions exist.

export const ERA_HINTS: Record<EraId, string> = {
  medieval: 'Church chant, no fixed rhythm — ancient and echoey.',
  renaissance: 'Smooth, balanced vocal harmony — everything lines up neatly.',
  baroque: 'Ornate and busy, one musical idea explored obsessively.',
  classical: 'Clean, balanced, and orderly — powdered wigs optional.',
  romantic: 'Huge emotions, huge orchestras, dramatic swells.',
  modern: 'Rules broken on purpose — dissonance is the point.',
  contemporary: 'Anything goes: electronics, minimalism, or pure chaos.',
}

export const COMPOSER_HINTS: Record<string, string> = {
  'bach-js': 'Baroque math wizard — fugues stacked like musical Tetris.',
  'handel-gf': 'Baroque showman who wrote hits for kings.',
  'vivaldi-a': 'Red-headed priest who basically invented the concerto.',
  'mozart-wa': 'Child prodigy who never really grew out of it.',
  'haydn-fj': 'Father of the symphony — patient and endlessly inventive.',
  'beethoven-l': 'Went deaf, got louder. Pure stubborn genius.',
  'schubert-f': 'Wrote a masterpiece a day, died tragically young.',
  'chopin-f': 'Piano poet — delicate, homesick, occasionally devastating.',
  'brahms-j': "Beethoven's anxious heir, buried tunes in thick harmony.",
  'tchaikovsky-p': 'Melancholy melodies with unapologetically big emotions.',
  'debussy-c': 'Painted with sound — blurry, dreamy, un-Germanic.',
  'stravinsky-i': "Caused a riot with one ballet's rhythm.",
  'copland-a': 'Wide-open-prairie Americana in orchestral form.',
  'glass-p': 'Same pattern, repeated, slowly evolving. Minimalism.',
}

export const REGION_HINTS: Record<string, string> = {
  'central-europe': 'Vienna and Germany-ish — the classical power center.',
  'eastern-europe': 'Poland, Bohemia — folk melodies meet salon elegance.',
  'western-europe': 'France, England — refined, sometimes deliberately un-German.',
  italy: 'Where opera was born — melody above all.',
  russia: 'Vast, dramatic, folk-tinged, emotionally intense.',
  'north-america': 'New World sound — wide open and rhythmic.',
  austria: "Vienna's home turf — classical music headquarters.",
  germany: 'Bach, Beethoven, Brahms — the serious, structured heartland.',
  france: 'Elegant, colorful, allergic to German heaviness.',
  spain: 'Sun, guitars, and dramatic rhythmic flair.',
  'united-kingdom': 'Choral tradition and stubbornly independent taste.',
  poland: 'Folk dances dressed up in salon clothes.',
  czechia: 'Bohemian folk tunes turned into concert halls.',
  hungary: 'Gypsy scales and fiery, stomping rhythms.',
}

export const INSTRUMENTATION_HINTS: Record<string, string> = {
  'solo-piano': 'One performer, eighty-eight keys, nowhere to hide.',
  'string-quartet': 'Two violins, a viola, a cello — intimate chat.',
  orchestral: 'The whole band — strings, winds, brass, drama.',
  'vocal-opera': 'Singers carry the story, often at top volume.',
  chamber: 'A handful of instruments in close conversation.',
}
