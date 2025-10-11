import fs from 'fs';
import path from 'path';


export function getCliVersion(): string {
  // Try __dirname relative, then process.cwd()
  const tryPaths = [
    path.resolve(__dirname, '../../../package.json'),
    path.resolve(process.cwd(), 'package.json'),
  ];
  for (const pkgPath of tryPaths) {
    try {
      const raw = fs.readFileSync(pkgPath, 'utf-8');
      const pkg = JSON.parse(raw);
      if (pkg.version) return pkg.version;
    } catch {}
  }
  return '0.0.0';
}

export function printCliVersion() {
  const version = getCliVersion();
  console.log(`CLI Version: ${version}`);
}
