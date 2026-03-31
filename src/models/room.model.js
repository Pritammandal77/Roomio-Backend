import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    rent: {
        type: Number,
        required: true
    },
    pictures: [
        {
            url: {
                type: String,
                required: true
            },
            public_id: {
                type: String,
                required: true
            }
        }
    ],
    location: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point"
        },
        coordinates: {
            type: [Number], // [lng, lat]
            required: true
        },
        city: String,
        area: String
    },
    preferences: {
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
        pets: Boolean,
        preferredGender: {
            type: String,
            enum: ["male", "female", "others"]
        },
        workStyle: {
            type: String,
            enum: ["WFO", "WFH", "Hybrid"]
        }
    }
}, { timestamps: true });

// VERY IMPORTANT
roomSchema.index(
    { location: "2dsphere" }
);

export const Room = mongoose.model("Room", roomSchema);