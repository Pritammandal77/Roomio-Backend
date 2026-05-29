import { Router } from "express";
import { createOrFetchChat, fetchChats } from "../controllers/chat/chat.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { fetchMessages, markMessagesAsSeen, sendMessage } from "../controllers/chat/message.controller.js";

const chatRouter = Router()

chatRouter.route("/new").post(verifyJWT, createOrFetchChat)
chatRouter.route("/all").get(verifyJWT, fetchChats)

chatRouter.route("/message/new").post(verifyJWT, sendMessage)
chatRouter.route("/messages/all/:chatId").get(verifyJWT, fetchMessages)

chatRouter.route("/messages/seen/:chatId").patch(verifyJWT, markMessagesAsSeen)

export default chatRouter