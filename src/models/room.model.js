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
    description: {
        type: String,
        required: true,
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
        smoking: {
            type: Boolean,
            default: false
        },
        drinking: {
            type: Boolean,
            default: false
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
            type: Boolean,
            default: false
        },
        preferredGender: {
            type: String,
            enum: ["male", "female", "others"]
        },
        workStyle: {
            type: String,
            enum: ["WFO", "WFH", "Hybrid"]
        }
    },
    amenities: {
        roomType: {
            type: String,
            enum: ["1 BHK", "2 BHK", "3 BHK", "Single room", "PG", "other"],
        },
        AC: {
            type: Boolean,
            default: false
        },
        refrigerator: {
            type: Boolean,
            default: false
        },
        parking: {
            type: Boolean,
            default: false
        },
        furnishedLevel: {
            type: String,
            enum: ["semi furnished", "full furnished", "non furnished"]
        },
        isPersonalRoomAvailable: {
            type: Boolean,
            default: false
        }
    }
}, { timestamps: true });

roomSchema.index(
    { location: "2dsphere" }
);

export const Room = mongoose.model("Room", roomSchema);