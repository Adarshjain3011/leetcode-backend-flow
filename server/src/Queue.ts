import { createClient, RedisClientType } from 'redis';

interface Submission {
    userId: string;
    problemId: string;
    code: string;
}



export class PubSubQueue {
    
    private static instance: PubSubQueue;
    public redisClient: RedisClientType; // For regular Redis operations
    public publishClient: RedisClientType; // For publishing messages
    public subscribeClient: RedisClientType; // For subscribing to messages

    private constructor() {
        this.redisClient = createClient({ url: 'redis://localhost:6379' });
        this.publishClient = createClient({ url: 'redis://localhost:6379' });
        this.subscribeClient = createClient({ url: 'redis://localhost:6379' });

        this.connect();
    }

    private async connect() {
        try {
            await Promise.all([
                this.redisClient.connect(),
                this.publishClient.connect(),
                this.subscribeClient.connect()
            ]);
            console.log('All clients connected');
        } catch (err) {
            console.error('Redis connection error:', err);
        }
    }

    public static getInstance(): PubSubQueue {
        if (!PubSubQueue.instance) {
            PubSubQueue.instance = new PubSubQueue();
        }
        return PubSubQueue.instance;
    }


    public async fetchSubmission(): Promise<Submission | null> {
        try {
            const result = await this.redisClient.brPop('problem-queue', 5);
            
            console.log("result at the fetch submission ",typeof result);

            if (result) {
                return JSON.parse(result.element);
            }
            return null;
        } catch (err) {
            console.error('Error fetching submission from queue:', err);
            return null;
        }
    }

    public async addSubmission(submission: Submission): Promise<void> {
        try {
            console.log("Adding submission to queue...");
            await this.redisClient.lPush('problem-queue', JSON.stringify(submission));
            console.log(`Submission added to queue: ${JSON.stringify(submission)}`);
        } catch (err) {
            console.error('Error adding submission to queue:', err);
        }
    }

    public async publish(channel: string, message: string): Promise<void> {
        try {
            if (this.publishClient.isOpen) {
                await this.publishClient.publish(channel, message);
                console.log(`Message published to channel ${channel}: ${message}`);
            } else {
                console.error('Publish client is not connected. Cannot publish message.');
            }
        } catch (err) {
            console.error('Error publishing message to channel:', err);
        }
    }

    public async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
        try {
            if (this.subscribeClient.isOpen) {
                await this.subscribeClient.subscribe(channel, (message) => {
                    console.log(`Received message on channel ${channel}: ${message}`);
                    callback(message);
                });
                console.log(`Subscribed to channel: ${channel}`);
            } else {
                console.error('Subscribe client is not connected. Cannot subscribe to channel.');
            }
        } catch (err) {
            console.error(`Error subscribing to channel ${channel}:`, err);
        }
    }
}
