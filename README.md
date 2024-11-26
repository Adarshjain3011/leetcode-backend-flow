Flow Of Execution 

![image](https://github.com/user-attachments/assets/36deee13-8de1-43a5-83bd-924deeae1004)

![image](https://github.com/user-attachments/assets/1572e9ec-3250-4559-ac89-51c4d106db7d)



# Code Submission Queue with Pub/Sub and Worker

This project implements a queue system using Redis for handling code submissions. A worker continuously fetches submissions from the queue, processes them, stores the results in a database, and publishes the result back through a Redis channel.

## Features

- **Redis-based Queue**: Code submissions are added to a Redis queue.
- **Worker Process**: A worker fetches submissions from the queue, processes them, and publishes the results to a channel.
- **Database Integration**: Submissions are saved in a MongoDB database (or other DB depending on your configuration).
- **Pub/Sub System**: The results of the submission processing are published to a Redis channel, which can be subscribed to by other services.

## Technologies Used

- **Redis**: For queueing and pub/sub communication.
- **Node.js**: Backend runtime for the worker and API.
- **TypeScript**: Static typing for better code quality.
- **MongoDB (or any other DB)**: For persisting processed submissions.
- **Axios**: For making HTTP requests to external services.
- **WebSocket**: For real-time communication between the client and server.

## Installation and Setup

### Prerequisites

- Node.js (v14.x or later)
- Redis server running locally or remotely
- MongoDB (optional if you are storing submissions in a database)

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/your-repo.git
   cd your-repo

2. Install dependencies:

bash
Copy code
npm install
3. Set up Redis server locally (if you don’t already have it):

bash
Copy code
redis-server
(Optional) If using MongoDB, ensure it's running locally or remotely. Update the connection string in your environment variables if needed.

4. Update your environment variables:

Create a .env file in the root of the project with the following (adjust values as needed):
env
Copy code
REDIS_URL=redis://localhost:6379
MONGO_URI=mongodb://localhost:27017/yourdb


