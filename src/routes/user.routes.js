import { Router } from "express";
import { createNewUser, getCurrentUser, getUserById, loginUser, logOutUser, refreshAccessToken } from "../controllers/user.controller.js";
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

userRouter.route("/login").post(loginUser)

userRouter.route("/logout").post(verifyJWT, logOutUser)

userRouter.get("/user/:id").get(getUserById)

export default userRouter