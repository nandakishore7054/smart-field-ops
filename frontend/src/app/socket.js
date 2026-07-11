import { io } from 'socket.io-client';
import { getAccessToken } from './api';

export const socket = io('/', {
  autoConnect: false,
});

export function connectSocket(user) {
  if (!user) return;

  // Attach the current JWT access token dynamically for server-side authentication
  // A callback ensures the latest token is fetched on every auto-reconnect attempt
  socket.auth = (cb) => {
    cb({ token: getAccessToken() });
  };

  socket.connect();
  // Room joining is now automatic on the server based on verified JWT identity.
  // No manual 'join' emit is needed.
}

export function disconnectSocket() {
  socket.disconnect();
}

