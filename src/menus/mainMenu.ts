import inquirer from 'inquirer';
import chalk from 'chalk';
import boxen from 'boxen';
import { runVersionCommand } from '../commands/version';
import { getTheme } from '../config/theme';
import { capturesMenu } from './capturesMenu';
import { setConfig } from '../config/config';
import { divergentDashboard } from './divergentDashboard';
import { container } from '../di/container';
import { ICaptureService } from '../interfaces/ICaptureService';


interface MenuState {
  isRunning: boolean;
}

export async function mainMenu() {
  const theme = getTheme();
  const state: MenuState = { isRunning: true };
  
  while (state.isRunning) {
    await showMenuHeader(theme);
    await handleMenuInput(state, theme);
  }
}

async function showMenuHeader(theme: any): Promise<void> {
  // Add vertical space before menu
  console.log('\n');
  
  // Get terminal width once
  const terminalWidth = process.stdout.columns || 80;
  
  // Render centered menu title in powder blue
  const title = '🏠 MAIN MENU';
  // Account for emoji taking up extra space
  const titleDisplayLength = title.length - 1; // Emoji counts as 2 chars but displays as 1
  const padding = Math.max(0, Math.floor((terminalWidth - titleDisplayLength) / 2));
  const centeredTitle = ' '.repeat(padding) + chalk.hex(theme.gradient[1]).bold(title);
  console.log(centeredTitle);
  console.log('');
  
  // Fetch and display unmigrated captures count
  await showUnmigratedCapturesNotification(theme, terminalWidth);
  
  // Two-column menu layout
  const leftCol = [
    chalk.hex(theme.gradient[0])('v') + chalk.hex(theme.mottoColor)(') API Version'),
    chalk.hex(theme.gradient[0])('c') + chalk.hex(theme.mottoColor)(') Captures'),
  ];
  
  const rightCol = [
    chalk.hex(theme.gradient[0])('d') + chalk.hex(theme.mottoColor)(') Divergent Mode'),
    '',
  ];
  
  // Calculate column width and centering
  const colWidth = 30;
  // Total menu width is approximately 2 columns
  const menuWidth = colWidth * 2;
  const leftPadding = Math.max(0, Math.floor((terminalWidth - menuWidth) / 2));
  const indent = ' '.repeat(leftPadding);
  
  console.log('\n');
  
  for (let i = 0; i < Math.max(leftCol.length, rightCol.length); i++) {
    const left = leftCol[i] || '';
    const right = rightCol[i] || '';
    // Strip ANSI codes to measure actual text length
    const leftStripped = left.replace(/\x1b\[[0-9;]*m/g, '');
    const padding = ' '.repeat(Math.max(0, colWidth - leftStripped.length));
    console.log(`${indent}${left}${padding}${right}`);
  }
  
  // Add quit option on separate line (centered)
  const quitLine = chalk.hex(theme.gradient[0])('q') + chalk.hex(theme.mottoColor)(') Quit dflw');
  console.log(`\n${indent}${quitLine}`);
  console.log('\n');
}

async function showUnmigratedCapturesNotification(theme: any, terminalWidth: number): Promise<void> {
  try {
    const captureService = container.resolve<ICaptureService>('ICaptureService');
    const captures = await captureService.listUnmigratedCaptures();
    
    if (captures.length > 0) {
      const notification = `📬 ${captures.length} unmigrated capture${captures.length === 1 ? '' : 's'} waiting`;
      const notificationPadding = Math.max(0, Math.floor((terminalWidth - notification.length) / 2));
      const centeredNotification = ' '.repeat(notificationPadding) + chalk.hex(theme.gradient[0])(notification);
      console.log(centeredNotification);
      console.log('');
    }
  } catch (error) {
    // Silently fail - don't disrupt menu if capture fetch fails
  }
}

async function handleMenuInput(state: MenuState, theme: any): Promise<void> {
  const { input } = await inquirer.prompt<{ input: string }>([
    {
      type: 'input',
      name: 'input',
      message: chalk.hex(theme.gradient[1])('Enter command:'),
    },
  ]);

  // Handle empty input
  if (!input || input.trim().length === 0) {
    return;
  }

  const cmd = input.trim().toLowerCase();
  await handleMenuCommand(cmd, state, theme);
}

async function handleMenuCommand(cmd: string, state: MenuState, theme: any): Promise<void> {
  switch (cmd) {
    case 'v':
    case 'version':
      console.log('\n');
      await runVersionCommand();
      console.log('\n');
      await waitForKeyPress(theme);
      process.stdout.write('\x1Bc');
      break;
    
    case 'c':
    case 'captures':
      process.stdout.write('\x1Bc');
      await capturesMenu();
      process.stdout.write('\x1Bc');
      break;
    
    case 'd':
    case 'divergent':
      console.log(chalk.hex(theme.gradient[1])('\n🔄 Switching to divergent mode...'));
      setConfig('APP_MODE', 'divergent');
      state.isRunning = false;
      process.stdout.write('\x1Bc');
      await divergentDashboard();
      return;
    
    case 'q':
    case 'quit':
    case 'exit':
      console.log(chalk.hex(theme.mottoColor)('\n👋 Goodbye!\n'));
      state.isRunning = false;
      process.exit(0);
      return;
    
    default:
      console.log(chalk.yellow(`\nUnknown command: ${cmd}`));
      await new Promise(resolve => setTimeout(resolve, 1000));
      break;
  }
}

async function waitForKeyPress(theme: any): Promise<void> {
  const message = chalk.hex(theme.mottoColor)('Press Enter to continue...');
  await inquirer.prompt<{ continue: string }>([
    {
      type: 'input',
      name: 'continue',
      message,
    },
  ]);
}
