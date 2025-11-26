import { AuthService } from '../services/AuthService';
import { getConfig } from '../config/config';

export async function runAuthCommand(args: string[]) {
  const authService = new AuthService();

  if (args[0] === 'login') {
    try {
      console.log('Authenticate via Device Code flow...');
      const token = await authService.authenticate();
      authService.storeToken(token);
      console.log('Authentication successful!');
    } catch (error) {
      console.error('Authentication failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  } else if (args[0] === 'logout') {
    authService.storeToken('');
    console.log('Logged out successfully.');
  } else if (args[0] === 'status') {
    if (authService.isAuthenticated()) {
      console.log('You are logged in.');
    } else {
      console.log('You are not logged in.');
    }
  } else {
    console.log('Usage: divergent-flow auth [login|logout|status]');
  }
}