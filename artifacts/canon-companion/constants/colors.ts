/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    text: '#f4f1e9',
    tint: '#e4a84c',
    background: '#151614',
    foreground: '#f4f1e9',
    card: '#20211e',
    cardForeground: '#f4f1e9',
    primary: '#e4a84c',
    primaryForeground: '#1c1a16',
    secondary: '#292a26',
    secondaryForeground: '#e5e1d8',
    muted: '#292a26',
    mutedForeground: '#a09e96',
    accent: '#34332e',
    accentForeground: '#f4f1e9',
    destructive: '#e36f5d',
    destructiveForeground: '#fff9f3',
    border: '#393a35',
    input: '#393a35',
  },
  dark: {
    text: '#f4f1e9',
    tint: '#e4a84c',
    background: '#151614',
    foreground: '#f4f1e9',
    card: '#20211e',
    cardForeground: '#f4f1e9',
    primary: '#e4a84c',
    primaryForeground: '#1c1a16',
    secondary: '#292a26',
    secondaryForeground: '#e5e1d8',
    muted: '#292a26',
    mutedForeground: '#a09e96',
    accent: '#34332e',
    accentForeground: '#f4f1e9',
    destructive: '#e36f5d',
    destructiveForeground: '#fff9f3',
    border: '#393a35',
    input: '#393a35',
  },
  radius: 14,
};

export default colors;
