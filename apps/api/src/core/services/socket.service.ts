// core/services/socket.service.ts
import { Server as HttpServer } from 'node:http';
import { Server, Socket } from 'socket.io';
import { CorsConfig } from '../config/server.config';
import logger from '../utils/logger';
import { registerTeacherHandlers } from '../../modules/teacher/teacher.handlers';


// 1. Keep the instance isolated inside the module file scope
let ioInstance: Server | null = null;

/**
 * Clean getter to access the Socket server anywhere.
 * Simple import: import { io } from '@/core/services/socket'
 */
export const io = {
  get server(): Server {
    if (!ioInstance) {
      throw new Error('❌ Socket.io has not been initialized yet. Call initializeSocket() during startup.');
    }
    return ioInstance;
  }
};

/**
 * Initializes the socket server once during application bootstrap
 */
export function initializeSocket(server: HttpServer): Server {
  if (ioInstance) return ioInstance;

  logger.info('🔌 Initializing real-time Socket.io subsystems...');

  ioInstance = new Server(server, {
    cors: {
      origin: CorsConfig.whitelist,
      credentials: true,
    },
  });

  // Global connection orchestration
  ioInstance.on('connection', (socket: Socket) => {
    logger.info(`🔌 Client connected: [ID: ${socket.id}]`);

    // Dynamically register functional module handlers
    registerModules(socket);

    socket.on('disconnect', () => {
      logger.info(`❌ Client disconnected: [ID: ${socket.id}]`);
    });
  });

  return ioInstance;
}

function registerModules(socket: Socket) {
  registerTeacherHandlers(socket)  
}
