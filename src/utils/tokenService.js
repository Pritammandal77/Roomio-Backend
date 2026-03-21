import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import { User } from '../models/user.model.js';
import { RefreshToken } from '../models/refreshToken.model.js';

export const createAccessToken = (user) => {
    // const payload = { sub: user._id.toString(), email: User.email };
    const payload = { sub: user._id.toString(), email: user.email };
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
};

export const verifyAccessToken = (token) => {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
};

export const createRefreshToken = async ({ userId, ip, userAgent }) => {
    const plain = randomUUID();
    const hash = await bcrypt.hash(plain, 10);

    const days = Number(process.env.REFRESH_TOKEN_EXPIRY) || 30;
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const doc = await RefreshToken.create({
        user: userId,
        tokenHash: hash,
        ip,
        userAgent,
        expiresAt
    });

    // return the plain token and DB id (optional)
    return {
        token: plain,
        id: doc._id, expiresAt
    };
};
