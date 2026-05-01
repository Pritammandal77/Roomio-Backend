import bcrypt from "bcryptjs";
import { RefreshToken } from "../models/refreshToken.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js"
import { createAccessToken, createRefreshToken } from "../utils/tokenService.js";
import jwt from "jsonwebtoken";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Preference } from "../models/preference.model.js";
import { Otp } from "../models/otp.model.js";


// API flow
// User sends form →
// Backend →
// User created →
// Access token generated →
// Refresh token stored in DB →
// Cookies set →
// User logged in 
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

    const profilePictureLocalPath = req.files?.profilePicture?.[0]?.path;

    let profilePictureLiveURL;
    if (profilePictureLocalPath) {
        const profilePicture = await uploadOnCloudinary(profilePictureLocalPath);
        if (!profilePicture?.url) {
            throw new ApiError(400, "Error while uploading profile picture");
        }
        profilePictureLiveURL = profilePicture.url;
    }

    const user = await User.create(
        {
            email,
            password,
            fullName,
            dob,
            mobileNumber,
            gender,
            profilePicture: profilePictureLiveURL,
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

    // const cookieOptions = {
    //     httpOnly: true,
    //     secure: isProd,
    //     sameSite: isProd ? "None" : "Lax",
    //     path: "/",
    // };

    const cookieOptions = {
        httpOnly: true,
        secure: true, // Always true for HTTPS (all live servers)
        sameSite: isProd ? "none" : "lax", // Use lowercase "none"
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
            new ApiResponse(201,
                {
                    _id: user._id,
                    email: user.email,
                    fullName: user.fullName,
                },
                "User registered successfully")
        )
})


export const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                req.user,
                "current user fetched successfully"
            ))
})


export const getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    console.log(id)
    const user = await User.findById(id);

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    // lean() returns a plain JS object instead of a Mongoose document, improving read performance
    const preference = await Preference.findOne({ user }).lean();

    if (!preference) {
        return res
            .status(200)
            .json(
                new ApiResponse(200, { user }, "No preference found")
            )
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, { user, preference }, "User profile fetched successfully")
        )
})

// API Flow
// Client sends request → Reads refresh_token + id → DB verify → bcrypt compare → New access token → Cookie updated ✅
export const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        const refreshPlain = req.cookies['refresh_token'];
        const refreshId = req.cookies['refresh_token_id'];

        const isProd = process.env.NODE_ENV === "production";
        const COOKIE_DOMAIN = isProd ? process.env.COOKIE_DOMAIN : undefined;

        if (!refreshPlain || !refreshId) {
            return res
                .status(401)
                .json(
                    { error: 'No refresh token' }
                );
        }

        const doc = await RefreshToken.findById(refreshId);
        if (!doc) return res
            .status(401)
            .json(
                { error: 'Invalid refresh token id' }
            );

        if (new Date() > doc.expiresAt) {
            await RefreshToken.findByIdAndDelete(refreshId);
            return res.status(401).json({ error: 'Refresh token expired' });
        }

        const ok = await bcrypt.compare(refreshPlain, doc.tokenHash);
        if (!ok) {
            return res
                .status(401)
                .json(
                    {
                        error: 'Refresh token mismatch'
                    }
                );
        }

        const user = await User.findById(doc.user);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const newAccessToken = createAccessToken(user);

        // const cookieOptions = {
        //     httpOnly: true,
        //     secure: isProd,
        //     sameSite: isProd ? 'None' : 'Lax',
        //     path: '/',
        //     domain: COOKIE_DOMAIN,
        // };

        const cookieOptions = {
            httpOnly: true,
            secure: true, // Always true for HTTPS (all live servers)
            sameSite: isProd ? "none" : "lax", // Use lowercase "none"
            path: "/",
        };

        res.cookie('access_token', newAccessToken, { ...cookieOptions, maxAge: 2 * 60 * 60 * 1000 });

        return res
            .json(
                {
                    ok: true,
                    message: "Access token refreshed"
                }
            );
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
    }
})


export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        throw new ApiError(400, "Email & password is required to login")
    }

    const user = await User.findOne({ email })

    if (!user) {
        throw new ApiError(401, "Invalid email or password")
    }

    //we are using the isPasswordCorrect method define in the user.model.js
    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password")
    }

    const accessToken = createAccessToken(user);

    const { token: refreshToken, id: refreshId } = await createRefreshToken({
        userId: user._id,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
    });

    const isProd = process.env.NODE_ENV === "production";

    // const cookieOptions = {
    //     httpOnly: true,
    //     secure: isProd,
    //     sameSite: isProd ? "None" : "Lax",
    //     path: "/",
    // };

    const cookieOptions = {
        httpOnly: true,
        secure: true, // Always true for HTTPS (all live servers)
        sameSite: isProd ? "none" : "lax", // Use lowercase "none"
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

    const loggedInUserData = await User.findById(user._id).select("-password")

    return res
        .status(200)
        .json(
            new ApiResponse(200, loggedInUserData, "User loggedIn successfully")
        )
})

export const logOutUser = asyncHandler(async (req, res) => {
    const isProd = process.env.NODE_ENV === "production";

    const cookieOptions = {
        httpOnly: true,
        secure: true, // Match the setting used in login/register
        sameSite: isProd ? "none" : "lax",
        path: "/",
    };

    await RefreshToken.findByIdAndDelete(req.cookies.refresh_token_id);

    return res
        .status(200)
        .clearCookie("access_token", cookieOptions)
        .clearCookie("refresh_token", cookieOptions)
        .clearCookie("refresh_token_id", cookieOptions)
        .json(new ApiResponse(200, {}, "User logged Out successfully"))
})


// With OTP flow : Working conrrectly 
// export const createNewUser = asyncHandler(async (req, res) => {
//     const { email, password, confirmPassword, fullName, dob, mobileNumber, gender } = req.body;

//     if (!email || !password || !confirmPassword || !fullName || !dob || !mobileNumber || !gender) {
//         throw new ApiError(400, "All fields are required");
//     }

//     const existedUser = await User.findOne({ email });
//     if (existedUser) {
//         throw new ApiError(409, "User already exists");
//     }

//     if (password !== confirmPassword) {
//         throw new ApiError(400, "Passwords do not match");
//     }

//     // CHECK VERIFIED EMAIL
//     const otpRecord = await Otp.findOne({ email });

//     if (!otpRecord || !otpRecord.isVerified) {
//         throw new ApiError(403, "Please verify your email first");
//     }

//     // profile upload
//     const profilePictureLocalPath = req.files?.profilePicture?.[0]?.path;

//     let profilePictureLiveURL;
//     if (profilePictureLocalPath) {
//         const profilePicture = await uploadOnCloudinary(profilePictureLocalPath);
//         profilePictureLiveURL = profilePicture?.url;
//     }

//     const user = await User.create({
//         email,
//         password,
//         fullName,
//         dob,
//         mobileNumber,
//         gender,
//         profilePicture: profilePictureLiveURL,
//         authProvider: "email",
//         isVerified: true
//     });


//     const accessToken = createAccessToken(user);

//     const { token: refreshToken, id: refreshId } = await createRefreshToken({
//         userId: user._id,
//         ip: req.ip,
//         userAgent: req.headers["user-agent"],
//     });

//     const isProd = process.env.NODE_ENV === "production";

//     const cookieOptions = {
//         httpOnly: true,
//         secure: isProd,
//         sameSite: isProd ? "None" : "Lax",
//         path: "/",
//     };

//     res.cookie("access_token", accessToken, {
//         ...cookieOptions,
//         maxAge: 2 * 60 * 60 * 1000,
//     });

//     res.cookie("refresh_token", refreshToken, {
//         ...cookieOptions,
//         maxAge: 30 * 24 * 60 * 60 * 1000,
//     });

//     res.cookie("refresh_token_id", refreshId.toString(), {
//         ...cookieOptions,
//         maxAge: 30 * 24 * 60 * 60 * 1000,
//     });

//     // delete OTP after success
//     await Otp.deleteMany({ email });

//     return res
//         .status(201)
//         .json(
//             new ApiResponse(201,
//                 {
//                     _id: user._id,
//                     email: user.email,
//                     fullName: user.fullName,
//                 },
//                 "User registered successfully")
//         )
// });


export const editProfile = asyncHandler(async (req, res) => {
    const { fullName, dob, mobileNumber, gender, instagramLink, aboutUser } = req.body;
    const userId = req.user?._id;

    const profilePictureLocalPath = req.files?.profilePicture?.[0]?.path;
    let profilePictureLiveURL;

    if (profilePictureLocalPath) {
        const profilePicture = await uploadOnCloudinary(profilePictureLocalPath);
        if (!profilePicture?.url) {
            throw new ApiError(400, "Error while uploading profile picture");
        }
        profilePictureLiveURL = profilePicture.url;
    }

    const updateFields = {
        fullName,
        dob,
        mobileNumber,
        gender,
        instagramLink,
        aboutUser,
    };

    if (profilePictureLiveURL) {
        updateFields.profilePicture = profilePictureLiveURL;
    }

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateFields },
        {
            new: true,
            runValidators: true
        }
    ).select("-password");

    if (!updatedUser) {
        throw new ApiError(404, "User not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedUser, "Profile updated successfully")
        );
});