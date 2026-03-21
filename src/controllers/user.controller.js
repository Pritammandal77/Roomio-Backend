import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {asyncHandler } from "../utils/AsyncHandler.js"
import { createAccessToken, createRefreshToken } from "../utils/tokenService.js";


export const createNewUser = asyncHandler(async (req, res) => {
    const { email, password, confirmPassword, fullName, dob, mobileNumber, gender } = req.body;

    if (!email || !password || !confirmPassword || !fullName || !dob || !mobileNumber || !gender) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({ email });

    if (existedUser) {
        throw new ApiError(409, "User with this email already exist");
    }

    if (password !== confirmPassword) {
        throw new ApiError(400, "Passwords do not match");
    }

    const user = await User.create(
        {
            email,
            password,
            fullName,
            dob,
            mobileNumber,
            gender,
            authProvider: "email"
        }
    )

    const accessToken = createAccessToken(user);

    const { token: refreshToken, id: refreshId } = await createRefreshToken({
        userId: user._id,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
    });

    const isProd = process.env.NODE_ENV === "production";

    const cookieOptions = {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "None" : "Lax",
        path: "/",
    };

    res.cookie("access_token", accessToken, {
        ...cookieOptions,
        maxAge: 2 * 60 * 60 * 1000,
    });

    res.cookie("refresh_token", refreshToken, {
        ...cookieOptions,
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.cookie("refresh_token_id", refreshId.toString(), {
        ...cookieOptions,
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res
        .status(201)
        .json(
            new ApiResponse(200,
                {
                    _id: user._id,
                    email: user.email,
                    fullName: user.fullName,
                },
                "User registered successfully")
        )


})