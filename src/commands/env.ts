import { getConfig, setConfig } from '../config/config';

const ENV_PRESETS: Record<string, { API_BASE_URL: string; OIDC_ISSUER_URL: string; OIDC_CLIENT_ID?: string }> = {
  stage: {
    API_BASE_URL: 'https://divergent-flow-core-staging.fly.dev',
    OIDC_ISSUER_URL: 'https://divergent-flow-keycloak.fly.dev/realms/df-staging',
    OIDC_CLIENT_ID: 'cli-app',
  },
  prod: {
    API_BASE_URL: 'https://divergent-flow-core.fly.dev',
    OIDC_ISSUER_URL: 'https://divergent-flow-keycloak.fly.dev/realms/df-prod',
    OIDC_CLIENT_ID: 'cli-app',
  },
};

export async function runEnvCommand(args: string[]) {
  const sub = args[0];
  if (sub === 'use' && args[1]) {
    const target = args[1].toLowerCase();
    const preset = ENV_PRESETS[target];
    if (!preset) {
      console.log(`Unknown environment: ${target}. Use: stage|prod`);
      return;
    }
    setConfig('API_BASE_URL', preset.API_BASE_URL);
    setConfig('OIDC_ISSUER_URL', preset.OIDC_ISSUER_URL);
    if (preset.OIDC_CLIENT_ID) setConfig('OIDC_CLIENT_ID', preset.OIDC_CLIENT_ID);
    setConfig('ENV', target);
    console.log(`Environment set to ${target}`);
    console.log(`API_BASE_URL = ${preset.API_BASE_URL}`);
    console.log(`OIDC_ISSUER_URL = ${preset.OIDC_ISSUER_URL}`);
    return;
  }
  if (sub === 'show') {
    const env = getConfig('ENV', 'stage');
    const api = getConfig('API_BASE_URL');
    const iss = getConfig('OIDC_ISSUER_URL');
    console.log(`ENV = ${env}`);
    console.log(`API_BASE_URL = ${api}`);
    console.log(`OIDC_ISSUER_URL = ${iss}`);
    return;
  }
  console.log('Usage: env use <stage|prod> | env show');
}
