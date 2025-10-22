export { getConfig } from '../config/config';

import { getConfig, setConfig, grindRcPath } from '../config/config';
import inquirer from 'inquirer';


const REQUIRED_KEYS = [
  'APP_MODE',
  'API_BASE_URL',
  'LOG_LEVEL',
];

const GRIND_MODE_CHOICES = ['divergent', 'typical'];
const LOG_LEVEL_CHOICES = ['info', 'warn', 'error', 'debug'];

async function runInitWizard() {
  console.log('\n=== Divergent Flow CLI Initial Setup ===');
  const answers: Record<string, any> = await inquirer.prompt([
    {
      type: 'list',
      name: 'APP_MODE',
      message: 'Choose your APP_MODE:',
      choices: GRIND_MODE_CHOICES,
      default: getConfig('APP_MODE', 'divergent'),
    },
    {
      type: 'input',
      name: 'API_BASE_URL',
      message: 'Base API URL (e.g. http://localhost:3001):',
      default: getConfig('API_BASE_URL', 'http://localhost:3001'),
      validate: v => /^https?:\/\/.+/.test(v) || 'Enter a valid URL (http/https)',
    },
    {
      type: 'list',
      name: 'LOG_LEVEL',
      message: 'Log level:',
      choices: LOG_LEVEL_CHOICES,
      default: getConfig('LOG_LEVEL', 'info'),
    },
  ]);
  for (const key of REQUIRED_KEYS) {
    setConfig(key, answers[key]);
  }
  console.log('\nConfig saved to .grindrc!');
  console.log(JSON.stringify(answers, null, 2));
}

// Check for missing required config keys
export async function ensureConfigInitialized() {
  const missing = REQUIRED_KEYS.filter(k => getConfig(k) === undefined);
  if (missing.length > 0) {
    console.log('\nSome required config values are missing. Starting setup...');
    await runInitWizard();
  }
}

export async function runConfigCommand(args: string[]) {
  if (args.length === 0 || args[0] === 'list') {
    // Show all config (RC only)
    const fs = await import('fs');
    if (fs.existsSync(grindRcPath)) {
      const raw = fs.readFileSync(grindRcPath, 'utf-8');
      console.log('.grindrc:', raw);
    } else {
      console.log('No .grindrc file found.');
    }
    return;
  }
  if (args[0] === 'init') {
    await runInitWizard();
    return;
  }
  if (args[0] === 'get' && args[1]) {
    const val = getConfig(args[1]);
    console.log(`${args[1]}:`, val);
    return;
  }
  if (args[0] === 'set' && args[1] && args[2] !== undefined) {
    setConfig(args[1], args[2]);
    console.log(`Set ${args[1]} = ${args[2]} in .grindrc`);
    return;
  }
  console.log('Usage: config [list|get <key>|set <key> <value>|init]');
}
