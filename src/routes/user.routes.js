import { Router } from "express";
import { createNewUser, editProfile, getCurrentUser, getUserById, loginUser, logOutUser, refreshAccessToken } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { googleAuthCallback } from "../controllers/user.controller.js";
import passport from "passport";

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

userRouter.route("/:id").get(getUserById)

userRouter.route("/edit-profile").put(
    verifyJWT,
    upload.fields([
        {
            name: "profilePicture",
            maxCount: 1
        }
    ]),
    editProfile
);


// for OAuth

// Route to start the Google flow
userRouter.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google callback route
userRouter.get(
    "/auth/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: "/login" }),
    googleAuthCallback // This controller handles your JWTs and cookies
);

export default userRouter