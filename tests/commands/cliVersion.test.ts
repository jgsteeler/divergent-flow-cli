import { describe, it, expect, vi } from 'vitest';
import { printCliVersion } from '../../src/commands/cliVersion';

describe('printCliVersion', () => {
  it('should print the CLI version', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    printCliVersion();
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('CLI Version'));
    logSpy.mockRestore();
  });
});
