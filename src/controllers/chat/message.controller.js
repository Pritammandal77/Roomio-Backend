import { Chat } from "../../models/chat.model.js";
import { Message } from "../../models/message.model.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import { asyncHandler } from "../../utils/AsyncHandler.js";
import mongoose from "mongoose";


export const sendMessage = asyncHandler(async (req, res) => {
    const { chatId, message } = req.body;
    const user = req.user?._id

    if (!chatId || !message) {
        throw new ApiError(400, "ChatId & message is required to send a message")
    }

    let newMessage = await Message.create({
        sender: user,
        content: message,
        chat: chatId,
        seenBy: [user],
        messageType: "text"
    })

    await newMessage.populate("sender", "_id fullName profilePicture");
    await newMessage.populate("chat");

    if (!newMessage) {
        throw new ApiError(500, "error while sending the message")
    }

    await Chat.findByIdAndUpdate(chatId, {
        latestMessage: newMessage._id
    })

    return res
        .status(200)
        .json(
            new ApiResponse(200, newMessage, "message sent successfully")
        )

})

export const fetchMessages = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!chatId) {
        throw new ApiError(400, "Couldn't get the chat ID");
    }

    const messages = await Message.find({ chat: chatId })
        .sort({ createdAt: -1 }) // latest first
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate("sender", "_id fullName profilePicture")
        .populate({
            path: "chat",
            populate: {
                path: "users",
                select: "fullName profilePicture"
            }
        });

    const orderedMessages = messages.reverse(); // oldest → newest

    res.status(200).json(
        new ApiResponse(200, orderedMessages, "Messages fetched successfully")
    );
});


export const markMessagesAsSeen = asyncHandler(async (req, res) => {
    const { chatId } = req.params
    const userId = req.user?._id

    if (!chatId) {
        throw new ApiError(400, "ChatId is required")
    }

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
        throw new ApiError(400, "Invalid chatId format")
    }

    // Update all messages in this chat that:
    // 1. Were NOT sent by the current user
    // 2. Haven't been seen by the current user yet
    await Message.updateMany(
        {
            chat: chatId,
            sender: { $ne: userId },          // not sent by me
            seenBy: { $nin: [userId] }         // not already seen by me
        },
        {
            $addToSet: { seenBy: userId }      // safely add without duplicates
        }
    )

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Messages marked as seen"))
})