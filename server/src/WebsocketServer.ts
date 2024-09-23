// import WebSocket from 'ws';
// import { PubSubQueue } from './Queue';

// const clients: Map<string, WebSocket> = new Map(); // Map to track user connections

// // Function to send messages to a specific user
// const sendToUser = (userId: string, message: string | Buffer) => {
//     const client = clients.get(userId);
//     if (client && client.readyState === WebSocket.OPEN) {
//         client.send(message.toString()); // Convert Buffer to string
//     } else {
//         console.log(`Client for user ${userId} is not connected or has disconnected.`);
//     }
// };

// // Setup Redis and subscribe to the 'getSubmission' channel
// async function setupRedis(pubSubQueue: PubSubQueue) {
//     await pubSubQueue.subscribe('getSubmission', (message) => {
//         try {
//             const data = JSON.parse(message);
//             sendToUser(data.userId, message); // Send message to the appropriate user
//         } catch (error) {
//             console.error('Failed to parse message:', error);
//         }
//     });
// }

// // Function to start the WebSocket server
// export async function startWebSocketServer(port: number = 5000) {
//     const wss = new WebSocket.Server({ port });

//     wss.on('connection', async (ws) => {
//         console.log('New client connected');

//         ws.on('message', async (message: WebSocket.RawData) => {
//             try {
//                 // Ensure message is a string before parsing
//                 const parsedMessage = typeof message === 'string' ? message : message.toString();

//                 const { userId } = JSON.parse(parsedMessage); // Now this should work without errors
//                 clients.set(userId, ws); // Store the client with their userId
//                 console.log(`User ${userId} connected`);
//             } catch (error) {
//                 console.error('Failed to parse client message:', error);
//             }
//         });

//         ws.on('close', () => {
//             // Handle disconnection logic
//             let disconnectedUserId: string | undefined;
//             clients.forEach((client, userId) => {
//                 if (client === ws) {
//                     disconnectedUserId = userId;
//                     clients.delete(userId);
//                 }
//             });

//             if (disconnectedUserId) {
//                 console.log(`User ${disconnectedUserId} disconnected`);
//             }
//         });
//     });

//     try {
//         const pubSubQueue = await PubSubQueue.getInstance();
//         await setupRedis(pubSubQueue);
//     } catch (error) {
//         console.error('Error setting up PubSubQueue:', error);
//     }

//     console.log(`WebSocket server is running on ws://localhost:${port}`);
// }
