/**
 * Brand palette. The light values come from the Mantrika visual design —
 * do not adjust them for "better" contrast without checking the mock first.
 */
export const lightColors = {
  ink: '#3A1D16',
  muted: '#7A5F50',
  maroon: '#6B2F25',
  saffron: '#F0A254',
  saffronDark: '#C4681F',
  card: '#F5EDE3',
  line: '#E8DBCB',
  ground: '#FBF7F1',

  /** Text and icons drawn on a maroon fill. */
  onAccent: '#FFFFFF',
  /** Secondary text on a maroon fill. */
  onAccentMuted: '#E9C9B3',
  overlay: 'rgba(58,29,22,0.42)',
  overlayLight: 'rgba(50,20,10,0.22)',
  danger: '#B3261E',
  shadow: '#5A2819',

  /** Selected tab, compact chip and count badge. */
  highlight: '#FBE3C5',
  highlightInk: '#7A3E12',
  highlightBorder: 'rgba(240,162,84,0.45)',
  tabActiveInk: '#4A2118',

  surfaceSoft: '#F0E7DC',
  surfaceWarm: '#F8F1E8',
  surfaceSelected: '#F8EDE0',
  surfaceDeep: '#EBD7C1',
  /** Translucent panel over the mala. */
  glass: 'rgba(255,252,247,0.92)',

  inputBorder: '#DCCBB8',
  dashedBorder: '#C9B49B',
  pillBorder: '#E1D2C0',
  track: '#E0CEBB',
  trackOff: '#D8C7B4',
  knob: '#FBF7F1',
  trackMuted: '#C9B5A2',
  heatEmpty: '#EDE3D6',
  heatLow: '#F6D3A8',
};

export type Palette = typeof lightColors;
export type ColorToken = keyof Palette;

/**
 * Night palette, grown from eyes-closed mode's warm near-black. Maroon can't
 * carry text on a dark ground, so the accent turns to lamp-lit copper and
 * text on it turns dark.
 */
export const darkColors: Palette = {
  ink: '#F3E6D8',
  muted: '#B39A88',
  maroon: '#E3A877',
  saffron: '#F0A254',
  saffronDark: '#E58C45',
  card: '#22160F',
  line: '#3A2A20',
  ground: '#150D09',

  onAccent: '#1A0F0A',
  onAccentMuted: '#5A3420',
  overlay: 'rgba(0,0,0,0.62)',
  overlayLight: 'rgba(0,0,0,0.35)',
  danger: '#F2867D',
  shadow: '#000000',

  highlight: '#3D2616',
  highlightInk: '#F5C48F',
  highlightBorder: 'rgba(240,162,84,0.45)',
  tabActiveInk: '#F5C48F',

  surfaceSoft: '#1D130D',
  surfaceWarm: '#1E140E',
  surfaceSelected: '#2C1C13',
  surfaceDeep: '#33221A',
  glass: 'rgba(30,20,14,0.92)',

  inputBorder: '#4A3628',
  dashedBorder: '#5E4838',
  pillBorder: '#3A2A20',
  track: '#3A2A20',
  trackOff: '#4A3628',
  knob: '#F3E6D8',
  trackMuted: '#5E4838',
  heatEmpty: '#2A1C14',
  heatLow: '#5C3B22',
};
