import { Interest } from "../models/interested.model";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler";


export const createNewInterest = asyncHandler(async (req, res) => {
    const { propertyLister, propertyId, message } = req.body;

    const interestedUser = req.user?._id;

    if (!interestedUser) {
        throw new ApiError(401, "User not logged in");
    }

    if (!propertyLister || !propertyId) {
        throw new ApiError(400, "Property and lister are required");
    }

    if (interestedUser.toString() === propertyLister) {
        throw new ApiError(400, "You cannot show interest in your own property");
    }

    try {
        const interest = await Interest.create({
            interestedUser,
            propertyLister,
            property: propertyId,
            message,
        });

        return res.status(201).json(
            new ApiResponse(201, interest, "Interest sent successfully")
        );

    } catch (error) {
        if (error.code === 11000) {
            throw new ApiError(400, "You already showed interest in this property");
        }
        throw error;
    }
});


export const getUserInterests = asyncHandler(async (req, res) => {
    const user = req.user?._id;

    if (!user) {
        throw new ApiError(401, "User not loggedIn")
    }

    const incoming = await Interest.find({ propertyLister: user }).sort({ createdAt: -1 })
    const outgoing = await Interest.find({ interestedUser: user }).sort({ createdAt: -1 })

    return res
        .status(200)
        .json(
            new ApiResponse(200, { incoming, outgoing }, "Interests fetched successfully")
        );
})
