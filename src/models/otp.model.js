import mongoose, { mongo } from "mongoose";
import { Schema } from "mongoose";

const otpSchema = new Schema(
    {
        email: {
            type: String,
            required: true
        },
        otp: String,
        isVerified: {
            type: Boolean,
            default: false
        },
        expiresAt: {
            type: Date,
            expires: 0
        }
    }
);

export const Otp = mongoose.model("Otp", otpSchema)