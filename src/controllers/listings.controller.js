import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from "../utils/ApiResponse.js"
import { Room } from "../models/room.model.js";
import { User } from "../models/user.model.js";
import { calculateMatch } from "../utils/MatchPreference.js";
import { Preference } from "../models/preference.model.js";

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
        occupation,
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
        !workStyle ||
        !occupation
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
            occupation,
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


export const getAllListings = asyncHandler(async (req, res) => {
    const userId = req.user?._id

    const rooms = await Room.find({})
        .sort({ createdAt: -1 })
        .populate({
            path: "postedBy",
            select: "email profilePicture fullName dob gender"
        })

    let finalRoomsData = rooms;

    if (userId) {
        const user = await User.findById(userId);
        const preference = await Preference.findOne({ user: userId });

        // Calculate match %
        const matchedRooms = rooms.map((room) => {
            const matchPercentage = calculateMatch(user, preference, room);

            return {
                ...room.toObject(),
                matchPercentage
            };
        });

        matchedRooms.sort((a, b) => b.matchPercentage - a.matchPercentage);

        finalRoomsData = matchedRooms;
    }
    console.log("room data", finalRoomsData)
    return res
        .status(200)
        .json(
            new ApiResponse(200, finalRoomsData, "Listings fetched succesfully")
        )
})

export const getListingsByID = asyncHandler(async (req, res) => {
    const roomId = req.params.id

    if (!roomId) {
        throw new ApiError(404, "Room not found")
    }

    const listing = await Room.findById({ _id: roomId })
        .populate({
            path: "postedBy",
            select: "email profilePicture fullName dob gender"
        })

    return res
        .status(200)
        .json(
            new ApiResponse(200, listing, "Property details fetched successfuly")
        )
})