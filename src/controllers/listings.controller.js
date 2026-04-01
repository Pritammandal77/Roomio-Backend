import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from "../utils/ApiResponse.js"
import { Room } from "../models/room.model.js";

export const listRoom = asyncHandler(async (req, res) => {
    const {
        rent,
        description,
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
        roomType,
        AC,
        refrigerator,
        parking,
        furnishedLevel,
        isPersonalRoomAvailable
    } = req.body;

    const user = req.user?._id;

    if (!user) {
        throw new ApiError(400, "User not logged In");
    }

    if (
        !rent ||
        !description ||
        !coordinates ||
        !city ||
        !area ||
        !sleepSchedule ||
        cleanliness === undefined ||
        !foodPreference ||
        !preferredGender ||
        !workStyle
    ) {
        throw new ApiError(400, "All fields are required");
    }


    let coordinatesParsed;
    try {
        coordinatesParsed = JSON.parse(coordinates);
    } catch (err) {
        throw new ApiError(400, "Invalid coordinates format");
    }

    if (
        !Array.isArray(coordinatesParsed) ||
        coordinatesParsed.length !== 2
    ) {
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
        console.log("Uploading:", pic.path);

        const uploaded = await uploadOnCloudinary(pic.path);

        console.log("Cloudinary Response:", uploaded);

        if (uploaded && uploaded.public_id) {
            pictures.push({
                url: uploaded.secure_url || uploaded.url,
                public_id: uploaded.public_id
            });
        }
    }

    const listing = await Room.create({
        postedBy: user,
        rent,
        description,
        pictures,
        location: {
            type: "Point",
            coordinates: coordinatesParsed,
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
        },
        amenities: {
            roomType,
            AC: AC === "true",
            refrigerator: refrigerator === "true",
            parking: parking === "true",
            furnishedLevel,
            isPersonalRoomAvailable: isPersonalRoomAvailable === "true"
        }
    });

    return res.status(201).json(
        new ApiResponse(201, listing, "property listed successfully")
    );
});