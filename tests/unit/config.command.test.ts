import { describe, it, expect, afterEach, vi } from 'vitest';
import fs from 'fs';
import inquirer from 'inquirer';
import { runConfigCommand } from '../../src/commands/config';

describe('runConfigCommand variants', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('list should show no rc when missing', async () => {
    // Mock the fs module that's dynamically imported
    vi.doMock('fs', () => ({
      existsSync: vi.fn().mockReturnValue(false),
      readFileSync: vi.fn().mockImplementation(() => { throw new Error('ENOENT'); }),
      writeFileSync: vi.fn(),
    }));
    
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await runConfigCommand(['list']);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('No .grindrc'));
    logSpy.mockRestore();
    vi.doUnmock('fs');
  });

  it('get should print value', async () => {
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify({ MY: 'x' }));
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await runConfigCommand(['get', 'MY']);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('MY:'), 'x');
    logSpy.mockRestore();
  });

  it('set should write value', async () => {
    vi.spyOn(fs, 'readFileSync').mockImplementation(() => { throw new Error('no'); });
    const writeSpy = vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await runConfigCommand(['set', 'ABC', '123']);
    expect(writeSpy).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Set ABC'));
    logSpy.mockRestore();
  });

  it('init should invoke inquirer', async () => {
    vi.spyOn(fs, 'readFileSync').mockImplementation(() => { throw new Error('no'); });
  const promptSpy = vi.spyOn(inquirer, 'prompt').mockResolvedValue({ APP_MODE: 'divergent', API_BASE_URL: 'http://x', LOG_LEVEL: 'info' } as any);
    const writeSpy = vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    await runConfigCommand(['init']);
    expect(promptSpy).toHaveBeenCalled();
    expect(writeSpy).toHaveBeenCalled();
    promptSpy.mockRestore();
  });
});
