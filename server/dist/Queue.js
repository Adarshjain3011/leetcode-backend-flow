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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PubSubQueue = void 0;
const redis_1 = require("redis");
class PubSubQueue {
    constructor() {
        this.redisClient = (0, redis_1.createClient)({ url: 'redis://localhost:6379' });
        this.publishClient = (0, redis_1.createClient)({ url: 'redis://localhost:6379' });
        this.subscribeClient = (0, redis_1.createClient)({ url: 'redis://localhost:6379' });
        this.connect();
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield Promise.all([
                    this.redisClient.connect(),
                    this.publishClient.connect(),
                    this.subscribeClient.connect()
                ]);
                console.log('All clients connected');
            }
            catch (err) {
                console.error('Redis connection error:', err);
            }
        });
    }
    static getInstance() {
        if (!PubSubQueue.instance) {
            PubSubQueue.instance = new PubSubQueue();
        }
        return PubSubQueue.instance;
    }
    fetchSubmission() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.redisClient.brPop('problem-queue', 5);
                console.log("result at the fetch submission ", typeof result);
                if (result) {
                    return JSON.parse(result.element);
                }
                return null;
            }
            catch (err) {
                console.error('Error fetching submission from queue:', err);
                return null;
            }
        });
    }
    addSubmission(submission) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("Adding submission to queue...");
                yield this.redisClient.lPush('problem-queue', JSON.stringify(submission));
                console.log(`Submission added to queue: ${JSON.stringify(submission)}`);
            }
            catch (err) {
                console.error('Error adding submission to queue:', err);
            }
        });
    }
    publish(channel, message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.publishClient.isOpen) {
                    yield this.publishClient.publish(channel, message);
                    console.log(`Message published to channel ${channel}: ${message}`);
                }
                else {
                    console.error('Publish client is not connected. Cannot publish message.');
                }
            }
            catch (err) {
                console.error('Error publishing message to channel:', err);
            }
        });
    }
    subscribe(channel, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.subscribeClient.isOpen) {
                    yield this.subscribeClient.subscribe(channel, (message) => {
                        console.log(`Received message on channel ${channel}: ${message}`);
                        callback(message);
                    });
                    console.log(`Subscribed to channel: ${channel}`);
                }
                else {
                    console.error('Subscribe client is not connected. Cannot subscribe to channel.');
                }
            }
            catch (err) {
                console.error(`Error subscribing to channel ${channel}:`, err);
            }
        });
    }
}
exports.PubSubQueue = PubSubQueue;
