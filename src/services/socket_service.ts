import Env from '../common/config/environment_variables';
// import { ITEM_STATUS } from '../data/enums/enum';
import { Server } from "http";
import { isAuthenticated } from '../common/utils/auth_utils';
import { Socket } from 'socket.io';
import { AppDataSource } from '../data-source';
import SocketConnection from '../entity/SocketConnection';

let io:Socket;
let socket:Socket;
const eventOptions = ["all_events", "sender", "receiver", "receiver_or_sender"]

const socketRepository = AppDataSource.getRepository(SocketConnection)

const createSocketConnection = async (server: Server) => {
    try {

        io = require('socket.io')(server, {
            cors: {
                origin: Env.ALLOWED_ORIGINS,
                methods: ["GET", "POST", "OPTIONS"]
            }
        });
    
        io.use(async (socket:any, next:any) => {
            const token = socket.handshake.auth.token;
            if (await isAuthenticated(token)) {
                next();
            } else {
              next(new Error("Authentication failed"));
            }
        });

        io.on("connection", (_socket) => {
            socket = _socket;

            io.on("subscribe-to-events", handleEventSubscription);
            io.on("disconnect", handleDisconnection);

        });
    } catch (error) {
        throw error;
    }
}

const handleEventSubscription = async (payload: Record<string,any>) => {
    try {
        if (!await isAuthenticated(payload.token)) {
            io.to(socket.id).emit("socket-error", "Authentication failed");
        }

        if (!eventOptions.includes(payload.event)) {
            io.to(socket.id).emit("socket-error", "Events must be any of " + eventOptions.join(", "));
        }
        
        if (!io.rooms.has(payload.event)) {
            io.rooms.add(payload.event)
        }

        io.join(payload.event);
    } catch (error) {
        console.log(error);
        socket.to(socket.id).emit("socket-error", "Server error");
    }
}

const handleDisconnection = async () => {
    try {
        const socketConnection = await socketRepository.findOneBy({socket_ids: socket.id});
        if (socketConnection) {
            socketConnection.socket_ids = socketConnection.socket_ids.filter(socket_id => socket_id != socket.id);
            await socketRepository.save(socketConnection);
        }
    } catch (error) {
        console.log(error)
    }
}

const emitEvent = async (room: string, eventName: string, data:any) => {
    try {
        io.to(room).emit(eventName, data)
        
    } catch (error) {
        console.log(error);
    }
} 
const socketService = {
    createSocketConnection,
    emitEvent
};

export { socketRepository, socketService };
