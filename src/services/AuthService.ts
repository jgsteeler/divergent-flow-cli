import { exec } from 'child_process';
import axios from 'axios';
import { getConfig, setConfig } from '../config/config';

export class AuthService {
  private issuerUrl: string;
  private clientId: string;

  constructor() {
    this.issuerUrl = getConfig('OIDC_ISSUER_URL', 'https://divergent-flow-keycloak.fly.dev/realms/df-prod');
    this.clientId = getConfig('OIDC_CLIENT_ID', 'cli-app');
  }

  private async openBrowser(url: string): Promise<void> {
    // macOS: use the 'open' command; fall back to printing the URL
    return new Promise((resolve) => {
      const child = exec(`open "${url}"`, (/* err, stdout, stderr */) => resolve());
      // If spawn fails immediately, still resolve and print URL
      child.on('error', () => resolve());
      setTimeout(() => resolve(), 200); // don't block CLI even if command hangs
    });
  }

  private async copyToClipboard(text: string): Promise<boolean> {
    // macOS: pbcopy
    return new Promise((resolve) => {
      const child = exec('pbcopy', (err) => resolve(!err));
      if (!child.stdin) {
        resolve(false);
        return;
      }
      child.stdin.write(text);
      child.stdin.end();
    });
  }

  private async getDeviceAuthEndpoint(): Promise<string> {
    // Try well-known discovery first
    const wellKnownUrl = `${this.issuerUrl}/.well-known/openid-configuration`;
    try {
      const resp = await axios.get(wellKnownUrl, {
        headers: { Accept: 'application/json' },
        timeout: 8000,
      });
      const deviceEp = (resp.data && (resp.data.device_authorization_endpoint || resp.data.device_authorization_endpoint)) as string | undefined;
      if (deviceEp && typeof deviceEp === 'string') {
        return deviceEp;
      }
    } catch (_e) {
      // ignore and fall back
    }
    // Fallbacks for Keycloak variants
    // Common: /protocol/openid-connect/auth/device
    // Some deployments: /protocol/openid-connect/device/auth
    return `${this.issuerUrl}/protocol/openid-connect/auth/device`;
  }

  async authenticate(): Promise<string> {
    // OAuth 2.0 Device Authorization Grant (no localhost listener)
    const deviceEndpoint = await this.getDeviceAuthEndpoint();
    const tokenEndpoint = `${this.issuerUrl}/protocol/openid-connect/token`;
    // 1) Request device code
    let deviceResp;
    const tryPost = async (url: string) => axios.post(
      url,
      new URLSearchParams({ client_id: this.clientId, scope: 'openid profile email' }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    try {
      deviceResp = await tryPost(deviceEndpoint);
    } catch (err: any) {
      const data = err?.response?.data;
      const code = data?.error;
      const desc = data?.error_description;
      // If endpoint path seems wrong (e.g., Keycloak variant), retry alternate path
      const alt = `${this.issuerUrl}/protocol/openid-connect/device/auth`;
      const looksLikePkceError = typeof desc === 'string' && desc.toLowerCase().includes('code_challenge_method');
      const is404 = err?.response?.status === 404;
      if (is404 || looksLikePkceError || deviceEndpoint.endsWith('/auth/device')) {
        try {
          deviceResp = await tryPost(alt);
        } catch (err2: any) {
          const data2 = err2?.response?.data;
          const code2 = data2?.error;
          const desc2 = data2?.error_description;
          if (code2 === 'unauthorized_client') {
            throw new Error('Client not authorized for Device Authorization Grant. Enable it on the cli-app in Keycloak.');
          }
          throw new Error(desc2 || code2 || err2?.message || 'Failed to initiate device authorization');
        }
      } else if (code === 'unauthorized_client') {
        throw new Error('Client not authorized for Device Authorization Grant. Enable it on the cli-app in Keycloak.');
      } else {
        throw new Error(desc || code || err?.message || 'Failed to initiate device authorization');
      }
    }

    const {
      device_code,
      user_code,
      verification_uri,
      verification_uri_complete,
      expires_in,
      interval,
    } = deviceResp.data as {
      device_code: string;
      user_code?: string;
      verification_uri: string;
      verification_uri_complete?: string;
      expires_in?: number;
      interval?: number;
    };

    const pollBaseMs = Math.max(5, interval || 5) * 1000;
    const deadline = Date.now() + (expires_in ? expires_in * 1000 : 600000); // default 10m

    // 2) Guide user to browser
    if (verification_uri_complete) {
      console.log('Opening your browser to complete login...');
      console.log('(If it does not open automatically, use this URL):');
      console.log(verification_uri_complete);
      await this.openBrowser(verification_uri_complete);
      // Convenience: also copy to clipboard if available
      try {
        const ok = await this.copyToClipboard(verification_uri_complete);
        if (ok) console.log('Login URL copied to clipboard.');
      } catch {}
    } else {
      console.log('Please visit the following URL in your browser to authorize:');
      console.log(verification_uri);
      if (user_code) {
        console.log('Then enter this code:');
        console.log(user_code);
      }
      // Copy base URL to clipboard as a helper even without complete URL
      try {
        const ok = await this.copyToClipboard(verification_uri);
        if (ok) console.log('URL copied to clipboard.');
      } catch {}
    }

    // 3) Poll token endpoint
    let delayMs = pollBaseMs;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (Date.now() > deadline) {
        throw new Error('Device authorization expired. Please run login again.');
      }
      try {
        const tokenResp = await axios.post(
          tokenEndpoint,
          new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
            device_code,
            client_id: this.clientId,
          }),
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
        const { access_token, refresh_token, expires_in: atExp } = tokenResp.data as {
          access_token: string;
          refresh_token?: string;
          expires_in?: number;
        };
        if (!access_token) throw new Error('No access token received');
        setConfig('ACCESS_TOKEN', access_token);
        if (refresh_token) setConfig('REFRESH_TOKEN', refresh_token);
        if (atExp) setConfig('ACCESS_TOKEN_EXPIRES_IN', atExp);
        return access_token;
      } catch (err: any) {
        const errCode = err?.response?.data?.error;
        if (errCode === 'authorization_pending') {
          // Keep polling
        } else if (errCode === 'slow_down') {
          delayMs = Math.min(delayMs * 2, 60000); // cap at 60s
        } else if (errCode === 'access_denied') {
          throw new Error('Access denied during authorization.');
        } else if (errCode === 'expired_token') {
          throw new Error('Device code expired. Please run login again.');
        } else {
          const msg = err?.response?.data?.error_description || errCode || err?.message || 'Token polling failed';
          throw new Error(String(msg));
        }
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  }

  getStoredToken(): string | null {
    return getConfig('ACCESS_TOKEN', null);
  }

  storeToken(token: string): void {
    setConfig('ACCESS_TOKEN', token);
  }

  isAuthenticated(): boolean {
    const token = this.getStoredToken();
    return token !== null;
  }
}