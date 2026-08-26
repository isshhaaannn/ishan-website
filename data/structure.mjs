// The merge map. Drive is filed by medium; this refiles it by client and craft.
// Edit here to change how the site groups work. Paths match assets/raw/<path>.

export const ROOMS = [
  { id: 'social',      name: 'Social',      note: 'Carousels, covers and campaign frames.' },
  { id: 'identity',    name: 'Identity',    note: 'Marks, systems and the decks that sold them.' },
  { id: 'advertising', name: 'Advertising', note: 'Product imagery made to move units.' },
  { id: 'objects',     name: 'Objects',     note: 'Print and packaging. The work you can hold.' },
  { id: 'studio',      name: 'Studio',      note: 'Unbriefed. Where the taste shows.' },
]

// A project is one browsable case study.
// `sources` are directories under assets/raw. `sections` split a project into named runs.
export const PROJECTS = [
  // ---------------------------------------------------------------- identity
  {
    id: 'vryks', room: 'identity', client: 'Vryks', title: 'Vryks',
    blurb: 'A creative studio built from the mark outward. Logo, pitch deck, print and the launch campaign.',
    alsoIn: ['social'],
    sections: [
      { name: 'Identity', src: 'logofolio/passion' },
      { name: 'Deck',     src: 'deck/passion' },
      { name: 'Film',     src: 'branding/passion' },
      { name: 'Print',    src: 'print-design/passion' },
      { name: 'Campaign', src: 'social-media-design/passion-carousels' },
    ],
  },
  {
    id: 'terribly-creative', room: 'identity', client: 'Terribly Creative', title: 'Terribly Creative',
    blurb: 'One mark, six lockups, three colourways.',
    sections: [{ name: 'Marks', src: 'logofolio/terribly-creative' }],
  },

  // ------------------------------------------------------------- advertising
  {
    id: 'firi', room: 'advertising', client: 'Firi', title: 'Firi',
    blurb: 'Skincare, ranked by 55 million reviews. Type big enough to read at a scroll.',
    sections: [{ name: 'Campaign', src: 'ad-creatives/firi' }],
  },
  {
    id: 'wild-oak', room: 'advertising', client: 'Wild Oak', title: 'Wild Oak Jeans',
    blurb: 'Direct response that does not look like direct response.',
    sections: [{ name: 'Campaign', src: 'ad-creatives/wild-oak-jeans' }],
  },
  {
    id: 'kelme', room: 'advertising', client: 'Kelme India', title: 'Kelme India',
    blurb: 'A full catalogue shoot with no studio, no model and no camera.',
    sections: [{ name: 'Shoot', src: 'ai-gen-photoshoot/kelme-india/white-polo-jersey' }],
  },

  // ----------------------------------------------------------------- objects
  {
    id: 'berribot', room: 'objects', client: 'Berribot', title: 'Berribot',
    blurb: 'Cards, brochure and a two metre backdrop, plus the hiring campaign that ran alongside.',
    alsoIn: ['social'],
    sections: [
      { name: 'Print',  src: 'print-design/berribot' },
      { name: 'Social', src: 'social-media-design/berribot' },
    ],
  },
  {
    id: 'packaging', room: 'objects', client: 'Various', title: 'Packaging',
    blurb: 'Boxes for a newspaper, a members club, a jeweller and a biryani house.',
    sections: [{ name: 'Boxes', src: 'packagefolio' }],
  },

  // ------------------------------------------------------------------ studio
  {
    id: 'jerseyfolio', room: 'studio', client: 'Personal', title: 'Jerseyfolio',
    blurb: 'Kit concepts, collaged. Football as a graphic language.',
    sections: [{ name: 'Sheets', src: 'jerseyfolio' }],
  },
  {
    id: 'wallpapers', room: 'studio', client: 'Personal', title: 'Wallpapers',
    blurb: 'Think. Design. Win. Made for his own screens first.',
    sections: [
      { name: 'Desktop', src: 'wallpaper-packs/pc' },
      { name: 'Phone',   src: 'wallpaper-packs/iphone' },
    ],
  },
]

// Social clients become projects automatically from the folder tree.
// These two are handled above as full case studies, so they are skipped here.
export const SOCIAL_HANDLED = ['passion-carousels', 'berribot']

// Display names and one-liners for the social roster.
export const SOCIAL_META = {
  'metromedia':       { title: 'MetroMedia',      blurb: 'Thirty carousels on taste, craft and why most marketing is invisible.' },
  'daily-mail':       { title: 'Daily Mail',      blurb: 'Editorial formats for a newsroom learning to speak in slides.' },
  'steven-bartlett':  { title: 'Steven Bartlett', blurb: 'Personal story turned into a scrollable sequence.' },
  'journey-club':     { title: 'Journey Club',    blurb: 'A rebrand pitch and the social system that came out of it.' },
  'arthur-brooks':    { title: 'Arthur Brooks',   blurb: 'Happiness research, set like a magazine.' },
  'chris-goode':      { title: 'Chris Goode',     blurb: 'Founder commentary with a straight face.' },
  'bizzie':           { title: 'Bizzie',          blurb: 'Product launch frames.' },
  'kane-kallaway':    { title: 'Kane Kallaway',   blurb: 'Creator covers built for the feed.' },
  'nik-stewart':      { title: 'Nik Stewart',     blurb: 'Short form covers.' },
  'seeit-ai-glasses': { title: 'SeeIt',           blurb: 'Launch creative for AI glasses.' },
  'euvc-thumbnails':  { title: 'eu.vc',           blurb: 'Podcast thumbnails for European venture.' },
  'euvc-posters':     { title: 'eu.vc Posters',   blurb: 'Event and episode posters.' },
  'byl-ventures':     { title: 'BYL Ventures',    blurb: 'Fund identity applied to social.' },
  'banners':          { title: 'Banners',         blurb: 'Header and link art.' },
  'reel-covers-1':    { title: 'Reel Covers',     blurb: 'Cover frames for short form.' },
  'christian':        { title: 'Christian',       blurb: 'Creator carousels.' },
}
