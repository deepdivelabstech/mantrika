/**
 * Brand palette. These exact values come from the Mantrika visual design —
 * do not adjust for "better" contrast without checking the mock first.
 */
export const colors = {
  ink: '#3A1D16',
  muted: '#7A5F50',
  maroon: '#6B2F25',
  saffron: '#F0A254',
  saffronDark: '#C4681F',
  card: '#F5EDE3',
  line: '#E8DBCB',
  ground: '#FBF7F1',

  white: '#FFFFFF',
  overlay: 'rgba(58,29,22,0.42)',
  overlayLight: 'rgba(50,20,10,0.22)',
  danger: '#B3261E',
} as const;

export type ColorToken = keyof typeof colors;
