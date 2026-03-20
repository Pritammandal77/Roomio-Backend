import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
    {
        email: {
            type: String,
            unique: true,
            trim: true,
            required: true,
            lowercase: true
        },
        password: {
            type: String,
            trim: true,
        },
        googleId: {
            type: String,
            index: true,
            default: null,
        },
        authProvider: {
            type: String,
            enum: ["email", "google"],
            required: true
        },
        refreshToken: {
            type: String
        },
        profilePicture: {
            type: String,
            default: ""
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 30
        },
        age: {
            type: Number
        },
        gender: {
            type: String,
            enum: ["male", "female", "others"],
        },
        instagramLink: {
            type: String
        },
        aboutUser: {
            type: String
        }

    },
    {
        timestamps: true
    }
)

export const User = mongoose.model("User", userSchema)