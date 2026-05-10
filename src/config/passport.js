import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user.model.js";

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            // callbackURL: "/api/user/auth/google/callback", // Matches your route structure
            callbackURL: process.env.NODE_ENV === "production"
                ? `${process.env.BACKEND_URL}/api/user/auth/google/callback`
                : "http://localhost:8000/api/user/auth/google/callback",
            passReqToCallback: true,
        },
        async (req, accessToken, refreshToken, profile, done) => {
            try {
                // 1. Check if user already exists in your DB
                let user = await User.findOne({ email: profile.emails[0].value });

                if (!user) {
                    // 2. Create new user if they don't exist
                    user = await User.create({
                        fullName: profile.displayName,
                        email: profile.emails[0].value,
                        googleId: profile.id,
                        authProvider: "google",
                        profilePicture: profile.photos[0]?.value,
                        isVerified: true, // Google accounts are pre-verified
                    });
                } else if (user.authProvider !== "google") {
                    // Optional: Link Google ID if they previously signed up with email
                    user.googleId = profile.id;
                    user.authProvider = "google";
                    await user.save();
                }

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

export default passport;