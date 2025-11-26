import { describe, it, expect, vi } from 'vitest';
import { runConfigCommand } from '../../src/commands/config';

describe('runConfigCommand', () => {
  it('should print help for unknown usage', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await runConfigCommand(['unknown']);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Usage: config'));
    logSpy.mockRestore();
  });

  // Add more tests for list, get, set, and init as needed
});
