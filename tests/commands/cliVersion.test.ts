import { printCliVersion } from '../../src/commands/cliVersion';

describe('printCliVersion', () => {
  it('should print the CLI version', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    printCliVersion();
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('CLI Version'));
    logSpy.mockRestore();
  });
});
