import inquirer from 'inquirer';
import chalk from 'chalk';
import boxen from 'boxen';
import { getTheme } from '../config/theme';
import { createDumpCommand, runDumpSession } from '../commands/dump';
import { setConfig } from '../config/config';
import { mainMenu } from './mainMenu';

interface DashboardState {
  isRunning: boolean;
}

export async function divergentDashboard(): Promise<void> {
  const theme = getTheme();
  const state: DashboardState = { isRunning: true };
  
  // Clear screen and show dashboard
  process.stdout.write('\x1Bc');
  
  while (state.isRunning) {
    showDashboardHeader(theme);
    await handleDashboardInput(state, theme);
  }
}

function showDashboardHeader(theme: any): void {
  // Get terminal width once
  const terminalWidth = process.stdout.columns || 80;
  
  // Render centered dashboard title in powder blue
  const title = '🌊 DIVERGENT FLOW DASHBOARD';
  // Account for emoji taking up extra space
  const titleDisplayLength = title.length - 1; // Emoji counts as 2 chars but displays as 1
  const padding = Math.max(0, Math.floor((terminalWidth - titleDisplayLength) / 2));
  const centeredTitle = ' '.repeat(padding) + chalk.hex(theme.gradient[1]).bold(title);
  
  console.log('\n');
  console.log(centeredTitle);
  console.log('');
  
  // Text input area with box
  const textBox = boxen(
    chalk.hex(theme.gradient[1])('Type your thoughts and press Enter to capture...\n') +
    chalk.hex(theme.mottoColor)('(Multi-line? Start with more than one character)'),
    {
      padding: { top: 0, bottom: 0, left: 2, right: 2 },
      margin: { top: 1, bottom: 1 },
      borderColor: theme.versionColor,
      borderStyle: 'single',
      backgroundColor: undefined,
      title: '📝 Quick Capture',
      titleAlignment: 'left',
    }
  );
  
  // Center the text box
  const boxWidth = 80; // Approximate width of the boxen
  const boxPadding = Math.max(0, Math.floor((terminalWidth - boxWidth) / 2));
  const boxIndent = ' '.repeat(boxPadding);
  const centeredBox = textBox.split('\n').map(line => boxIndent + line).join('\n');
  
  console.log(centeredBox);
  
  // Minimal menu at bottom (centered)
  const menu = chalk.hex(theme.mottoColor)('Commands: ') +
    chalk.hex(theme.gradient[0])('s') + chalk.hex(theme.mottoColor)('ession | ') +
    chalk.hex(theme.gradient[0])('t') + chalk.hex(theme.mottoColor)('ypical | ') +
    chalk.hex(theme.gradient[0])('?') + chalk.hex(theme.mottoColor)(' help | ') +
    chalk.hex(theme.gradient[0])('q') + chalk.hex(theme.mottoColor)(' quit dflw');
  
  const menuStripped = menu.replace(/\x1b\[[0-9;]*m/g, '');
  const menuPadding = Math.max(0, Math.floor((terminalWidth - menuStripped.length) / 2));
  const menuIndent = ' '.repeat(menuPadding);
  
  console.log('\n' + menuIndent + menu + '\n');
}

async function handleDashboardInput(state: DashboardState, theme: any): Promise<void> {
  const { input } = await inquirer.prompt<{ input: string }>([
    {
      type: 'input',
      name: 'input',
      message: chalk.hex(theme.gradient[1])('❯'),
    },
  ]);

  // Handle empty input
  if (!input || input.trim().length === 0) {
    return;
  }

  // Single letter commands
  if (input.length === 1) {
    await handleSingleCharCommand(input.toLowerCase(), state, theme);
  } else {
    // Multi-character input = capture text
    await handleTextCapture(input, theme);
  }
}

async function handleSingleCharCommand(cmd: string, state: DashboardState, theme: any): Promise<void> {
  switch (cmd) {
    case 's':
      console.log(chalk.hex(theme.gradient[1])('\n🔥 Starting dump session...'));
      await runDumpSession();
      break;
    
    case 't':
      console.log(chalk.hex(theme.gradient[1])('\n🔄 Switching to typical mode...'));
      setConfig('APP_MODE', 'typical');
      state.isRunning = false;
      process.stdout.write('\x1Bc');
      await mainMenu();
      return;
    
    case '?':
      showHelpMenu(theme);
      await waitForKeyPress();
      break;
    
    case 'q':
      console.log(chalk.hex(theme.mottoColor)('\n👋 Goodbye!\n'));
      state.isRunning = false;
      return;
    
    default:
      console.log(chalk.yellow(`Unknown command: ${cmd}`));
      await new Promise(resolve => setTimeout(resolve, 1000));
      break;
  }
  
  // Clear screen after command
  if (state.isRunning) {
    process.stdout.write('\x1Bc');
  }
}

async function handleTextCapture(text: string, theme: any): Promise<void> {
  try {
    const dumpCommand = await createDumpCommand();
    const success = await dumpCommand.quickCapture(text);
    
    if (success) {
      console.log(chalk.hex(theme.versionColor)('✓ Captured!'));
    }
    
    // Brief pause to show feedback
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Clear screen for next input
    process.stdout.write('\x1Bc');
  } catch (error) {
    console.log(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
    await new Promise(resolve => setTimeout(resolve, 2000));
    process.stdout.write('\x1Bc');
  }
}

function showHelpMenu(theme: any): void {
  const helpContent = 
    chalk.hex(theme.gradient[0]).bold('DIVERGENT MODE HELP') + '\n\n' +
    chalk.hex(theme.gradient[1])('📝 Quick Capture:') + '\n' +
    '  • Type any text and press Enter to capture\n' +
    '  • Multi-line text supported\n' +
    '  • All special characters preserved\n\n' +
    chalk.hex(theme.gradient[1])('🎯 Commands:') + '\n' +
    chalk.hex(theme.versionColor)('  s') + ' - Start dump session (continuous capture)\n' +
    chalk.hex(theme.versionColor)('  t') + ' - Switch to typical mode\n' +
    chalk.hex(theme.versionColor)('  ?') + ' - Show this help menu\n' +
    chalk.hex(theme.versionColor)('  q') + ' - Quit dflw\n\n' +
    chalk.hex(theme.mottoColor)('Press any key to continue...');
    
  const helpBox = boxen(helpContent, {
    padding: { top: 1, bottom: 1, left: 2, right: 2 },
    margin: { top: 1, bottom: 1 },
    borderColor: theme.borderColor,
    borderStyle: 'double',
  });
  
  console.log(helpBox);
}

async function waitForKeyPress(): Promise<void> {
  await inquirer.prompt<{ continue: string }>([
    {
      type: 'input',
      name: 'continue',
      message: '',
    },
  ]);
}
