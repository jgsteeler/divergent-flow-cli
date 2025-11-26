import { describe, it, expect } from 'vitest';
import { runVersionCommand } from '../../src/commands/version';

describe('runVersionCommand', () => {
  it('should call API and print version', async () => {
    // You may want to mock fetch or the API client here
    // For now, just check that the function runs
    await expect(runVersionCommand()).resolves.not.toThrow();
  });
});
