
import type { IVersionService } from '../interfaces/IVersionService';
import { container } from '../di/container';

export async function runVersionCommand(versionService?: IVersionService) {
  const service = versionService || container.resolve<IVersionService>('IVersionService');
  try {
    const versionInfo = await service.getVersion();
    console.log('\nAPI Version:', versionInfo.version);
    console.log('Service:', versionInfo.service);
    console.log('Timestamp:', versionInfo.timestamp, '\n');
  } catch (err) {
    console.error('Failed to fetch API version:', err);
  }
}
