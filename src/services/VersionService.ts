import axios from 'axios';
import { inject, injectable } from 'tsyringe';
import { VersionInfoSchema } from '../schemas/VersionInfoSchema';
import type { VersionInfo } from '../models/VersionInfo';
import type { IVersionService } from '../interfaces/IVersionService';
import { getConfig } from '../config/config';
import { buildApiUrl } from '../utils/url';
import { AuthService } from './AuthService';

@injectable()
export class VersionService implements IVersionService {
  constructor(@inject(AuthService) private authService: AuthService) {}

  private getAuthHeaders(): { Authorization?: string } {
    const token = this.authService.getStoredToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async getVersion(): Promise<VersionInfo> {
    const baseUrl = getConfig('API_BASE_URL', 'http://localhost:8080') as string;
    const url = buildApiUrl(baseUrl, '/v1/version');
    const response = await axios.get(url, {
      headers: this.getAuthHeaders()
    });
    const parsed = VersionInfoSchema.safeParse(response.data);
    if (!parsed.success) {
      throw new Error('Invalid version response: ' + JSON.stringify(parsed.error.issues));
    }
    return parsed.data;
  }
}
