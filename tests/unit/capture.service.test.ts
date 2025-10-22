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

describe('CaptureService (USER_ID)', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should use USER_ID from config when present for createCapture', async () => {
    mockedGetConfig.mockImplementation((key: string, def?: any) => {
      if (key === 'USER_ID') return 'user-123';
      if (key === 'API_BASE_URL') return 'http://api.test';
      return def;
    });

    mockedAxios.post.mockResolvedValueOnce({ status: 201 });

    const svc = new CaptureService();
    await svc.createCapture('hello world');

    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    const [url, body] = mockedAxios.post.mock.calls[0];
    expect(url).toBe('http://api.test/v1/capture');
    expect(body).toMatchObject({ userId: 'user-123', rawText: 'hello world' });
  });

  it('should fallback to placeholder USER_ID when not set in config for listUnmigratedCaptures', async () => {
    // return undefined for USER_ID
    mockedGetConfig.mockImplementation((key: string, def?: any) => {
      if (key === 'USER_ID') return undefined;
      if (key === 'API_BASE_URL') return 'http://api.test';
      return def;
    });

    const placeholder = 'e1ccf5f8-e1d6-4541-ae0a-72946f5fb3d9';
    mockedAxios.get.mockResolvedValueOnce({ data: [{ id: 'c1' }] });

    const svc = new CaptureService();
    const result = await svc.listUnmigratedCaptures();

    expect(result).toEqual([{ id: 'c1' }]);
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    const [url] = mockedAxios.get.mock.calls[0];
    expect(url).toBe(`http://api.test/v1/capture/user/${placeholder}?migrated=false`);
  });
});
