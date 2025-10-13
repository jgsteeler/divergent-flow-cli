import axios from 'axios';
import { VersionInfoSchema } from '../schemas/VersionInfoSchema';
import type { VersionInfo } from '../models/VersionInfo';
import type { IVersionService } from '../interfaces/IVersionService';
import { getConfig } from '../config/config';

export class VersionService implements IVersionService {
  async getVersion(): Promise<VersionInfo> {
    const baseUrl = getConfig('API_BASE_URL', 'http://localhost:8080');
    const response = await axios.get(`${baseUrl}/v1/version`);
    const parsed = VersionInfoSchema.safeParse(response.data);
    if (!parsed.success) {
      throw new Error('Invalid version response: ' + JSON.stringify(parsed.error.issues));
    }
    return parsed.data;
  }
}
