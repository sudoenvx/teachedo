import { Socket } from "socket.io";

export function registerTeacherHandlers(socket: Socket) {
    socket.on('something', () => {})
}