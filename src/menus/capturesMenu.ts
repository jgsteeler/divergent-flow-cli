import inquirer from 'inquirer';
import chalk from 'chalk';
import boxen from 'boxen';
import { getTheme } from '../config/theme';
import { createDumpCommand, runDumpSession } from '../commands/dump';
import { ICaptureService } from '../interfaces/ICaptureService';
import { container } from '../di/container';

interface CaptureMenuState {
  isRunning: boolean;
}

export async function capturesMenu(): Promise<void> {
  const theme = getTheme();
  const state: CaptureMenuState = { isRunning: true };
  
  while (state.isRunning) {
    showCapturesMenuHeader(theme);
    await handleCapturesMenuInput(state, theme);
  }
}

function showCapturesMenuHeader(theme: any): void {
  // Add vertical space before menu
  console.log('\n');
  
  // Get terminal width once
  const terminalWidth = process.stdout.columns || 80;
  
  // Render centered menu title in powder blue
  const title = '📝 CAPTURES MENU';
  // Account for emoji taking up extra space
  const titleDisplayLength = title.length - 1; // Emoji counts as 2 chars but displays as 1
  const padding = Math.max(0, Math.floor((terminalWidth - titleDisplayLength) / 2));
  const centeredTitle = ' '.repeat(padding) + chalk.hex(theme.gradient[1]).bold(title);
  console.log(centeredTitle);
  console.log('');
  
  // Two-column menu layout
  const leftCol = [
    chalk.hex(theme.gradient[0])('c') + chalk.hex(theme.mottoColor)(') Quick Capture'),
    chalk.hex(theme.gradient[0])('s') + chalk.hex(theme.mottoColor)(') Dump Session'),
  ];
  
  const rightCol = [
    chalk.hex(theme.gradient[0])('l') + chalk.hex(theme.mottoColor)(') List Captures'),
    chalk.hex(theme.gradient[0])('b') + chalk.hex(theme.mottoColor)(') Back to Main'),
  ];
  
  // Calculate column width and centering
  const colWidth = 30;
  const menuWidth = colWidth * 2;
  const leftPadding = Math.max(0, Math.floor((terminalWidth - menuWidth) / 2));
  const indent = ' '.repeat(leftPadding);
  
  console.log('\n');
  
  for (let i = 0; i < Math.max(leftCol.length, rightCol.length); i++) {
    const left = leftCol[i] || '';
    const right = rightCol[i] || '';
    const leftStripped = left.replace(/\x1b\[[0-9;]*m/g, '');
    const padding = ' '.repeat(Math.max(0, colWidth - leftStripped.length));
    console.log(`${indent}${left}${padding}${right}`);
  }
  
  // Add quit option on separate line (centered)
  const quitLine = chalk.hex(theme.gradient[0])('q') + chalk.hex(theme.mottoColor)(') Quit dflw');
  console.log(`\n${indent}${quitLine}`);
  console.log('\n');
}

async function handleCapturesMenuInput(state: CaptureMenuState, theme: any): Promise<void> {
  const { input } = await inquirer.prompt<{ input: string }>([
    {
      type: 'input',
      name: 'input',
      message: chalk.hex(theme.gradient[1])('Enter command:'),
    },
  ]);

  if (!input || input.trim().length === 0) {
    return;
  }

  const cmd = input.trim().toLowerCase();
  await handleCapturesMenuCommand(cmd, state, theme);
}

async function handleCapturesMenuCommand(cmd: string, state: CaptureMenuState, theme: any): Promise<void> {
  switch (cmd) {
    case 'c':
    case 'capture':
      await handleQuickCapture(theme);
      process.stdout.write('\x1Bc');
      break;
    
    case 's':
    case 'session':
      process.stdout.write('\x1Bc');
      await runDumpSession();
      process.stdout.write('\x1Bc');
      break;
    
    case 'l':
    case 'list':
      await handleListCaptures(theme);
      process.stdout.write('\x1Bc');
      break;
    
    case 'b':
    case 'back':
      state.isRunning = false;
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

async function handleQuickCapture(theme: any): Promise<void> {
  const { text } = await inquirer.prompt([
    {
      type: 'input',
      name: 'text',
      message: chalk.hex(theme.gradient[0])('Enter text to capture:'),
    },
  ]);

  if (!text || text.trim().length === 0) {
    console.log(chalk.hex(theme.mottoColor)('No text entered.'));
    return;
  }

  try {
    const dumpCommand = await createDumpCommand();
    await dumpCommand.dumpSingle(text);
  } catch (error) {
    console.log(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
  }

  // Pause to show result
  await new Promise(resolve => setTimeout(resolve, 2000));
}

async function handleListCaptures(theme: any): Promise<void> {
  try {
    const captureService = container.resolve<ICaptureService>('ICaptureService');
    const captures = await captureService.listUnmigratedCaptures();

    if (captures.length === 0) {
      console.log(chalk.hex(theme.mottoColor)('No unmigrated captures found.'));
    } else {
      const listTitle = boxen(
        chalk.hex(theme.gradient[1]).bold(`📋 Unmigrated Captures (${captures.length})`),
        {
          padding: { top: 0, bottom: 0, left: 2, right: 2 },
          margin: { top: 1, bottom: 1 },
          borderColor: theme.versionColor,
          borderStyle: 'single',
        }
      );
      
      console.log(listTitle);

      captures.forEach((capture, index) => {
        const preview = capture.rawText.length > 50 
          ? capture.rawText.substring(0, 50) + '...' 
          : capture.rawText;
        
        console.log(
          chalk.hex(theme.versionColor)(`${index + 1}.`) + ' ' +
          chalk.hex(theme.gradient[0])(preview.replace(/\n/g, ' ')) + ' ' +
          chalk.hex(theme.mottoColor)(`(${new Date(capture.createdAt).toLocaleDateString()})`)
        );
      });
    }
  } catch (error) {
    console.log(chalk.red(`Error fetching captures: ${error instanceof Error ? error.message : 'Unknown error'}`));
  }

  // Pause to read results
  await inquirer.prompt<{ continue: string }>([
    {
      type: 'input',
      name: 'continue',
      message: chalk.hex(theme.mottoColor)('Press Enter to continue...'),
    },
  ]);
}