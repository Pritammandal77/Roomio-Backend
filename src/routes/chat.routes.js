import { Router } from "express";
import { createOrFetchChat, fetchChats } from "../controllers/chat/chat.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { fetchMessages, sendMessage } from "../controllers/chat/message.controller.js";

export const chatRouter = Router()

chatRouter.route("/new").post(verifyJWT, createOrFetchChat)
chatRouter.route("/all").get(verifyJWT, fetchChats)

chatRouter.route("/message/new").post(verifyJWT, sendMessage)
chatRouter.route("/messages/all/:chatId").get(verifyJWT, fetchMessages)

export default chatRouter