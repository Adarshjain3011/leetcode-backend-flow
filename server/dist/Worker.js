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
exports.startWorker = void 0;
// worker.ts
const Queue_1 = require("./Queue");
const problem_model_1 = __importDefault(require("./problem.model"));
// import dbConnect from '../db';
function processSubmission(submission) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Processing submission: ${JSON.stringify(submission)}`);
        const result = { success: true, userId: submission.userId, problemId: submission.problemId, code: submission.code };
        // create the new problme  
        // dbConnect();
        try {
            const newProblem = yield problem_model_1.default.create({
                userId: submission.userId,
                problemId: submission.problemId,
                code: submission.code,
            });
            console.log("Problem created successfully", newProblem);
        }
        catch (error) {
            console.log("Problem creation failed", error);
        }
        return result;
    });
}
function startWorker() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Starting the worker...");
        const pubSubQueue = Queue_1.PubSubQueue.getInstance();
        while (true) {
            try {
                console.log("Waiting for submissions...");
                const submission = yield pubSubQueue.fetchSubmission();
                if (submission) {
                    const processingResult = yield processSubmission(submission);
                    yield pubSubQueue.publish('getSubmission', JSON.stringify(processingResult));
                    console.log(`Published result: ${JSON.stringify(processingResult)}`);
                }
            }
            catch (err) {
                console.error('Error fetching submission from queue:', err);
            }
        }
    });
}
exports.startWorker = startWorker;
