import fs from 'fs';
import { getConfig, setConfig, removeConfig, grindRcPath } from '../../src/config/config';

describe('removeConfig / unset behavior', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('removeConfig should return false when key missing', () => {
    jest.spyOn(fs, 'readFileSync').mockImplementation(() => { throw new Error('no file'); });
    const removed = removeConfig('NON_EXISTENT');
    expect(removed).toBe(false);
  });

  it('removeConfig should delete an existing key and write file', () => {
    const fakeRc = { USER_ID: 'abc-123', SOME: 'x' };
    jest.spyOn(fs, 'readFileSync').mockImplementation(() => JSON.stringify(fakeRc));
    const writeSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});

    const removed = removeConfig('USER_ID');
    expect(removed).toBe(true);
    expect(writeSpy).toHaveBeenCalled();
    const [, contentArg] = writeSpy.mock.calls[0];
    const parsed = JSON.parse(contentArg as string);
    expect(parsed.USER_ID).toBeUndefined();
    expect(parsed.SOME).toBe('x');
  });

  it('attempting to remove required key should not be allowed via command layer (sanity)', () => {
    // removeConfig should NOT remove required keys (config module enforces protection)
    const fakeRc = { APP_MODE: 'divergent' };
    jest.spyOn(fs, 'readFileSync').mockImplementation(() => JSON.stringify(fakeRc));
    const writeSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});

    const removed = removeConfig('APP_MODE');
    expect(removed).toBe(false);
    expect(writeSpy).not.toHaveBeenCalled();
  });
});
