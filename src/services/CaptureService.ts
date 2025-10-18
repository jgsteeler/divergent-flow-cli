import axios from 'axios';
import { injectable } from 'tsyringe';
import type { ICaptureService } from '../interfaces/ICaptureService';
import { getConfig } from '../config/config';

@injectable()
export class CaptureService implements ICaptureService {
  private getBaseUrl(): string {
    return getConfig('API_BASE_URL', 'http://localhost:8080');
  }

  private getUserId(): string {
    // For now, assuming user ID 1 as mentioned in requirements
    // TODO: In the future, this could come from config or authentication
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