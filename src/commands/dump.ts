import { injectable, inject } from 'tsyringe';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { ICaptureService } from '../interfaces/ICaptureService';
import { getTheme } from '../config/theme';

@injectable()
export class DumpCommand {
  constructor(@inject('ICaptureService') private captureService: ICaptureService) {}

  /**
   * Single dump command - captures the provided text
   * @param text - Raw text to capture
   */
  async dumpSingle(text: string): Promise<void> {
    const theme = getTheme();
    
    if (!text || text.trim().length === 0) {
      console.log(chalk.hex(theme.mottoColor)('No text provided to dump.'));
      return;
    }

    try {
      await this.captureService.createCapture(text);
      console.log(chalk.hex(theme.versionColor)('✓ Capture saved successfully!'));
    } catch (error) {
      console.log(chalk.red(`✗ Failed to save capture: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  /**
   * Interactive dump session - continues until empty input
   */
  async dumpSession(): Promise<void> {
    const theme = getTheme();
    
    console.log(chalk.hex(theme.gradient[1])('\n🔥 Dump Session Started'));
    console.log(chalk.hex(theme.mottoColor)('Enter text to capture (empty line to exit):\n'));

    let captureCount = 0;

    while (true) {
      const { input } = await inquirer.prompt([
        {
          type: 'input',
          name: 'input',
          message: chalk.hex(theme.gradient[0])('Capture:'),
        },
      ]);

      // Check if input is empty or just whitespace
      if (!input || input.trim().length === 0) {
        break;
      }

      try {
        await this.captureService.createCapture(input);
        captureCount++;
        console.log(chalk.hex(theme.versionColor)(`✓ Capture ${captureCount} saved!`));
      } catch (error) {
        console.log(chalk.red(`✗ Failed to save capture: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    }

    console.log(chalk.hex(theme.gradient[1])(`\n🎯 Session complete! ${captureCount} captures saved.\n`));
  }

  /**
   * Quick inline capture for divergent mode dashboard
   * @param text - Raw text to capture
   */
  async quickCapture(text: string): Promise<boolean> {
    try {
      await this.captureService.createCapture(text);
      return true;
    } catch (error) {
      console.log(chalk.red(`✗ Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`));
      return false;
    }
  }
}

/**
 * Factory function to create DumpCommand instance using DI
 */
export async function createDumpCommand(): Promise<DumpCommand> {
  const { container } = await import('../di/container');
  return container.resolve(DumpCommand);
}

/**
 * Direct command interface for CLI routing
 */
export async function runDumpCommand(args: string[]): Promise<void> {
  const dumpCommand = await createDumpCommand();
  let text = args.join(' ');

  // If no inline args provided, prompt once for input (no splash)
  if (!text || text.trim().length === 0) {
    const { input } = await inquirer.prompt([
      {
        type: 'input',
        name: 'input',
        message: 'Capture:',
      },
    ]);
    if (!input || input.trim().length === 0) {
      // nothing provided - exit silently
      return;
    }
    text = input;
  }

  // Strip surrounding quotes if user included them literally
  text = text.trim();
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
    text = text.slice(1, -1);
  }

  await dumpCommand.dumpSingle(text);
}

/**
 * Direct command interface for dump session
 */
export async function runDumpSession(): Promise<void> {
  const dumpCommand = await createDumpCommand();
  await dumpCommand.dumpSession();
}