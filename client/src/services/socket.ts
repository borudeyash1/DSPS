import { io, Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// Remove /api suffix for socket connection
const SOCKET_URL = API_URL.replace(/\/api$/, '');

let socket: Socket | null = null;

export const initSocket = () => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            withCredentials: true,
            autoConnect: true,
            reconnection: true,
            transports: ['websocket', 'polling'], // Try websocket, fallback to polling
        });

        socket.on('connect', () => {
            console.log('🔌 Connected to socket server:', socket?.id);
        });

        socket.on('connect_error', (err) => {
            console.error('Socket connection error:', err);
        });
    }
    return socket;
};

export const getSocket = () => {
    if (!socket) {
        return initSocket();
    }
    return socket;
};

export const joinUserRoom = (userId: string) => {
    const s = getSocket();
    if (s && userId) {
        s.emit('join_user', userId);
    }
};

export const joinAdminRoom = () => {
    const s = getSocket();
    if (s) {
        s.emit('join_admin');
    }
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
