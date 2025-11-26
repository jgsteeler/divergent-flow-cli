import fs from 'fs';
import path from 'path';

const HOME = process.env.HOME || process.env.USERPROFILE || '';
const RC_PATH = path.join(HOME, '.grindrc');

export type GrindConfig = {
  theme?: string;
  [key: string]: any;
};

// Keys required by the application and not removable via the CLI
export const REQUIRED_KEYS = [
  'APP_MODE',
  'API_BASE_URL',
  'OIDC_ISSUER_URL',
  'OIDC_CLIENT_ID',
  'LOG_LEVEL',
];

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

// Remove a key from the rc file. Returns true if the key was removed, false if not present.
export function removeConfig(key: string): boolean {
  // Prevent removing required keys
  if (REQUIRED_KEYS.includes(key)) return false;
  const rc = loadRc() || {};
  // Distinguish between missing key and key set to undefined
  if (!Object.prototype.hasOwnProperty.call(rc, key)) return false;
  // Create a new object without the key to avoid mutating shared refs
  const { [key]: _removed, ...rest } = rc as { [k: string]: any };
  saveRc(rest);
  return true;
}

// Expose rc path for CLI
export const grindRcPath = RC_PATH;
