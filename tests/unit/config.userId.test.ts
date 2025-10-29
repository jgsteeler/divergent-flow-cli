import fs from 'fs';

describe('USER_EMAIL config', () => {
  let origHome: string | undefined;
  let getConfig: any;
  let setConfig: any;
  let grindRcPath: string;

  beforeAll(() => {
    // point HOME to a temp location to avoid changing actual user rc
    origHome = process.env.HOME;
    process.env.HOME = '/tmp';
    // Ensure module reads the new HOME when computing grindRcPath
    jest.resetModules();
    // require after HOME is set so RC_PATH is computed with /tmp
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const cfg = require('../../src/config/config');
    getConfig = cfg.getConfig;
    setConfig = cfg.setConfig;
    grindRcPath = cfg.grindRcPath;
  });

  afterAll(() => {
    if (origHome !== undefined) process.env.HOME = origHome;
    try { fs.unlinkSync('/tmp/.grindrc'); } catch {}
  });

  it('set and get USER_EMAIL via setConfig/getConfig', () => {
    setConfig('USER_EMAIL', 'test@example.com');
    const val = getConfig('USER_EMAIL');
    expect(val).toBe('test@example.com');
  });
});
