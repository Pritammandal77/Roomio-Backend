import { Otp } from "../models/otp.model.js";
import { User } from "../models/user.model.js";
import { sendOtpEmail } from "../services/email.services.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { generateOtp } from "../utils/generateOtp.js";


export const sendOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    // check if already user exists
    const existedUser = await User.findOne({ email });
    if (existedUser) {
        throw new ApiError(409, "User already exists");
    }

    await Otp.deleteMany({ email });

    const otp = generateOtp();

    await Otp.create({
        email,
        otp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        isVerified: false
    });

    await sendOtpEmail(email, otp);

    return res.status(200).json(
        new ApiResponse(200, {}, "OTP sent")
    );
});


export const verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    const record = await Otp.findOne({ email });

    if (!record) throw new ApiError(400, "Invalid OTP");

    if (record.expiresAt < new Date()) {
        throw new ApiError(400, "OTP expired");
    }

    if (record.otp !== otp) {
        throw new ApiError(400, "Wrong OTP");
    }

    // mark verified
    record.isVerified = true;
    await record.save();

    return res.status(200).json(
        new ApiResponse(200, {}, "Email verified")
    );
});


export const resendOtp = async (req, res) => {
    const { email } = req.body;

    await Otp.deleteMany({ email });

    const otp = generateOtp();

    await Otp.create({
        email,
        otp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await sendOtpEmail(email, otp);

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "OTP resent successfully")
        );
};