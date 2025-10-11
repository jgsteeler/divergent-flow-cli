// Interface for the generated API client (all services)
import type { VersionInfo } from '../models/VersionInfo';

export interface IVersionService {
  getVersion(): Promise<VersionInfo>;
}

// Add other service interfaces here as you expand the API

export interface IApiClient {
  version: IVersionService;
  // Add other services as properties here
}
