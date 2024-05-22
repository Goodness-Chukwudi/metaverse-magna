import Env from '../common/config/environment_variables';
import { ITEM_STATUS } from '../data/enums/enum';
import { Server } from "http";
import { authenticateSocketConnection } from '../common/utils/auth_utils';
import { Socket } from 'socket.io';
import { AppDataSource } from '../data-source';
import SocketConnection from '../entity/SocketConnection';

let io:Socket;
let socket:Socket;

const socketRepository = AppDataSource.getRepository(SocketConnection)

const createSocketConnection = async (server: Server) => {
    try {

        io = require('socket.io')(server, {
            cors: {
                origin: Env.ALLOWED_ORIGINS,
                methods: ["GET", "POST"]
            }
        });
    
        io.on("connection", (_socket) => {
            console.log("connected to socket server with socket id - " + _socket.id);
            socket = _socket;

            _socket.on("request-connection", handleConnection);
            _socket.on("disconnect", handleDisconnection);

        });
    } catch (error) {
        throw error;
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

const handleConnection = async (payLoad: any) => {
    const response = {
        success: false,
        error: "Sorry, an error occurred on the server"
    }
    try {
        const loginSession = await authenticateSocketConnection(payLoad.token);
        const socketConnection = await socketRepository
            .createQueryBuilder("socket")
            .where("socket.user.id = :user", { user: loginSession.user_id})
            .andWhere("socket.status = :status", { status: ITEM_STATUS.ACTIVE})
            .getOne()

        if (socketConnection) {
            if (!socketConnection.socket_ids.includes(socket.id)) {
                socketConnection.socket_ids.push(socket.id);
                await socketRepository.save(socketConnection);
            }
        } else {
            const newConnection = {
                login_session: loginSession.id,
                user_id: loginSession.user_id,
                socket_ids: [socket.id]
            }
            await socketRepository.save(newConnection);
        }
        
    } catch (error:any) {
        if(error.message == "Socket Authentication failed") response.error = "Socket Authentication failed";
        io.to(socket.id).emit("socket-error", response);
    }
} 

const emitEvent = async (socketIds: string[], eventName: string, data:any) => {
    try {
        io.to(socketIds).emit(eventName, data)
        
    } catch (error) {
        console.log(error);
    }
} 
const socketService = {
    createSocketConnection,
    emitEvent
};

export { socketRepository, socketService };
