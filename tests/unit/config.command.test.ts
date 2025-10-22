import fs from 'fs';
import inquirer from 'inquirer';
import { runConfigCommand } from '../../src/commands/config';

describe('runConfigCommand variants', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('list should show no rc when missing', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(false);
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await runConfigCommand(['list']);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('No .grindrc'));
    logSpy.mockRestore();
  });

  it('get should print value', async () => {
    jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify({ MY: 'x' }));
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await runConfigCommand(['get', 'MY']);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('MY:'), 'x');
    logSpy.mockRestore();
  });

  it('set should write value', async () => {
    jest.spyOn(fs, 'readFileSync').mockImplementation(() => { throw new Error('no'); });
    const writeSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await runConfigCommand(['set', 'ABC', '123']);
    expect(writeSpy).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Set ABC'));
    logSpy.mockRestore();
  });

  it('init should invoke inquirer', async () => {
    jest.spyOn(fs, 'readFileSync').mockImplementation(() => { throw new Error('no'); });
  const promptSpy = jest.spyOn(inquirer, 'prompt').mockResolvedValue({ APP_MODE: 'divergent', API_BASE_URL: 'http://x', LOG_LEVEL: 'info' } as any);
    const writeSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    await runConfigCommand(['init']);
    expect(promptSpy).toHaveBeenCalled();
    expect(writeSpy).toHaveBeenCalled();
    promptSpy.mockRestore();
  });
});
