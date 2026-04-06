import { Interest } from "../models/interested.model";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js"


export const createNewInterest = asyncHandler(async (req, res) => {
    const { propertyLister, propertyId, message } = req.body;

    if (!propertyLister || !propertyId) {
        throw new ApiError(400, "Property and lister are required");
    }

    const interestedUser = req.user?._id;

    if (!interestedUser) {
        throw new ApiError(401, "User not logged In")
    }

    try {
        const interest = await Interest.create({
            interestedUser,
            propertyLister,
            property: propertyId,
            message,
        });

        return res.status(201).json(
            new ApiResponse(201, interest, "Interest sent")
        );

    } catch (error) {
        if (error.code === 11000) {
            throw new ApiError(400, "You already showed interest in this property");
        }
        throw error;
    }
})