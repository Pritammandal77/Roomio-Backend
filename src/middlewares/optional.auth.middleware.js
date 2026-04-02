import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";


// I have created this, bcoz the getAllListings need user loggedin to use the room matching algorithm,
// without user the verifyJWT blooks the API to sends response & throw error, that's why I created this 
// Now if user is not logged in ,the getAllListings will still work & send the listings data to frontend 
// without calculating the matching Preference
export const optionalVerifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token =
            req.cookies?.access_token ||
            req.header("Authorization")?.replace("Bearer ", "");

        // if token not found → skip, no error
        if (!token) {
            req.user = null;
            return next();
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?.sub).select("-password");

        // if user not found → still continue
        req.user = user || null;

        next();
    } catch (error) {
        // invalid token -> crash
        req.user = null;
        next();
    }
});