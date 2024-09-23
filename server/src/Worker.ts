// worker.ts
import { PubSubQueue } from './Queue';

import Problem from "./problem.model";

// import dbConnect from '../db';

async function processSubmission(submission: any) {
    console.log(`Processing submission: ${JSON.stringify(submission)}`);
    const result = { success: true, userId: submission.userId,problemId:submission.problemId,code:submission.code };

    // create the new problme  

    // dbConnect();

    try{

        const newProblem = await Problem.create({
    
            userId: submission.userId,
            problemId: submission.problemId,
            code: submission.code,
    
        })

        console.log("Problem created successfully", newProblem);


    }catch(error){

        console.log("Problem creation failed", error);

    }


    return result;

}

export async function startWorker() {
    console.log("Starting the worker...");

    const pubSubQueue = PubSubQueue.getInstance();

    while (true) {
        try {
            console.log("Waiting for submissions...");
            const submission = await pubSubQueue.fetchSubmission();
            if (submission) {
                const processingResult = await processSubmission(submission);
                await pubSubQueue.publish('getSubmission', JSON.stringify(processingResult));
                console.log(`Published result: ${JSON.stringify(processingResult)}`);
            }
        } catch (err) {
            console.error('Error fetching submission from queue:', err);
        }
    }
}
