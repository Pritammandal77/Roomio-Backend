import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
    {
        postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        rent: {
            type: Number,
            required: true
        },
        location: {
            city: String,
            area: String,
            // coordinates: {
            //     lat: Number,
            //     lng: Number
            // }
        },
        preferences: {
            smoking: {
                type: Boolean
            },
            drinking: {
                type: Boolean
            },
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
                type: Boolean
            },
            preferredGender: {
                type: String,
                enum: ["male", "female", "others"]
            },
            workStyle: {
                type: String,
                enum: ["WFO", "WFH", "Hybrid"]
            },
        }
    }
    ,
    {
        timestamps: true
    }
);

export const Room = mongoose.model("Room", roomSchema)