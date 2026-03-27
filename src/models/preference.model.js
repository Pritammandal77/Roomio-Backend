import mongoose, { Schema } from "mongoose";


const preferenceSchema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },
        budget: {
            min: {
                type: Number,
                required: true
            },
            max: {
                type: Number,
                required: true
            }
        },
        occupation: {
            type: String,
            required: true
        },
        personality: {
            type: String,
            enum: ["introvert", "extrovert", "ambivert"]
        },
        lifestyle: {
            smoking: Boolean,
            drinking: Boolean,
            sleepSchedule: {
                type: String,
                enum: ["early", "late"]
            },
            cleanliness: {
                type: Number,
                min: 1,
                max: 5
            },
            foodPreference: {
                type: String,
                enum: ["veg", "non-veg"]
            },
            pets: {
                type: Boolean,
            },
            gender: {
                type: String,
                enum: ["male", "female", "others"]
            }
        },
        workStyle: {
            type: String,
            enum: ["WFO", "WFH", "Hybrid"]
        },
    },
    {
        timestamps: true
    }
)

export const Preference = mongoose.model("Preference", preferenceSchema)