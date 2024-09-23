"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const problemSchema = new mongoose_1.default.Schema({
    problemId: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    }
});
const Problem = mongoose_1.default.model("Problem", problemSchema);
exports.default = Problem;
