import inquirer from 'inquirer';
import chalk from 'chalk';
import boxen from 'boxen';
import { getTheme } from '../config/theme';
import { createDumpCommand, runDumpSession } from '../commands/dump';

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
  const title = boxen(
    chalk.hex(theme.gradient[0]).bold('🌊 DIVERGENT FLOW DASHBOARD'),
    {
      padding: { top: 1, bottom: 1, left: 4, right: 4 },
      margin: { top: 1, bottom: 1 },
      borderColor: theme.borderColor,
      borderStyle: 'round',
      backgroundColor: undefined,
    }
  );
  
  console.log(title);
  
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
  
  console.log(textBox);
  
  // Minimal menu at bottom
  const menu = chalk.hex(theme.mottoColor)('Commands: ') +
    chalk.hex(theme.gradient[0])('s') + chalk.hex(theme.mottoColor)('ession | ') +
    chalk.hex(theme.gradient[0])('?') + chalk.hex(theme.mottoColor)(' help | ') +
    chalk.hex(theme.gradient[0])('q') + chalk.hex(theme.mottoColor)(' quit');
  
  console.log('\n' + menu + '\n');
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
    chalk.hex(theme.versionColor)('  ?') + ' - Show this help menu\n' +
    chalk.hex(theme.versionColor)('  q') + ' - Quit divergent mode\n\n' +
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
