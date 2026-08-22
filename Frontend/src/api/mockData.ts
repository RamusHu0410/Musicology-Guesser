import type { Composer, InstrumentationCategory, MapPoint, Region } from '../types/domain'

export const REGIONS: Region[] = [
  { id: 'central-europe', name: 'Central Europe' },
  { id: 'eastern-europe', name: 'Eastern Europe' },
  { id: 'western-europe', name: 'Western Europe' },
  { id: 'italy', name: 'Italy' },
  { id: 'russia', name: 'Russia' },
  { id: 'north-america', name: 'North America' },
]

export const INSTRUMENTATION_CATEGORIES: InstrumentationCategory[] = [
  { id: 'solo-piano', name: 'Solo Piano' },
  { id: 'string-quartet', name: 'String Quartet' },
  { id: 'orchestral', name: 'Orchestral' },
  { id: 'vocal-opera', name: 'Vocal / Opera' },
  { id: 'chamber', name: 'Chamber Ensemble' },
]

// Coordinate space the Europe map (EuropeMap.tsx) is drawn in — matches the pixel dimensions of
// europe-map.png so pin-drop distance scoring lines up with what's on screen.
export const MAP_VIEW_WIDTH = 570
export const MAP_VIEW_HEIGHT = 570

// A plain equirectangular projection over the lon/lat box europe-map.png covers (Iceland down to
// Crete, the mid-Atlantic to the Baltic states — estimated from the image's visible coastlines,
// not exact survey bounds). Good enough for a game at this scale — real coordinates rather than
// hand-guessed pixels, and it's what lets this map eventually take real lat/lon from a backend
// (see Documents/API_CONTRACT.md's `locationGuess` proposal).
const LON_MIN = -30
const LON_MAX = 40
const LAT_MIN = 35
const LAT_MAX = 71

export function projectLatLon(lat: number, lon: number): MapPoint {
  return {
    x: ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * MAP_VIEW_WIDTH,
    y: ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * MAP_VIEW_HEIGHT,
  }
}

// Real coordinates for each composer's home/working city — the same cities the backend's
// GET /api/cities carries, so this map lines up with actual geography rather than a guess.
const COMPOSER_CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  'bach-js': { lat: 51.7519, lon: 11.97 }, // Köthen
  'handel-gf': { lat: 51.5074, lon: -0.1278 }, // London
  'vivaldi-a': { lat: 45.4408, lon: 12.3155 }, // Venice
  'mozart-wa': { lat: 48.2082, lon: 16.3738 }, // Vienna
  'haydn-fj': { lat: 48.2082, lon: 16.3738 }, // Vienna
  'beethoven-l': { lat: 50.7374, lon: 7.0982 }, // Bonn
  'chopin-f': { lat: 39.7097, lon: 2.6225 }, // Valldemossa
  'brahms-j': { lat: 53.5511, lon: 9.9937 }, // Hamburg
  'tchaikovsky-p': { lat: 55.7558, lon: 37.6173 }, // Moscow
  'debussy-c': { lat: 48.8566, lon: 2.3522 }, // Paris
  'stravinsky-i': { lat: 59.9311, lon: 30.3609 }, // Saint Petersburg
}

// Composers based outside Europe (Copland, Glass) intentionally have no entry: the map itself
// doesn't picture them, so they're guessed via the separate "outside Europe" control instead.
export const COMPOSER_MAP_POINTS: Record<string, MapPoint> = Object.fromEntries(
  Object.entries(COMPOSER_CITY_COORDS).map(([composerId, { lat, lon }]) => [composerId, projectLatLon(lat, lon)]),
)

// era/regionId describe the composer, not the individual work — they're the authoritative
// answer key for those two scoring axes (see API_CONTRACT.md §1).
export const COMPOSERS: Composer[] = [
  { id: 'bach-js', name: 'Johann Sebastian Bach', era: 'baroque', regionId: 'central-europe' },
  { id: 'handel-gf', name: 'George Frideric Handel', era: 'baroque', regionId: 'western-europe' },
  { id: 'vivaldi-a', name: 'Antonio Vivaldi', era: 'baroque', regionId: 'italy' },
  { id: 'mozart-wa', name: 'Wolfgang Amadeus Mozart', era: 'classical', regionId: 'central-europe' },
  { id: 'haydn-fj', name: 'Franz Joseph Haydn', era: 'classical', regionId: 'central-europe' },
  { id: 'beethoven-l', name: 'Ludwig van Beethoven', era: 'classical', regionId: 'central-europe' },
  { id: 'chopin-f', name: 'Frédéric Chopin', era: 'romantic', regionId: 'eastern-europe' },
  { id: 'brahms-j', name: 'Johannes Brahms', era: 'romantic', regionId: 'central-europe' },
  { id: 'tchaikovsky-p', name: 'Pyotr Ilyich Tchaikovsky', era: 'romantic', regionId: 'russia' },
  { id: 'debussy-c', name: 'Claude Debussy', era: 'modern', regionId: 'western-europe' },
  { id: 'stravinsky-i', name: 'Igor Stravinsky', era: 'modern', regionId: 'russia' },
  { id: 'copland-a', name: 'Aaron Copland', era: 'modern', regionId: 'north-america' },
  { id: 'glass-p', name: 'Philip Glass', era: 'contemporary', regionId: 'north-america' },
]

export interface ClueContent {
  type: string
  label: string
  text: string
  attribution?: string
  /** Reasoning shown on the reveal screen, tying this clue back to the answer. Never shown pre-guess. */
  explanation: string
}

export interface ExcerptContent {
  roundId: string
  composerId: string
  seed: number
  caseNumber: number
  workTitle: string
  yearComposed: number
  instrumentationId: string
  /** Reasoning about the manuscript image itself, shown on the reveal screen as the clueId: null point. */
  manuscriptExplanation: string
  explanationSummary: string
  clues: ClueContent[]
}

export const EXCERPTS: ExcerptContent[] = [
  {
    roundId: 'excerpt-1',
    composerId: 'bach-js',
    seed: 1,
    caseNumber: 1,
    workTitle: 'Prelude and Fugue in C Minor, BWV 847',
    yearComposed: 1720,
    instrumentationId: 'chamber',
    manuscriptExplanation:
      'The dense, strictly imitative counterpoint packed into a small number of staves is typical of keyboard writing from this period, before Classical-era phrasing opened the texture up.',
    explanationSummary: 'Every clue points to a Baroque keyboard work built entirely from strict counterpoint.',
    clues: [
      {
        type: 'musical-characteristic',
        label: "A note on the piece's construction",
        text:
          'The opening subject is stated alone, then answered in strict imitation by each voice in turn, building to a dense four-part texture.',
        explanation:
          'This is a textbook fugue exposition — a hallmark of this composer, who wrote entire cycles of preludes and fugues in every key.',
      },
      {
        type: 'biographical',
        label: "A detail from the composer's day job",
        text:
          'At the time, he held a post as Kantor, composing a new cantata nearly every week for the city’s main churches.',
        explanation:
          'The Kantor post in Leipzig was this composer’s primary employment for the second half of his career.',
      },
    ],
  },
  {
    roundId: 'excerpt-2',
    composerId: 'handel-gf',
    seed: 2,
    caseNumber: 2,
    workTitle: 'Concerto Grosso in D major, Op. 6 No. 5',
    yearComposed: 1735,
    instrumentationId: 'orchestral',
    manuscriptExplanation:
      'The clear alternation between a small concertino group and the full string band, written out in short, tutti-heavy blocks, is characteristic of the concerto grosso form popular in this composer’s London output.',
    explanationSummary: 'The evidence describes a German-born, London-based composer writing for his own concert series.',
    clues: [
      {
        type: 'historical-event',
        label: 'Why the piece was written',
        text:
          'The piece was written for a London subscription concert series that the composer organized largely to fund his opera productions.',
        explanation:
          'This composer ran his own subscription concerts in London for decades, often to shore up the finances of his opera and oratorio ventures.',
      },
      {
        type: 'biographical',
        label: 'A detail about his adopted home',
        text:
          'Though born and trained on the continent, the composer had taken British citizenship a few years before writing this.',
        explanation:
          'He was naturalized as a British subject in 1727, cementing the London career for which he is best known.',
      },
    ],
  },
  {
    roundId: 'excerpt-3',
    composerId: 'vivaldi-a',
    seed: 3,
    caseNumber: 3,
    workTitle: 'Concerto for Violin and Strings in E major',
    yearComposed: 1717,
    instrumentationId: 'orchestral',
    manuscriptExplanation:
      'Rapid, idiomatic violin figuration set against simple repeating string accompaniment reflects this composer’s role as a working violinist writing concertos for his own students.',
    explanationSummary: 'The clues describe a violinist-composer writing for a Venetian institution he served for decades.',
    clues: [
      {
        type: 'biographical',
        label: 'Where he worked',
        text:
          'The composer worked for decades as violin teacher at a Venetian orphanage for girls, writing much of his output for their resident orchestra.',
        explanation:
          'This is the Ospedale della Pietà in Venice, where he taught and composed for most of his career.',
      },
      {
        type: 'musical-characteristic',
        label: 'A note on the form',
        text:
          'A single soloist trades rapid, virtuosic passagework with the full string ensemble in alternating blocks, a form the composer helped standardize.',
        explanation:
          'This ritornello-form solo concerto structure is the model he popularized across hundreds of concertos.',
      },
    ],
  },
  {
    roundId: 'excerpt-4',
    composerId: 'mozart-wa',
    seed: 4,
    caseNumber: 4,
    workTitle: 'Piano Sonata in C major, K. 545',
    yearComposed: 1787,
    instrumentationId: 'solo-piano',
    manuscriptExplanation:
      'The clean, balanced phrasing and light left-hand accompaniment are typical of Classical-era keyboard writing intended for teaching as much as performance.',
    explanationSummary: 'The evidence points to a famously fast-working Classical composer writing accessible keyboard music.',
    clues: [
      {
        type: 'anecdote',
        label: 'A story about his working speed',
        text:
          'The composer reportedly wrote pieces like this quickly, sometimes finishing a full work in the time it took a copyist to prepare the parts.',
        explanation: 'Stories of his speed and fluency as a composer are well documented from his contemporaries.',
      },
      {
        type: 'letter',
        label: 'A complaint in his own words',
        text:
          "In a letter from this year, he complained to his father about being constantly asked for 'easy' pieces for amateur pianists.",
        explanation:
          'His surviving correspondence with his father from this period frequently mentions requests for simple teaching pieces.',
      },
    ],
  },
  {
    roundId: 'excerpt-5',
    composerId: 'haydn-fj',
    seed: 5,
    caseNumber: 5,
    workTitle: 'String Quartet in D major, Op. 76 No. 5',
    yearComposed: 1795,
    instrumentationId: 'string-quartet',
    manuscriptExplanation:
      'The four independent, conversational voices trading melodic material are typical of the mature string quartet writing this composer is credited with establishing.',
    explanationSummary: 'The clues describe a long-serving court composer, freshly back from London, mourning a famous friend.',
    clues: [
      {
        type: 'biographical',
        label: 'A note on his career',
        text:
          'The composer spent most of his career employed by a single aristocratic family, isolated enough from Vienna that he later said he was ‘forced to become original.’',
        explanation:
          'This is his decades-long employment with the Esterházy family, often cited as the reason for his distinctive voice.',
      },
      {
        type: 'relationship',
        label: 'A personal loss',
        text:
          'By this point, a close friend and fellow composer, roughly his junior, had died a few years earlier — a loss he spoke of for the rest of his life.',
        explanation:
          'This refers to his friendship with a younger Classical-era composer who died in 1791, a loss he never stopped mentioning.',
      },
    ],
  },
  {
    roundId: 'excerpt-6',
    composerId: 'beethoven-l',
    seed: 6,
    caseNumber: 6,
    workTitle: 'Symphony No. 5 in C minor, Op. 67',
    yearComposed: 1808,
    instrumentationId: 'orchestral',
    manuscriptExplanation:
      'A short, insistent rhythmic motif dominating the opening bars, developed obsessively rather than simply repeated, is a signature of this composer’s mature orchestral style.',
    explanationSummary: 'The evidence describes a legendary, chaotic Vienna premiere and a motif-driven symphonic style.',
    clues: [
      {
        type: 'historical-event',
        label: 'The premiere',
        text:
          'This piece premiered at a marathon benefit concert in Vienna that also included two other now-famous large-scale premieres by the same composer, all in one freezing, under-rehearsed evening.',
        explanation:
          'The December 1808 Akademie concert is famous for its length, cold hall, and under-rehearsed orchestra, and for premiering several of his major works at once.',
      },
      {
        type: 'musical-characteristic',
        label: 'A structural fingerprint',
        text:
          'A four-note rhythmic cell introduced in the opening bars returns, transformed, in every subsequent movement.',
        explanation:
          'Building an entire multi-movement work from one small rhythmic cell is one of this composer’s best-known structural innovations.',
      },
    ],
  },
  {
    roundId: 'excerpt-7',
    composerId: 'chopin-f',
    seed: 7,
    caseNumber: 7,
    workTitle: 'Prelude in D-flat major, Op. 28 No. 15',
    yearComposed: 1838,
    instrumentationId: 'solo-piano',
    manuscriptExplanation:
      'The manuscript hand — cramped beaming, rightward-slanting stems — matches known autographs of this composer from the late 1830s.',
    explanationSummary: 'Every piece of evidence points to a Polish pianist-composer, in the years around 1838.',
    clues: [
      {
        type: 'contemporary-account',
        label: 'A pianist describes his playing',
        text: 'He played with a rubato that no other pianist could imitate...',
        attribution: 'Wilhelm von Lenz, 1842',
        explanation:
          'Lenz is describing this composer’s characteristic rubato, in which the left hand keeps strict time against a freely inflected right hand.',
      },
      {
        type: 'historical-event',
        label: 'Where the piece was finished',
        text: 'The winter of 1838–39 was spent in an abandoned monastery on Mallorca.',
        explanation:
          'The Mallorca winter is when the Op. 28 Preludes were completed, at the Valldemossa charterhouse.',
      },
    ],
  },
  {
    roundId: 'excerpt-8',
    composerId: 'brahms-j',
    seed: 8,
    caseNumber: 8,
    workTitle: 'Symphony No. 1 in C minor, Op. 68',
    yearComposed: 1876,
    instrumentationId: 'orchestral',
    manuscriptExplanation:
      'Dense, developmental orchestral writing that avoids easy repetition reflects the weight this composer felt writing his first symphony under the shadow of an earlier master.',
    explanationSummary: 'The clues describe a decades-long symphonic struggle and a lifelong friendship with a composer’s widow.',
    clues: [
      {
        type: 'anecdote',
        label: 'Why it took so long',
        text:
          'The composer reportedly took over two decades to finish this piece, dreading comparison to a predecessor he revered above all others.',
        explanation:
          'He is famous for delaying his first symphony for roughly 20 years, wary of being compared to Beethoven.',
      },
      {
        type: 'relationship',
        label: 'A lifelong friendship',
        text:
          'He remained close, for his entire adult life, with the widow of another Romantic-era composer who had championed his early work.',
        explanation:
          'This is his lifelong friendship with Clara Schumann, widow of Robert Schumann, who first championed him publicly.',
      },
    ],
  },
  {
    roundId: 'excerpt-9',
    composerId: 'tchaikovsky-p',
    seed: 9,
    caseNumber: 9,
    workTitle: 'Symphony No. 5 in E minor, Op. 64',
    yearComposed: 1888,
    instrumentationId: 'orchestral',
    manuscriptExplanation:
      'A single, recurring theme reappearing across contrasting movements, always fully orchestrated, matches this composer’s cyclic approach to symphonic form.',
    explanationSummary: 'The evidence points to a Russian symphonist and his unusual, distant patronage arrangement.',
    clues: [
      {
        type: 'letter',
        label: 'His own description of the theme',
        text:
          "In letters from this period, he described a recurring melodic idea in the piece as a symbol of 'complete resignation before Fate.'",
        explanation:
          'His letters about this symphony’s recurring ‘Fate’ theme are well documented.',
      },
      {
        type: 'relationship',
        label: 'An unusual patronage',
        text:
          'For over a decade, his living expenses had been quietly covered by a wealthy patron he corresponded with constantly but, by her own request, never met in person.',
        explanation:
          'This describes his patron Nadezhda von Meck, who funded him for years under the condition they never meet face to face.',
      },
    ],
  },
  {
    roundId: 'excerpt-10',
    composerId: 'debussy-c',
    seed: 10,
    caseNumber: 10,
    workTitle: 'La Mer',
    yearComposed: 1905,
    instrumentationId: 'orchestral',
    manuscriptExplanation:
      'Ambiguous key signatures and modal, non-functional harmony rather than clear cadences point away from Romantic-era orchestral writing toward early Modernism.',
    explanationSummary: 'The evidence describes a composer breaking from traditional tonality toward color and atmosphere.',
    clues: [
      {
        type: 'criticism',
        label: 'A hostile review',
        text:
          'A leading critic of the day dismissed the piece’s premiere as more about atmosphere and color than about melody or form, a criticism the composer shrugged off.',
        explanation:
          'Contemporary French critics frequently accused this composer of favoring atmosphere over conventional melody and form.',
      },
      {
        type: 'musical-characteristic',
        label: 'A harmonic fingerprint',
        text:
          'Traditional major and minor scales give way to whole-tone and modal passages, blurring any single home key.',
        explanation:
          'Whole-tone and modal harmony, avoiding a strong sense of key, is one of this composer’s defining innovations.',
      },
    ],
  },
  {
    roundId: 'excerpt-11',
    composerId: 'stravinsky-i',
    seed: 11,
    caseNumber: 11,
    workTitle: 'The Rite of Spring',
    yearComposed: 1913,
    instrumentationId: 'orchestral',
    manuscriptExplanation:
      'Constantly shifting time signatures and dense, stacked dissonant chords, rather than smooth Romantic phrasing, mark this as an early-twentieth-century orchestral score.',
    explanationSummary: 'The evidence describes a scandalous Paris ballet premiere and a radically rhythmic style.',
    clues: [
      {
        type: 'historical-event',
        label: 'The premiere',
        text:
          'The piece’s premiere, staged as a ballet in Paris, provoked a near-riot in the theater — shouting and scuffling reportedly drowned out much of the orchestra.',
        explanation:
          'The 1913 Paris premiere of this ballet is one of the most famous scandals in concert history.',
      },
      {
        type: 'musical-characteristic',
        label: 'A rhythmic fingerprint',
        text:
          'Shifting, asymmetrical meters and dense, dissonant chords built from stacked triads replace the smooth phrasing of the previous century.',
        explanation:
          'Irregular meter and stacked-triad dissonance are hallmarks of this composer’s Russian-period ballets.',
      },
    ],
  },
  {
    roundId: 'excerpt-12',
    composerId: 'copland-a',
    seed: 12,
    caseNumber: 12,
    workTitle: 'Appalachian Spring',
    yearComposed: 1944,
    instrumentationId: 'orchestral',
    manuscriptExplanation:
      'Open, widely spaced chords and a spare, chamber-sized orchestration point to an American ballet score rather than a dense European Romantic one.',
    explanationSummary: 'The clues describe a wartime ballet commission and a distinctly American, wide-open harmonic sound.',
    clues: [
      {
        type: 'historical-event',
        label: 'How it was commissioned',
        text:
          'Commissioned as a ballet score during wartime, it was written for a stripped-down chamber orchestra due to the small pit at the theater where it premiered.',
        explanation:
          'This ballet was commissioned by Martha Graham during World War II and scored for a small ensemble for practical, wartime reasons.',
      },
      {
        type: 'musical-characteristic',
        label: 'A harmonic fingerprint',
        text:
          'Open, spacious harmonies and a quoted Shaker tune give the piece a distinctly rural, wide-horizon American sound.',
        explanation:
          'The quoted Shaker tune ‘Simple Gifts’ and open, spacious voicings are signatures of this composer’s Americana style.',
      },
    ],
  },
  {
    roundId: 'excerpt-13',
    composerId: 'glass-p',
    seed: 13,
    caseNumber: 13,
    workTitle: 'Einstein on the Beach (Knee Play 1)',
    yearComposed: 1976,
    instrumentationId: 'chamber',
    manuscriptExplanation:
      'Short, repeating melodic and rhythmic cells notated with minimal variation, rather than a developing melodic line, mark this as a minimalist score.',
    explanationSummary: 'The evidence describes a divisive, marathon-length minimalist opera built from repeating cells.',
    clues: [
      {
        type: 'criticism',
        label: 'Audience reactions',
        text:
          'Early audiences found the piece’s five-hour length and hypnotically repeating cells either mesmerizing or maddening — walkouts were common, but so were standing ovations.',
        explanation:
          'This opera’s extreme length and divisive reception are well documented from its 1976 premiere.',
      },
      {
        type: 'musical-characteristic',
        label: 'A structural fingerprint',
        text:
          'Short melodic and rhythmic patterns repeat with only gradual, incremental changes, rather than following traditional development or narrative form.',
        explanation:
          'This additive, gradually-shifting repetition is the defining technique of this composer’s minimalist style.',
      },
    ],
  },
]

export function getExcerpt(roundId: string): ExcerptContent | undefined {
  return EXCERPTS.find((excerpt) => excerpt.roundId === roundId)
}
