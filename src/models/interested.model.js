import mongoose, { Schema } from "mongoose";

const interestSchema = new Schema(
    {
        interestedUser: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        propertyLister: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        property: {
            type: Schema.Types.ObjectId,
            ref: "Room",
            required: true
        },
        message: {
            type: String,
            trim: true
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected"],
            default: "pending"
        }
    },
    {
        timestamps: true
    }
);

// Prevent duplicate interest
interestSchema.index(
    { interestedUser: 1, property: 1 },
    { unique: true }
);

export const Interest = mongoose.model("Interest", interestSchema);