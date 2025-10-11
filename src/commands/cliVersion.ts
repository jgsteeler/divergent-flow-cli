import fs from 'fs';
import path from 'path';

export function getCliVersion(): string {
  try {
    const pkgPath = path.resolve(__dirname, '../../../package.json');
    const raw = fs.readFileSync(pkgPath, 'utf-8');
    const pkg = JSON.parse(raw);
    return pkg.version || '0.0.0';
  } catch {
    return '0.0.0';
  }
}

export function printCliVersion() {
  const version = getCliVersion();
  console.log(`CLI Version: ${version}`);
}
