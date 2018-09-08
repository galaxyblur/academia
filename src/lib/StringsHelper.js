import allStrings from '../json/strings.json';

// eslint-disable-next-line import/prefer-default-export
export function getStrings() {
  return allStrings[process.env.ART_FORM];
}
