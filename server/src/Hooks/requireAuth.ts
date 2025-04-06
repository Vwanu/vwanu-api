import { authManager } from '../lib/authManagement.class';

if (!process.env.userPoolId || !process.env.clientId) {
  throw new Error('Missing required environment variables');
}
authManager.initialize({
  clientId: process.env.clientId,
  userPoolId: process.env.userPoolId,
});

// eslint-disable-next-line import/prefer-default-export
export const { requireAuth } = authManager;
