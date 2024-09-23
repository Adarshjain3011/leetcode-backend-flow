import express from "express";
import WebSocket from "ws";
import { PubSubQueue } from "./Queue";
import { startWorker } from "./Worker";

import cors from "cors";


import dbConnect from "./db";

const app = express();
app.use(express.json());

app.use(cors());

dbConnect();

const clients: Map<string, WebSocket> = new Map(); // Map to track user connections


// Function to send messages to a specific user
const sendToUser = (userId: string, message: string | Buffer): void => {

    console.log("message is sendToUser",message);
    
    const client = clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
        client.send(message.toString()); // Convert Buffer to string if necessary
    } else {
        console.log(`Client for user ${userId} is not connected or has disconnected.`);
    }
};

PubSubQueue.getInstance().subscribe('getSubmission', (message) => {

    console.log("get submission ke andar ");

    const data = JSON.parse(message);
    sendToUser(data.userId, message); // Send message to the appropriate user

});


const startWebSocketServer = async (port: number = 5000): Promise<void> => {
    const wss = new WebSocket.Server({ port });

    wss.on('connection', (ws) => {
        console.log('New client connected');

        ws.on('message', (message: WebSocket.RawData) => {
            try {
                const parsedMessage = message.toString();
                const { userId } = JSON.parse(parsedMessage);
                clients.set(userId, ws); // Store the client with their userId
                console.log(`User ${userId} connected`);
            } catch (error) {
                console.error('Failed to parse client message:', error);
            }
        });

        ws.on('close', () => {
            const disconnectedUserId = [...clients.entries()].find(([userId, client]) => client === ws)?.[0];
            if (disconnectedUserId) {
                clients.delete(disconnectedUserId);
                console.log(`User ${disconnectedUserId} disconnected`);
            }
        });
    });

    console.log(`WebSocket server is running on ws://localhost:${port}`);
};

// Express route handlers
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to the API"
    });
});


app.post("/submit", async (req, res) => {
    console.log("Submission received");

    const { userId, problemId, code } = req.body;
    const submission = { userId, problemId, code };

    try {
        const queue = PubSubQueue.getInstance();
        await queue.addSubmission(submission);

        res.status(200).json({
            message: "Task added successfully",
            data: null,
            error: null
        });
    } catch (error: any) {
        console.error('Error adding submission to queue:', error);
        res.status(500).json({
            message: "Failed to add task",
            data: null,
            error: error.message
        });
    }
});

// Start the servers
const startServers = async () => {
    try {
        await startWebSocketServer();
        // await setupRedis(); // Setup Redis subscription
        startWorker(); // Start the worker
        app.listen(3000, () => {
            console.log("Express server is running on port 3000");
        });
    } catch (error) {
        console.error('Error starting servers:', error);
    }
};

startServers(); // Start the application


