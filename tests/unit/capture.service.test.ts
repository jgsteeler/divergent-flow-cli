import axios from 'axios';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock getConfig from the config module
jest.mock('../../src/config/config', () => ({
  getConfig: jest.fn(),
}));

import { getConfig } from '../../src/config/config';
import { CaptureService } from '../../src/services/CaptureService';

const mockedGetConfig = getConfig as jest.MockedFunction<typeof getConfig>;

describe('CaptureService (USER_EMAIL)', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should use USER_EMAIL from config and fetch userId for createCapture', async () => {
    mockedGetConfig.mockImplementation((key: string, def?: any) => {
      if (key === 'USER_EMAIL') return 'test@example.com';
      if (key === 'API_BASE_URL') return 'http://api.test';
      return def;
    });

    // Mock the user lookup endpoint
    mockedAxios.get.mockResolvedValueOnce({ 
      data: { id: 'user-123', email: 'test@example.com' }
    });
    mockedAxios.post.mockResolvedValueOnce({ status: 201 });

    const svc = new CaptureService();
    await svc.createCapture('hello world');

    // Verify user lookup was called
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    expect(mockedAxios.get.mock.calls[0][0]).toBe('http://api.test/v1/user/email/test%40example.com');
    
    // Verify capture creation
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    const [url, body] = mockedAxios.post.mock.calls[0];
    expect(url).toBe('http://api.test/v1/capture');
    expect(body).toMatchObject({ userId: 'user-123', rawText: 'hello world' });
  });

  it('should use email endpoint for listUnmigratedCaptures', async () => {
    mockedGetConfig.mockImplementation((key: string, def?: any) => {
      if (key === 'USER_EMAIL') return 'test@example.com';
      if (key === 'API_BASE_URL') return 'http://api.test';
      return def;
    });

    mockedAxios.get.mockResolvedValueOnce({ data: [{ id: 'c1' }, { id: 'c2' }] });

    const svc = new CaptureService();
    const result = await svc.listUnmigratedCaptures();

    expect(result).toEqual([{ id: 'c1' }, { id: 'c2' }]);
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    const [url] = mockedAxios.get.mock.calls[0];
    expect(url).toBe('http://api.test/v1/capture/user/email/test%40example.com?migrated=false');
  });

  it('should throw error when USER_EMAIL is not configured', async () => {
    mockedGetConfig.mockImplementation((key: string, def?: any) => {
      if (key === 'USER_EMAIL') return undefined;
      if (key === 'API_BASE_URL') return 'http://api.test';
      return def;
    });

    const svc = new CaptureService();
    
    await expect(svc.createCapture('test')).rejects.toThrow(
      'USER_EMAIL not configured. Please set it using: dflw config set USER_EMAIL <your-email>'
    );
  });

  it('should cache userId after first lookup', async () => {
    mockedGetConfig.mockImplementation((key: string, def?: any) => {
      if (key === 'USER_EMAIL') return 'test@example.com';
      if (key === 'API_BASE_URL') return 'http://api.test';
      return def;
    });

    // Mock user lookup
    mockedAxios.get.mockResolvedValueOnce({ 
      data: { id: 'user-123', email: 'test@example.com' }
    });
    mockedAxios.post.mockResolvedValue({ status: 201 });

    const svc = new CaptureService();
    
    // First call should fetch user
    await svc.createCapture('first');
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    
    // Second call should use cached userId
    await svc.createCapture('second');
    expect(mockedAxios.get).toHaveBeenCalledTimes(1); // Still only 1 call
    expect(mockedAxios.post).toHaveBeenCalledTimes(2); // But 2 captures created
  });
});
