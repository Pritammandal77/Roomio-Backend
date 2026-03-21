import bcrypt from "bcryptjs";
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


//it is a middleware , it encrypts the password just before saving it in db
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()

    //to hide the real password
    this.password = await bcrypt.hash(this.password, 10)
    next()
})


export const User = mongoose.model("User", userSchema)