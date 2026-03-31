import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from "../utils/ApiResponse.js"
import { Room } from "../models/room.model.js";

export const listRoom = asyncHandler(async (req, res) => {
    const {
        rent,
        coordinates,
        city,
        area,
        smoking,
        drinking,
        sleepSchedule,
        cleanliness,
        foodPreference,
        pets,
        preferredGender,
        workStyle,
    } = req.body;

    const user = req.user?._id;

    if (!user) {
        throw new ApiError(400, "User not logged In");
    }

    if (
        !rent ||
        !coordinates ||
        !city ||
        !area ||
        smoking === undefined ||
        drinking === undefined ||
        !sleepSchedule ||
        cleanliness === undefined ||
        !foodPreference ||
        pets === undefined ||
        !preferredGender ||
        !workStyle
    ) {
        throw new ApiError(400, "All fields are required");
    }

    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
        throw new ApiError(400, "Invalid coordinates format");
    }

    const picturesLocalPaths = req.files || [];

    if (!picturesLocalPaths.length) {
        throw new ApiError(400, "At least 1 picture is required");
    }

    if (picturesLocalPaths.length > 4) {
        throw new ApiError(400, "Max 4 images allowed");
    }

    let pictures = [];

    for (let pic of picturesLocalPaths) {
        const uploaded = await uploadOnCloudinary(pic.path);

        if (uploaded?.secure_url && uploaded?.public_id) {
            pictures.push({
                url: uploaded.secure_url,
                public_id: uploaded.public_id
            });
        }
    }

    const listing = await Room.create({
        postedBy: user,
        rent,
        pictures,
        location: {
            type: "Point",
            coordinates,
            city,
            area
        },
        preferences: {
            smoking,
            drinking,
            sleepSchedule,
            cleanliness,
            foodPreference,
            pets,
            preferredGender,
            workStyle
        }
    });

    return res.status(201).json(
        new ApiResponse(201, listing, "property listed successfully")
    );
});