import { Router } from "express";
import { createNewUser, getCurrentUser, refreshAccessToken } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const userRouter = Router()

userRouter
    .route("/register")
    .post(
        upload.fields(
            [
                { name: "profilePicture", maxCount: 1 }
            ]
        ),
        createNewUser
    )

userRouter.route("/refresh-access-token").post(refreshAccessToken)

userRouter.route("/me").get(verifyJWT, getCurrentUser)

export default userRouter