# Testing with Cognito Authentication

This directory contains tests that have been adapted to work with AWS Cognito authentication.

## Authentication Mocking

Since the application now uses Cognito for authentication, the tests use a mock authentication system to avoid requiring actual Cognito credentials during testing.

The mocking approach consists of:

1. **Mock Auth Manager** (`utils/mockCognito.ts`):

   - Simulates Cognito authentication for tests
   - Creates and verifies JWT tokens for test users
   - Stores registered test users

2. **Mock RequireAuth Hook** (`utils/mockRequireAuth.ts`):
   - Replaces the real requireAuth hook during tests
   - Uses Jest module mocking to swap the real implementation

## How It Works

1. When running tests, we use Jest's module mocking system to replace the real `requireAuth` hook with our mock version:

   ```typescript
   jest.mock('../../../src/Hooks/requireAuth', () => ({
     requireAuth: jest.requireActual('../../utils/mockRequireAuth').requireAuth,
   }));
   ```

2. The real `requireAuth.ts` file checks for `process.env.NODE_ENV === 'test'` to handle test environments differently.

3. When creating test users, we register them with our mock auth manager:

   ```typescript
   const { accessToken, idToken } = mockAuthManager.registerUser(user);
   ```

4. API requests in tests now include both the access token and ID token:

   ```typescript
   return this._testServer
     .post(this._endpoint)
     .send(details)
     .set('authorization', token)
     .set('x-id-token', idToken);
   ```

## Adapting Tests

When updating existing tests:

1. Update the Service class methods to include the idToken parameter
2. Use mockAuthManager.registerUser() to get valid tokens
3. Pass both the access token and ID token in all API requests

## Notes

- The mock tokens are valid only within the test environment
- Tokens are signed with a test-only secret key (`test-secret-key-for-tests-only`)
- No actual Cognito service is called during tests
