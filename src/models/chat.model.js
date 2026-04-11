import mongoose, { Mongoose, Schema } from "mongoose";

const chatSchema = new Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        message : {
            type : String,
            required : true,
        }
    },
    {
        timestamps: true
    }
)


export const Chat = mongoose.model("Chat", chatSchema)