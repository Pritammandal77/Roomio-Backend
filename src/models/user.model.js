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
            default: "https://cdn-icons-png.flaticon.com/512/149/149071.png"
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 30
        },
        dob: {
            type: Date,
            required: true,
            validate: {
                validator: function (value) {
                    return value < new Date();
                },
                message: "DOB must be in the past"
            }
        },
        gender: {
            type: String,
            enum: ["male", "female", "others"],
        },
        mobileNumber: {
            type: String,
            unique: true
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