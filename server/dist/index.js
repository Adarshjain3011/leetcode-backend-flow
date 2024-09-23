"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ws_1 = __importDefault(require("ws"));
const Queue_1 = require("./Queue");
const Worker_1 = require("./Worker");
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./db"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
(0, db_1.default)();
const clients = new Map(); // Map to track user connections
// Function to send messages to a specific user
const sendToUser = (userId, message) => {
    console.log("message is sendToUser", message);
    const client = clients.get(userId);
    if (client && client.readyState === ws_1.default.OPEN) {
        client.send(message.toString()); // Convert Buffer to string if necessary
    }
    else {
        console.log(`Client for user ${userId} is not connected or has disconnected.`);
    }
};
Queue_1.PubSubQueue.getInstance().subscribe('getSubmission', (message) => {
    console.log("get submission ke andar ");
    const data = JSON.parse(message);
    sendToUser(data.userId, message); // Send message to the appropriate user
});
const startWebSocketServer = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (port = 5000) {
    const wss = new ws_1.default.Server({ port });
    wss.on('connection', (ws) => {
        console.log('New client connected');
        ws.on('message', (message) => {
            try {
                const parsedMessage = message.toString();
                const { userId } = JSON.parse(parsedMessage);
                clients.set(userId, ws); // Store the client with their userId
                console.log(`User ${userId} connected`);
            }
            catch (error) {
                console.error('Failed to parse client message:', error);
            }
        });
        ws.on('close', () => {
            var _a;
            const disconnectedUserId = (_a = [...clients.entries()].find(([userId, client]) => client === ws)) === null || _a === void 0 ? void 0 : _a[0];
            if (disconnectedUserId) {
                clients.delete(disconnectedUserId);
                console.log(`User ${disconnectedUserId} disconnected`);
            }
        });
    });
    console.log(`WebSocket server is running on ws://localhost:${port}`);
});
// Express route handlers
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to the API"
    });
});
app.post("/submit", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Submission received");
    const { userId, problemId, code } = req.body;
    const submission = { userId, problemId, code };
    try {
        const queue = Queue_1.PubSubQueue.getInstance();
        yield queue.addSubmission(submission);
        res.status(200).json({
            message: "Task added successfully",
            data: null,
            error: null
        });
    }
    catch (error) {
        console.error('Error adding submission to queue:', error);
        res.status(500).json({
            message: "Failed to add task",
            data: null,
            error: error.message
        });
    }
}));
// Start the servers
const startServers = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield startWebSocketServer();
        // await setupRedis(); // Setup Redis subscription
        (0, Worker_1.startWorker)(); // Start the worker
        app.listen(3000, () => {
            console.log("Express server is running on port 3000");
        });
    }
    catch (error) {
        console.error('Error starting servers:', error);
    }
});
startServers(); // Start the application
