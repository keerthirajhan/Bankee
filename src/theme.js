import { StyleSheet } from 'react-native';

// Bänkee palette: soft lilac header band, deep plum actions, white cards.
// C is mutated in place by applyTheme(); the app is remounted on a theme change.
const LIGHT = {
  bg: '#F7F2FB', // very light lilac - the rounded sheet
  card: '#FFFFFF',
  card2: '#EBDDF5',
  border: '#E1D0EE',
  text: '#2A1740', // deep plum text
  sub: '#7A6890',
  band: '#B88EDC', // lilac header band
  primary: '#3A2352', // deep plum (buttons, active states)
  primary2: '#7B4FB0', // violet (links, accents)
  mint: '#2E9E6B', // income
  coral: '#E5484D', // expense / errors
  amber: '#F2A33A',
  blue: '#7B4FB0', // chart highlight
  pink: '#D36FB5',
  onBand: '#4A2F68', // secondary text on the header band
  expBand: '#7A1F4F', // expense figures on the header band
};

const DARK = {
  bg: '#150F1E',
  card: '#211833',
  card2: '#2D2142',
  border: '#3A2C52',
  text: '#F4ECFB',
  sub: '#B5A5CC',
  band: '#4B2F72',
  primary: '#8B5CC6',
  primary2: '#CDA8F2',
  mint: '#3FCB8F',
  coral: '#FF6B73',
  amber: '#F2A33A',
  blue: '#CDA8F2',
  pink: '#E884C6',
  onBand: '#EBDDF8',
  expBand: '#FFB0BD',
};

const GRADS = {
  light: { main: ['#4A2F68', '#2F1C45'], band: ['#C7A3E6', '#A678D0'], hero: ['#F7F2FB', '#E6D3F3'] },
  dark: { main: ['#8B5CC6', '#6E45A8'], band: ['#5A3A86', '#43285F'], hero: ['#150F1E', '#241838'] },
};

export const C = { ...LIGHT };
export const GRADIENT = [...GRADS.light.main]; // plum buttons
export const GRADIENT_BAND = [...GRADS.light.band]; // lilac cards
export const GRADIENT_MINT = GRADIENT;
export const GRADIENT_HERO = [...GRADS.light.hero];
export const R = { sm: 10, md: 18, lg: 28 };

export const T = { mode: 'light', version: 1 };

export function applyTheme(mode) {
  if (T.mode === mode) return;
  T.mode = mode;
  T.version += 1;
  Object.assign(C, mode === 'dark' ? DARK : LIGHT);
  const g = GRADS[mode];
  GRADIENT.splice(0, 2, ...g.main);
  GRADIENT_BAND.splice(0, 2, ...g.band);
  GRADIENT_HERO.splice(0, 2, ...g.hero);
}

// StyleSheet that re-evaluates itself after a theme change
export const createStyles = (factory) => {
  let ver = -1;
  let cache = {};
  return new Proxy({}, {
    get(_, key) {
      if (ver !== T.version) {
        cache = StyleSheet.create(factory());
        ver = T.version;
      }
      return cache[key];
    },
  });
};
