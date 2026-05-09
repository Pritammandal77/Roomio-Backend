import { Interest } from "../models/interested.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";


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

    const incoming = await Interest.find({ propertyLister: user })
        .sort({ createdAt: -1 })
        .populate([
            {
                path: "interestedUser",
                select: "fullName email profilePicture"
            },
            {
                path: "propertyLister",
                select: "fullName email profilePicture"
            },
            {
                path: "property",
                select: "rent description amenities location"
            }
        ])

    const outgoing = await Interest.find({ interestedUser: user })
        .sort({ createdAt: -1 })
        .populate([
            {
                path: "interestedUser",
                select: "fullName email profilePicture"
            },
            {
                path: "propertyLister",
                select: "fullName email profilePicture"
            },
            {
                path: "property",
                select: "rent description amenities location"
            }
        ])

    return res
        .status(200)
        .json(
            new ApiResponse(200, { incoming, outgoing }, "Interests fetched successfully")
        );
})



export const updateStatus = asyncHandler(async (req, res) => {
    const { updatedStatus, interestId } = req.body;

    const user = req.user?._id;

    if (!user) {
        throw new ApiError(401, "User not logged in");
    }

    if (!interestId || !updatedStatus) {
        throw new ApiError(400, "Interest ID and status are required");
    }

    // Validate status
    const allowedStatus = ["accepted", "rejected"];
    if (!allowedStatus.includes(updatedStatus)) {
        throw new ApiError(400, "Invalid status value");
    }

    // Find interest
    const interest = await Interest.findById(interestId);

    if (!interest) {
        throw new ApiError(404, "Interest not found");
    }

    // Only property owner can accept/reject
    if (interest.propertyLister.toString() !== user.toString()) {
        throw new ApiError(403, "You are not authorized to update this request");
    }

    // Prevent re-updating
    if (interest.status !== "pending") {
        throw new ApiError(400, "This request is already processed");
    }

    // Update status
    interest.status = updatedStatus;
    await interest.save();

    return res.status(200).json(
        new ApiResponse(200, interest, `Request ${updatedStatus}`)
    );
});