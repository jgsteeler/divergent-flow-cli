function printHelp() {
  console.log(`\nDivergent Flow CLI Usage\n`);
  console.log(`  npr dev [command] [options]\n`);
  console.log(`Commands:`);
  console.log(`  version           Show CLI version`);
  console.log(`  version api       Show API version (calls API)`);
  console.log(`  config [list|get <key>|set <key> <value>]  View or update CLI config (.grindrc)`);
  console.log(`  -h, --help        Show this help message\n`);
  console.log(`If no command is given, the interactive menu will launch.\n`);
}
import 'reflect-metadata';


import { showSplash } from './modules/splash/splash';
import { mainMenu } from './menus/mainMenu';
import { ensureConfigInitialized, getConfig } from './commands/config';


async function runCli() {
  showSplash();
  // Wait 1.5 seconds for splash effect
  await new Promise((res) => setTimeout(res, 1500));
  // Clear the terminal before showing the menu
  process.stdout.write('\x1Bc');
  await mainMenu();
}


async function routeCommand(args: string[]) {
  // npr dev version api => API version
  if (args[0] === 'version' && args[1] === 'api') {
    const { runVersionCommand } = await import('./commands/version');
    await runVersionCommand();
    process.exit(0);
  }
  // npr dev version => CLI version
  if (args[0] === 'version' && !args[1]) {
    const { printCliVersion } = await import('./commands/cliVersion');
    printCliVersion();
    process.exit(0);
  }
  // npr dev config ...
  if (args[0] === 'config') {
    const { runConfigCommand } = await import('./commands/config');
    await runConfigCommand(args.slice(1));
    process.exit(0);
  }
  // Add more direct command routes here as needed
  // Fallback to interactive CLI
  await runCli();
}

if (require.main === module) {
  (async () => {
    // Remove node, script, and npr/dev if present
    const argv = process.argv.slice(2).filter(arg => !['dev', 'start', 'run'].includes(arg));
    if (argv.includes('-h') || argv.includes('--help')) {
      printHelp();
      process.exit(0);
    }
    await ensureConfigInitialized();
  // API base URL is now handled in VersionService via config
    if (argv.length > 0) {
      await routeCommand(argv);
    } else {
      await runCli();
    }
  })();
}
