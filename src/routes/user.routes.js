import { Router } from "express";
import { createNewUser } from "../controllers/user.controller.js";


const userRouter = Router()

userRouter.route("/register").post(createNewUser)

export default userRouter