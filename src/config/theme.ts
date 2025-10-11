// Central theme + color palette definitions
// NOTE: Color names are generic (GSC) to avoid referencing any protected brand names.
// Adjust or override as needed in future branding passes.
export const GSC_PRIMARY = '#004687';   // deep blue
export const GSC_SECONDARY = '#7BB2DD'; // powder blue
export const GSC_ACCENT = '#C09A5B';    // gold accent

export const GSC_PALETTE = [GSC_PRIMARY, GSC_SECONDARY, GSC_ACCENT] as const;

export const THEME = {
  name: 'gsc',
  gradient: GSC_PALETTE,
  versionColor: GSC_SECONDARY,
  mottoColor: GSC_ACCENT,
  borderColor: GSC_PRIMARY,
};

export type Theme = typeof THEME;
