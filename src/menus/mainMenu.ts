import inquirer from 'inquirer';
import { runVersionCommand } from '../commands/version';

export async function mainMenu() {
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
      await runVersionCommand();
    } else if (action === 'exit') {
      console.log('Goodbye!');
      process.exit(0);
    }
  }
}
