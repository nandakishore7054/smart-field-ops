import { io } from 'socket.io-client';

export const socket = io('/', {
  autoConnect: false,
});

export function connectSocket(user) {
  if (!user) return;
  socket.connect();
  socket.emit('join', {
    userId: user._id,
    role: user.role,
  });
}

export function disconnectSocket() {
  socket.disconnect();
}
