import { Platform, TextStyle } from 'react-native';

// Apple San Francisco on iOS, clean sans-serif elsewhere
const FF = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'sans-serif',
});

// Apple HIG type scale
export const typography: Record<string, TextStyle> = {
  largeTitle: { fontFamily: FF, fontSize: 34, fontWeight: '700', letterSpacing: -0.5 },
  title1:     { fontFamily: FF, fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  title2:     { fontFamily: FF, fontSize: 22, fontWeight: '700', letterSpacing: -0.3 },
  title3:     { fontFamily: FF, fontSize: 20, fontWeight: '600' },
  headline:   { fontFamily: FF, fontSize: 17, fontWeight: '600' },
  body:       { fontFamily: FF, fontSize: 17, fontWeight: '400' },
  callout:    { fontFamily: FF, fontSize: 16, fontWeight: '400' },
  subhead:    { fontFamily: FF, fontSize: 15, fontWeight: '400' },
  footnote:   { fontFamily: FF, fontSize: 13, fontWeight: '400' },
  caption1:   { fontFamily: FF, fontSize: 12, fontWeight: '400' },
  caption2:   { fontFamily: FF, fontSize: 11, fontWeight: '400' },
  // Emphasis variants
  headlineBold: { fontFamily: FF, fontSize: 17, fontWeight: '700' },
  calloutBold:  { fontFamily: FF, fontSize: 16, fontWeight: '600' },
  subheadBold:  { fontFamily: FF, fontSize: 15, fontWeight: '600' },
  footnoteBold: { fontFamily: FF, fontSize: 13, fontWeight: '600' },
  caption1Bold: { fontFamily: FF, fontSize: 12, fontWeight: '600' },
  caption2Bold: { fontFamily: FF, fontSize: 11, fontWeight: '600' },
};
