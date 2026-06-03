import mongoose, { Schema } from "mongoose";

const chatSchema = new Schema(
    {
        users: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }],
        latestMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message"
        },
    },
    { timestamps: true }
);

chatSchema.index({ users: 1 }, { unique: true });

export const Chat = mongoose.model("Chat", chatSchema);