import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        tokenHash: {
            type: String,
            required: true
        },
        userAgent: String,
        ip: String,
        expiresAt: {
            type: Date,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }
);

refreshTokenSchema.index(
    {
        expiresAt: 1
    },
    {
        expireAfterSeconds: 0
    }
);

export const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema)
