import { asyncHandler } from "../../utils/AsyncHandler.js"
import { ApiError } from "../../utils/ApiError.js"
import { Chat } from "../../models/chat.model.js"
import { ApiResponse } from "../../utils/ApiResponse.js"

export const createOrFetchChat = asyncHandler(async (req, res) => {
    const currUser = req.user?._id

    const { userId } = req.body

    if (!userId) {
        throw new ApiError(400, "UserId is required")
    }

    if (userId == currUser.toString()) {
        throw new ApiError(400, "You cannot create a chat with yourself");
    }

    const users = [currUser.toString(), userId.toString()].sort();

    let chat = await Chat.findOne({ users })
        .populate("users", "profilePicture fullName")
        .populate({
            path: "latestMessage",
            populate: {
                path: "sender",
                select: "fullName profilePicture"
            }
        });

    if (chat) {
        return res.status(200).json(
            new ApiResponse(200, chat, "Chat fetched successfully")
        );
    }

    const createdChat = await Chat.create({ users });

    chat = await Chat.findById(createdChat._id)
        .populate("users", "profilePicture fullName")
        .populate({
            path: "latestMessage",
            populate: {
                path: "sender",
                select: "fullName profilePicture"
            }
        });

    return res.status(201).json(
        new ApiResponse(201, chat, "Chat created successfully")
    );
})

export const fetchChats = asyncHandler(async (req, res) => {
    const user = req.user?._id

    const chats = await Chat.find({
        users: user
    })
        .populate("users", "profilePicture fullName")
        .populate({
            path: "latestMessage",
            populate: {
                path: "sender",
                select: "fullName profilePicture"
            }
        })
        .sort({ updatedAt: -1 })

    res
        .status(200)
        .json(
            new ApiResponse(200, chats, "chats fetched successfully")
        )
})