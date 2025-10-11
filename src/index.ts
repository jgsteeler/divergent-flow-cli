
import { showSplash } from './modules/splash/splash';
import { mainMenu } from './menus/mainMenu';

async function runCli() {
  showSplash();
  // Wait a moment for splash effect
  await new Promise((res) => setTimeout(res, 900));
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
  // Add more direct command routes here as needed
  // Fallback to interactive CLI
  await runCli();
}

if (require.main === module) {
  // Remove node, script, and npr/dev if present
  const argv = process.argv.slice(2).filter(arg => !['dev', 'start', 'run'].includes(arg));
  if (argv.length > 0) {
    routeCommand(argv);
  } else {
    runCli();
  }
}
