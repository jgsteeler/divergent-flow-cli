
import type { IApiClient } from '../api-client/interfaces/IApiClient';
import { container } from '../di/container';

export async function runVersionCommand(apiClient?: IApiClient) {
  const client = apiClient || container.resolve<IApiClient>('IApiClient');
  try {
    const versionInfo = await client.version.getVersion();
    console.log('\nAPI Version:', versionInfo.version);
    console.log('Service:', versionInfo.service);
    console.log('Timestamp:', versionInfo.timestamp, '\n');
  } catch (err) {
    console.error('Failed to fetch API version:', err);
  }
}
