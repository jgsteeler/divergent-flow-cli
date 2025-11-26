import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import { getConfig, setConfig } from '../../src/config/config';

describe('USER_EMAIL config', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('set and get USER_EMAIL via setConfig/getConfig', () => {
    // Mock file operations
    const fakeRc = {};
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(fakeRc));
    const writeSpy = vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    
    setConfig('USER_EMAIL', 'test@example.com');
    
    // Verify it was written
    expect(writeSpy).toHaveBeenCalled();
    const [, content] = writeSpy.mock.calls[0];
    const written = JSON.parse(content as string);
    expect(written.USER_EMAIL).toBe('test@example.com');
    
    // Now mock reading it back
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify({ USER_EMAIL: 'test@example.com' }));
    const val = getConfig('USER_EMAIL');
    expect(val).toBe('test@example.com');
  });
});
