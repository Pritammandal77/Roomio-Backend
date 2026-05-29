import mongoose from "mongoose";
import { Schema } from "mongoose";

const aireviewSchema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        listingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Listing',
            required: true
        },
        reviewText: {
            type: String,
            required: true
        },
        compatibilityScore: {
            type: Number, // e.g., 85 for 85% match
            required: true
        },
        lastUserUpdatedAt: {
            type: Date,
            required: true
        },
        lastUserPreferenceUpdatedAt: {
            type: Date,
            required: true
        },
        lastListingUpdatedAt: {
            type: Date,
            required: true
        }
    },
    {
        timestamps: true
    }
)

export const AiReview = mongoose.model("AiReview", aireviewSchema)