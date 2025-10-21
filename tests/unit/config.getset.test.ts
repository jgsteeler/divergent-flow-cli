import fs from 'fs';
import { getConfig, setConfig, grindRcPath } from '../../src/config/config';

describe('getConfig / setConfig', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('getConfig should return default when rc missing', () => {
    jest.spyOn(fs, 'readFileSync').mockImplementation(() => { throw new Error('no file'); });
    const val = getConfig('SOME_KEY', 'defaultVal');
    expect(val).toBe('defaultVal');
  });

  it('setConfig should write file with new key', () => {
    jest.spyOn(fs, 'readFileSync').mockImplementation(() => { throw new Error('no file'); });
  const writeSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});

    setConfig('MY_KEY', 'myValue');

    expect(writeSpy).toHaveBeenCalled();
    const [pathArg, contentArg] = writeSpy.mock.calls[0];
    expect(pathArg).toBe(grindRcPath);
    const parsed = JSON.parse(contentArg as string);
    expect(parsed.MY_KEY).toBe('myValue');
  });

  it('setConfig should enforce GRIND_MODE validation', () => {
    expect(() => setConfig('GRIND_MODE', 'invalid-mode')).toThrow();
  });
});
