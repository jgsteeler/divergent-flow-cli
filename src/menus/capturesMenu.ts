import inquirer from 'inquirer';
import chalk from 'chalk';
import boxen from 'boxen';
import { getTheme } from '../config/theme';
import { createDumpCommand, runDumpSession } from '../commands/dump';
import { ICaptureService } from '../interfaces/ICaptureService';
import { container } from '../di/container';

export async function capturesMenu(): Promise<void> {
  const theme = getTheme();
  
  while (true) {
    // Add vertical space before menu
    console.log('\n\n');
    
    // Render menu title in a box with theme color
    const menuTitle = boxen(
      chalk.hex(theme.borderColor).bold('📝 Captures Menu'),
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
    
    const choices = [
      { name: chalk.hex(theme.versionColor)('  Quick Capture  '), value: 'quickCapture' },
      { name: chalk.hex(theme.gradient[0])('  Dump Session  '), value: 'dumpSession' },
      { name: chalk.hex(theme.gradient[1])('  List Unmigrated Captures  '), value: 'listCaptures' },
      { name: chalk.hex(theme.mottoColor)('  ← Back to Main Menu  '), value: 'back' },
    ];

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: chalk.hex(theme.gradient[1])('Select an action:'),
        choices,
        pageSize: 8,
      },
    ]);

    console.log('\n');

    if (action === 'quickCapture') {
      await handleQuickCapture(theme);
    } else if (action === 'dumpSession') {
      await runDumpSession();
    } else if (action === 'listCaptures') {
      await handleListCaptures(theme);
    } else if (action === 'back') {
      return; // Exit to main menu
    }
  }
}

async function handleQuickCapture(theme: any): Promise<void> {
  const { text } = await inquirer.prompt([
    {
      type: 'editor',
      name: 'text',
      message: chalk.hex(theme.gradient[0])('Enter text to capture:'),
      postfix: '.txt',
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