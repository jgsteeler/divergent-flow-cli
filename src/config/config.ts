import fs from 'fs';
import path from 'path';

const HOME = process.env.HOME || process.env.USERPROFILE || '';
const RC_PATH = path.join(HOME, '.grindrc');

export type GrindConfig = {
  theme?: string;
  [key: string]: any;
};

// Load .grindrc (JSON or empty)
function loadRc(): GrindConfig {
  try {
    const raw = fs.readFileSync(RC_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

// Save .grindrc
function saveRc(config: GrindConfig) {
  fs.writeFileSync(RC_PATH, JSON.stringify(config, null, 2), 'utf-8');
}


// Get config value (rc > default)
export function getConfig(key: string, def?: any): any {
  const rc = loadRc();
  if (rc[key] !== undefined) return rc[key];
  return def;
}

// Set config value in rc
export function setConfig(key: string, value: any) {
  if (key === 'APP_MODE') {
    const allowed = ['divergent', 'typical'];
    if (!allowed.includes(String(value).toLowerCase())) {
      throw new Error(`APP_MODE must be one of: divergent, typical`);
    }
    value = String(value).toLowerCase();
  }
  const rc = loadRc();
  rc[key] = value;
  saveRc(rc);
}

// Expose rc path for CLI
export const grindRcPath = RC_PATH;
