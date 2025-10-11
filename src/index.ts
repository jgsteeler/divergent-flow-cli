import inquirer from 'inquirer';
import { showSplash } from './modules/splash/splash';
import { VersionService } from './api-client/services/VersionService';

async function mainMenu() {
  const choices = [
    { name: 'Check API Version', value: 'checkVersion' },
    { name: 'Exit', value: 'exit' },
  ];
  while (true) {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Main Menu',
        choices,
      },
    ]);
    if (action === 'checkVersion') {
      try {
        const versionInfo = await VersionService.getVersion();
        console.log('\nAPI Version:', versionInfo.version);
        console.log('Service:', versionInfo.service);
        console.log('Timestamp:', versionInfo.timestamp, '\n');
      } catch (err) {
        console.error('Failed to fetch API version:', err);
      }
    } else if (action === 'exit') {
      console.log('Goodbye!');
      process.exit(0);
    }
  }
}

export async function runCli() {
  showSplash();
  // Wait a moment for splash effect
  await new Promise((res) => setTimeout(res, 900));
  await mainMenu();
}

// If run directly
if (require.main === module) {
  runCli();
}
