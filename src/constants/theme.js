export const lightColors = {
  page: '#F8F7FC',
  lavender: '#D1CFE8',
  purple: '#705BAE',
  purpleDark: '#56438B',
  ink: '#24212C',
  muted: '#817B90',
  line: '#E9E6F0',
  white: '#FFFFFF',
  softPurple: '#EFECF8',
  danger: '#C75F6A',
  input: '#FCFBFE',
  inputBorder: '#E0DCE9',
  dangerSurface: '#FFF9F9',
};

export const darkColors = {
  page: '#15121B',
  lavender: '#2A2538',
  purple: '#B8A3EB',
  purpleDark: '#E0D6FF',
  ink: '#F5F0FC',
  muted: '#BEB6C9',
  line: '#3C3548',
  white: '#211D29',
  softPurple: '#302A40',
  danger: '#FF9EAA',
  input: '#292431',
  inputBorder: '#4A4257',
  dangerSurface: '#352329',
};

// A shared object lets existing components consistently read the active theme.
export const colors = { ...lightColors };

export function applyTheme(useDarkMode) {
  Object.assign(colors, useDarkMode ? darkColors : lightColors);
}
