import Env from '../common/config/environment_variables';
import { Server } from "http";
import { isAuthenticated } from '../common/utils/auth_utils';
import { Socket } from 'socket.io';
import { EVENT_OPTIONS } from '../data/enums/enum';
import { ITransaction } from '../data/interfaces/interfaces';
import axios from 'axios';

let io:Socket;
let socket:Socket;

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

        });
    } catch (error) {
        throw error;
    }
}

const handleEventSubscription = async (payload: Record<string,any>) => {
    try {
        console.log("io.rooms  ====>>>>>      ", io.rooms)
        const eventOptions = Object.values(EVENT_OPTIONS);

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

const getLatestBlockNumber = async () => {
    try {
        const url = "https://eth.public-rpc.com";
    
        const payload = {
            jsonrpc: "2.0",
            method: "eth_blockNumber",
            params: [],
            id: 1
        }
        const response = await axios.post(url, payload);
    console.log(response.data.result)
        return response.data.result 
    } catch (error:any) {
        console.log(error.message)
    }
}

const fetchBlockAndProcessTransactions = async () => {
    const url = "https://eth.public-rpc.com";
    const latestBlockNumber = await getLatestBlockNumber();

    const payload = {
        jsonrpc: "2.0",
        method: "eth_getBlockByNumber",
        params: [latestBlockNumber, true],
        id: 1
    }
    const response = await axios.post(url, payload);
    if (response.data.result) {
        return console.log("Yeah  ===>>>    ", response.data.result.transactions.length)
        processTransactions
    }
}

const processTransactions = (blockDetails:any) => {
    try {
        console.log("io.rooms  ====>>>>>      ", io.rooms);
        let allEvents:Record<string, ITransaction[]> = {};
        let senderEvents:Record<string, ITransaction[]> = {};
        let receiverEvents:Record<string, ITransaction[]> = {};
        let senderOrReceiverEvents:Record<string, ITransaction[]> = {};
        
        blockDetails.transactions.forEach((transactionItem:any) => {
            const {
                transaction,
                isSenderEvent,
                isReceiverEvent,
                isSenderOrReceiverEvent
            } = analyzeTransaction(transactionItem);
    
            //Only attach a transaction for an event type if a room has been created for that event type
            if (io.rooms?.has(EVENT_OPTIONS.ALL_EVENTS)) {
                allEvents = attachTransactionToEventBlock(allEvents, transaction);
    
            }
            
            if (io.rooms?.has(EVENT_OPTIONS.SENDER) && isSenderEvent) {
                senderEvents = attachTransactionToEventBlock(senderEvents, transaction);
            }
    
            if (io.rooms?.has(EVENT_OPTIONS.RECEIVER) && isReceiverEvent) {
                receiverEvents = attachTransactionToEventBlock(receiverEvents, transaction);
            }
    
            if (io.rooms?.has(EVENT_OPTIONS.SENDER_OR_RECEIVER) && isSenderOrReceiverEvent) {
                senderOrReceiverEvents = attachTransactionToEventBlock(senderOrReceiverEvents, transaction);
            }
        });

        //Emit events after processing transaction info
        if (Object.keys(allEvents).length > 0) {
            io.to(EVENT_OPTIONS.ALL_EVENTS).emit(EVENT_OPTIONS.ALL_EVENTS, allEvents)
        }

        if (Object.keys(senderEvents).length > 0) {
            io.to(EVENT_OPTIONS.SENDER).emit(EVENT_OPTIONS.SENDER, senderEvents)
        }

        if (Object.keys(receiverEvents).length > 0) {
            io.to(EVENT_OPTIONS.RECEIVER).emit(EVENT_OPTIONS.RECEIVER, receiverEvents)
        }
        
        if (Object.keys(senderOrReceiverEvents).length > 0) {
            io.to(EVENT_OPTIONS.SENDER_OR_RECEIVER).emit(EVENT_OPTIONS.SENDER_OR_RECEIVER, senderOrReceiverEvents)
        }
        
    } catch (error) {
        console.log(error);
    }
} 

const analyzeTransaction = (blockTransaction:any) => {
    try {
        let isSenderEvent = false;
        let isReceiverEvent = false;
        let isSenderOrReceiverEvent = false;

        blockTransaction?.accessList?.forEach((access:any) => {
            if (access?.address == blockTransaction.from) {
                isSenderEvent = true;
                isSenderOrReceiverEvent = true;
            }
            if (access?.address == blockTransaction.to) {
                isReceiverEvent = true;
                isSenderOrReceiverEvent = true;
            }
        });

        const gasPrice = parseInt(blockTransaction.gasPrice, 16);
        const value = parseInt(blockTransaction.value, 16);

        const transaction = {
            sender_address: blockTransaction.from,
            receiver_address: blockTransaction.to,
            block_number: blockTransaction.blockNumber,
            block_hash: blockTransaction.blockHash,
            transaction_hash: blockTransaction.hash,
            gas_price_in_wei: gasPrice,
            value_in_wei: value,
        };

        return {
            transaction,
            isSenderEvent,
            isReceiverEvent,
            isSenderOrReceiverEvent
        };
    } catch (error) {
        throw error;
    }
}

const attachTransactionToEventBlock = (eventBlock: Record<string, ITransaction[]>, transaction: ITransaction) => {
    try {
        const valueInEth = transaction.value_in_wei / 1e18; //1ETH equals 1e+18wei from https://ethereum.org
        const valueInDollar = valueInEth * 5000; //from problem statement, 1 ETH = $5,000

        if (valueInDollar >= 0 && valueInDollar <= 100) {
            if (!eventBlock['0-100']) eventBlock['0-100'] = [];
            eventBlock['0-100'].push(transaction);

        } else if (valueInDollar >= 101 && valueInDollar <= 500) {
            if (!eventBlock['100-500']) eventBlock['100-500'] = [];
            eventBlock['100-500'].push(transaction);

        } else if (valueInDollar >= 501 && valueInDollar <= 2000) {
            if (!eventBlock['500-2000']) eventBlock['500-2000'] = [];
            eventBlock['500-2000'].push(transaction);

        } else if (valueInDollar >= 2001 && valueInDollar <= 5000) {
            if (!eventBlock['2000-5000']) eventBlock['2000-5000'] = [];
            eventBlock['2000-5000'].push(transaction);
            
        } else if (valueInDollar > 5000) {
            if (!eventBlock['over-5000']) eventBlock['over-5000'] = [];
            eventBlock['over-5000'].push(transaction);
        }
        
        return eventBlock;
    } catch (error) {
        throw error;
    }
}

export { 
    createSocketConnection,
    fetchBlockAndProcessTransactions
 };

