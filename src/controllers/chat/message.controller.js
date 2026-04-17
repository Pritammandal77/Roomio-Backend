import { Chat } from "../../models/chat.model.js";
import { Message } from "../../models/message.model.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import { asyncHandler } from "../../utils/AsyncHandler.js";


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
    const { chatId } = req.params
    const { page = 1, limit = 20 } = req.query;

    if (!chatId) {
        throw new ApiError(400, "could'nt get the chat ID")
    }

    const messages = await Message.find({ chat: chatId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate(
            "sender", "_id fullName profilePicture"
        )

    if (!messages.length) {
        throw new ApiError(500, "Error while fetching the messages")
    }

    res
        .status(200)
        .json(
            new ApiResponse(200, messages, "messages fetched successfully")
        )
})

