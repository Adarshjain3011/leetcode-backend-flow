import mongoose from "mongoose";

const dbConnect = async () => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/pub-subTest", {});
        console.log("MongoDB connected successfully!");
    } catch (error) {
        console.error("MongoDB connection error:", error);
    }
};

export default dbConnect;


