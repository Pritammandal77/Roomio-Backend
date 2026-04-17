import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        content: {
            type: String,
            trim: true,
            required: true
        },
        chat: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat",
            required: true
        },
        seenBy: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
        messageType: {
            type: String,
            enum: ["text", "image", "file"],
            default: "text"
        }
    },
    { timestamps: true }
);

messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

export const Message = mongoose.model("Message", messageSchema);