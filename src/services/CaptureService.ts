import axios from 'axios';
import { injectable, inject } from 'tsyringe';
import type { ICaptureService } from '../interfaces/ICaptureService';
import { getConfig } from '../config/config';
import { normalizeBaseUrl, buildApiUrl } from '../utils/url';
import { AuthService } from './AuthService';

@injectable()
export class CaptureService implements ICaptureService {
  constructor(@inject(AuthService) private authService: AuthService) {}

  private userIdCache: string | null = null;

  private getBaseUrl(): string {
    const raw = getConfig('API_BASE_URL', 'http://localhost:8080');
    return normalizeBaseUrl(raw as string);
  }

  private getAuthHeaders(): { Authorization?: string } {
    const token = this.authService.getStoredToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private getUserEmail(): string {
    const cfg = getConfig('USER_EMAIL');
    if (cfg && typeof cfg === 'string' && cfg.trim().length > 0) return cfg;
    throw new Error('USER_EMAIL not configured. Please set it using: dflw config set USER_EMAIL <your-email>');
  }

  private async getUserIdByEmail(): Promise<string> {
    // Return cached userId if available
    if (this.userIdCache) {
      return this.userIdCache;
    }

    const baseUrl = this.getBaseUrl();
    const email = this.getUserEmail();
    
    try {
      const url = buildApiUrl(baseUrl, `/v1/user/email/${encodeURIComponent(email)}`);
      const response = await axios.get(url, {
        headers: this.getAuthHeaders()
      });
      
      if (response.data && response.data.id) {
        const userId: string = response.data.id;
        this.userIdCache = userId;
        return userId;
      }
      
      throw new Error('User ID not found in response');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error(`User not found for email: ${email}`);
        }
        throw new Error(`Failed to fetch user: ${error.response?.data?.error || error.message}`);
      }
      throw error;
    }
  }

  async createCapture(text: string): Promise<void> {
    const baseUrl = this.getBaseUrl();
    const userId = await this.getUserIdByEmail();
    
    // Sanitize and prepare the text for API submission
    const captureData = {
      userId: userId,
      rawText: text, // Send as raw text, let the API handle encoding
      migrated: false
    };

    try {
      const url = buildApiUrl(baseUrl, '/v1/capture');
      await axios.post(url, captureData, {
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        }
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to create capture: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  async listUnmigratedCaptures(): Promise<any[]> {
    const baseUrl = this.getBaseUrl();
    const email = this.getUserEmail();
    
    try {
      const url = buildApiUrl(baseUrl, `/v1/capture/user/email/${encodeURIComponent(email)}?migrated=false`);
      const response = await axios.get(url, {
        headers: this.getAuthHeaders()
      });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to fetch captures: ${error.response?.data?.error || error.message}`);
      }
      throw error;
    }
  }
}