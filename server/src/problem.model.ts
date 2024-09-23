import mongoose from "mongoose"

const problemSchema = new mongoose.Schema({

    problemId:{

        type: String,
        required: true,

    },
    userId:{

        type: String,
        required: true

    },
    code:{

        type: String,
        required: true

    }
})
const Problem = mongoose.model("Problem", problemSchema)

export default Problem;

