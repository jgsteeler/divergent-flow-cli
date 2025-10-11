// Concrete implementation of IApiClient using generated services
import { VersionService } from './services/VersionService';
import type { IApiClient, IVersionService } from './interfaces/IApiClient';

export class ApiClientImpl implements IApiClient {
  version: IVersionService = {
    getVersion: () => VersionService.getVersion(),
  };
  // Add other services as needed
}
