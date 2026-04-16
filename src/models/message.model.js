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
            required : true
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
        type: {
            type: String,
            enum: ["text", "image", "file"],
            default: "text"
        }
    },
    {
        timestamps: true
    }
)

export const Message = mongoose.model("Message", messageSchema)