import mongoose, { Mongoose, Schema } from "mongoose";

const chatSchema = new Schema(
    {
        users: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "User",
            validate: [arr => arr.length === 2, "Chat must have exactly 2 users"]
        },
        latestMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message"
        },
    },
    {
        timestamps: true
    }
)

chatSchema.index({ users: 1 });

export const Chat = mongoose.model("Chat", chatSchema)