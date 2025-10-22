
import inquirer from 'inquirer';
import chalk from 'chalk';
import boxen from 'boxen';
import { runVersionCommand } from '../commands/version';
import { getTheme } from '../config/theme';
import { capturesMenu } from './capturesMenu';


export async function mainMenu() {
  const theme = getTheme();
  const choices = [
    { name: chalk.hex(theme.versionColor)('  Check API Version  '), value: 'checkVersion' },
    { name: chalk.hex(theme.gradient[0])('  📝 Captures  '), value: 'captures' },
    { name: chalk.hex(theme.mottoColor)('  Exit  '), value: 'exit' },
  ];
  while (true) {
    // Add vertical space before menu
    console.log('\n\n');
    // Render menu title in a box with theme color
    const menuTitle = boxen(
      chalk.hex(theme.borderColor).bold('Main Menu'),
      {
        padding: { top: 1, bottom: 1, left: 6, right: 6 },
        margin: { top: 1, bottom: 1 },
        borderColor: theme.borderColor,
        borderStyle: 'round',
        backgroundColor: undefined,
      }
    );
    console.log(menuTitle);
    // Add more vertical space after title
    console.log('\n');
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: chalk.hex(theme.gradient[1])('Select an action:'),
        choices,
        pageSize: 6,
      },
    ]);
    console.log('\n');
    if (action === 'checkVersion') {
      await runVersionCommand();
    } else if (action === 'captures') {
      await capturesMenu();
    } else if (action === 'exit') {
      console.log(chalk.hex(theme.mottoColor)('\nGoodbye!\n'));
      process.exit(0);
    }
  }
}
