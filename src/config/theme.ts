// Central theme + color palette definitions
// NOTE: Color names are generic (GSC) to avoid referencing any protected brand names.
// Adjust or override as needed in future branding passes.

import { getConfig } from './config';

export const GSC_PRIMARY = getConfig('THEME_PRIMARY', '#004687');   // deep blue
export const GSC_SECONDARY = getConfig('THEME_SECONDARY', '#7BB2DD'); // powder blue
export const GSC_ACCENT = getConfig('THEME_ACCENT', '#C09A5B');    // gold accent

export const GSC_PALETTE = [GSC_PRIMARY, GSC_SECONDARY, GSC_ACCENT] as const;

export function getTheme() {
  return {
    name: getConfig('THEME_NAME', 'gsc'),
    gradient: [
      getConfig('THEME_PRIMARY', '#004687'),
      getConfig('THEME_SECONDARY', '#7BB2DD'),
      getConfig('THEME_ACCENT', '#C09A5B'),
    ],
    versionColor: getConfig('THEME_SECONDARY', '#7BB2DD'),
    mottoColor: getConfig('THEME_ACCENT', '#C09A5B'),
    borderColor: getConfig('THEME_PRIMARY', '#004687'),
  };
}

export type Theme = ReturnType<typeof getTheme>;
