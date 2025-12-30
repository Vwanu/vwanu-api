import { AuthManager } from '../../lib/authManagement.class';

export default function socketLogin(io) {
  io.use(async (socket, next) => {
    try {
      const { Authorization:token, 'x-id-token':idToken } = socket.handshake.query;
      const {userPoolId, clientId} = process.env;
      if (!userPoolId || !clientId) {
        throw new Error('Cognito configuration is not set');
      }
      if (!token || !idToken) {
        return next(new Error('Authentication tokens required'));
      }

      const authManager = AuthManager.getInstance();
      authManager.initialize({userPoolId,clientId});

      const userDetails = await authManager.getUserDetails(token as string, idToken as string);
      (socket as any).feathers.user = userDetails;

      next();
    } catch (error: any) {
      console.error('[Socket.IO] Authentication failed', {
        socketId: socket.id,
        error: error.message
      });
      next(new Error('Authentication failed: ' + error.message));
    }
  })};
