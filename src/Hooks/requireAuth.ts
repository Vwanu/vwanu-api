import { authManager } from '../lib/authManagement.class';

// Use real auth in production/dev, mock in test
if (process.env.NODE_ENV === 'test') {
  // In test mode, we'll use mock auth
  // This hook will be overridden via Jest module mocking in tests
  console.log('Using test mode for authentication');
} else {
  // In non-test environments, initialize with real credentials
  if (!process.env.userPoolId || !process.env.clientId) {
    throw new Error('Missing required environment variables');
  }

  authManager.initialize({
    clientId: process.env.clientId,
    userPoolId: process.env.userPoolId,
  });
}

// eslint-disable-next-line import/prefer-default-export
export const { requireAuth } = authManager;
