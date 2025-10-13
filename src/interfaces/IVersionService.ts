import type { VersionInfo } from '../models/VersionInfo';

export interface IVersionService {
  getVersion(): Promise<VersionInfo>;
}
