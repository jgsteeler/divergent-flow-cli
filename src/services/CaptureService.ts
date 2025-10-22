import axios from 'axios';
import { injectable } from 'tsyringe';
import type { ICaptureService } from '../interfaces/ICaptureService';
import { getConfig } from '../config/config';

@injectable()
export class CaptureService implements ICaptureService {
  private getBaseUrl(): string {
    const raw = getConfig('API_BASE_URL', 'http://localhost:8080');
    // Normalize: remove any trailing slashes so joining paths doesn't produce //
    if (typeof raw === 'string') return raw.replace(/\/+$/, '');
    return String(raw).replace(/\/+$/, '');
  }

  private getUserId(): string {
    // Prefer an explicit USER_ID from config if present, otherwise fall back to a default placeholder
    const cfg = getConfig('USER_ID');
    if (cfg && typeof cfg === 'string' && cfg.trim().length > 0) return cfg;
    // default placeholder until proper auth/user management is implemented
    return 'e1ccf5f8-e1d6-4541-ae0a-72946f5fb3d9';
  }

  async createCapture(text: string): Promise<void> {
    const baseUrl = this.getBaseUrl();
    const userId = this.getUserId();
    
    // Sanitize and prepare the text for API submission
    const captureData = {
      userId: userId,
      rawText: text, // Send as raw text, let the API handle encoding
      migrated: false
    };

    try {
      await axios.post(`${baseUrl}/v1/capture`, captureData, {
        headers: {
          'Content-Type': 'application/json'
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
    const userId = this.getUserId();
    
    try {
      const response = await axios.get(`${baseUrl}/v1/capture/user/${userId}?migrated=false`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to fetch captures: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }
}