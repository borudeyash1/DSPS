import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: Server;

export const initSocket = (httpServer: HttpServer, corsOrigin: string | string[]) => {
    io = new Server(httpServer, {
        cors: {
            origin: corsOrigin,
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            credentials: true
        }
    });

    io.on('connection', (socket: Socket) => {
        console.log('🔌 Client connected:', socket.id);

        socket.on('join_user', (userId: string) => {
            if (userId) {
                socket.join(`user:${userId}`);
                console.log(`👤 Socket ${socket.id} joined user:${userId}`);
            }
        });

        socket.on('join_admin', () => {
            socket.join('admin_room');
            console.log(`🛡️ Socket ${socket.id} joined admin_room`);
        });

        socket.on('disconnect', () => {
            console.log('❌ Client disconnected:', socket.id);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};
