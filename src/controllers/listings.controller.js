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

        const uploaded = await uploadOnCloudinary(pic.path);


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

        // ❗ अगर preference nahi hai
        if (!preference) {
            return res.status(200).json(
                new ApiResponse(
                    200,
                    rooms,
                    "Listings fetched (no preferences found)"
                )
            );
        }

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
    return res
        .status(200)
        .json(
            new ApiResponse(200, finalRoomsData, "Listings fetched succesfully")
        )
})


export const getCurrUserListings = asyncHandler(async (req, res) => {
    const user = req.user?._id;

    if (!user) {
        throw new ApiError(401, "user not loggedIn")
    }

    const listings = await Room.find({ postedBy: user })

    return res
        .status(200)
        .json(
            new ApiResponse(200, listings, "Listings fetched successfully")
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


export const getCitiesOfListings = asyncHandler(async (req, res) => {
    const cities = await Room.distinct("location.city");

    return res.status(200).json(
        new ApiResponse(200, cities, "Unique cities fetched")
    );
});


// filter API that also gives the distance between our current location & the property location
export const filterRooms = asyncHandler(async (req, res) => {
    const {
        minRent,
        maxRent,
        city,
        area,

        // preferences
        smoking,
        drinking,
        sleepSchedule,
        cleanliness,
        foodPreference,
        pets,
        preferredGender,
        occupation,
        workStyle,

        // amenities
        roomType,
        AC,
        refrigerator,
        parking,
        furnishedLevel,
        isPersonalRoomAvailable,

        // geo
        lat,
        lng,
        radius
    } = req.body;

    let pipeline = [];

    // GEO + DISTANCE (MUST BE FIRST)
    if (
        lat !== undefined &&
        lng !== undefined &&
        radius !== undefined
    ) {
        pipeline.push({
            $geoNear: {
                near: {
                    type: "Point",
                    coordinates: [parseFloat(lng), parseFloat(lat)],
                },
                distanceField: "distance", // 👈 meters me distance
                maxDistance: Number(radius) * 1000,
                spherical: true
            }
        });
    }

    // FILTERS
    let matchQuery = {};

    // Rent
    if (minRent || maxRent) {
        matchQuery.rent = {};
        if (minRent) matchQuery.rent.$gte = Number(minRent);
        if (maxRent) matchQuery.rent.$lte = Number(maxRent);
    }

    // Location
    if (city) matchQuery["location.city"] = city;
    if (area) matchQuery["location.area"] = area;

    // Preferences
    if (smoking !== undefined) matchQuery["preferences.smoking"] = smoking;
    if (drinking !== undefined) matchQuery["preferences.drinking"] = drinking;
    if (sleepSchedule) matchQuery["preferences.sleepSchedule"] = sleepSchedule;
    if (cleanliness) matchQuery["preferences.cleanliness"] = Number(cleanliness);
    if (foodPreference) matchQuery["preferences.foodPreference"] = foodPreference;
    if (pets !== undefined) matchQuery["preferences.pets"] = pets;
    if (preferredGender) matchQuery["preferences.preferredGender"] = preferredGender;
    if (occupation) matchQuery["preferences.occupation"] = occupation;
    if (workStyle) matchQuery["preferences.workStyle"] = workStyle;

    // Amenities
    if (roomType && Array.isArray(roomType) && roomType.length > 0) {
        matchQuery["amenities.roomType"] = { $in: roomType };
    }

    if (AC !== undefined) matchQuery["amenities.AC"] = AC;
    if (refrigerator !== undefined) matchQuery["amenities.refrigerator"] = refrigerator;
    if (parking !== undefined) matchQuery["amenities.parking"] = parking;

    if (furnishedLevel) {
        matchQuery["amenities.furnishedLevel"] = furnishedLevel;
    }

    if (isPersonalRoomAvailable !== undefined) {
        matchQuery["amenities.isPersonalRoomAvailable"] = isPersonalRoomAvailable;
    }

    pipeline.push({ $match: matchQuery });

    // populate equivalent
    pipeline.push({
        $lookup: {
            from: "users",
            localField: "postedBy",
            foreignField: "_id",
            as: "postedBy"
        }
    });

    pipeline.push({ $unwind: "$postedBy" });

    // Convert distance to KM
    pipeline.push({
        $addFields: {
            distanceInKm: {
                $round: [{ $divide: ["$distance", 1000] }, 2]
            }
        }
    });

    // select fields
    pipeline.push({
        $project: {
            rent: 1,
            description: 1,
            location: 1,
            distance: 1,
            distanceInKm: 1,
            pictures: 1,
            amenities: 1,
            "postedBy.fullName": 1,
            "postedBy.email": 1,
            "postedBy.profilePicture": 1
        }
    });

    const rooms = await Room.aggregate(pipeline);

    return res.status(200).json(
        new ApiResponse(200, rooms, "Filtered rooms with distance fetched successfully")
    );
});










// works perfectly , but without the filter location option 
// export const filterRooms = asyncHandler(async (req, res) => {
//     const {
//         minRent,
//         maxRent,
//         city,
//         area,

//         // preferences
//         smoking,
//         drinking,
//         sleepSchedule,
//         cleanliness,
//         foodPreference,
//         pets,
//         preferredGender,
//         occupation,
//         workStyle,

//         // amenities
//         roomType,
//         AC,
//         refrigerator,
//         parking,
//         furnishedLevel,
//         isPersonalRoomAvailable,

//         // geo
//         lat,
//         lng,
//         radius
//     } = req.body;

//     let query = {};

//     // Rent
//     if (minRent || maxRent) {
//         query.rent = {};
//         if (minRent) query.rent.$gte = Number(minRent);
//         if (maxRent) query.rent.$lte = Number(maxRent);
//     }

//     // Location
//     if (city) query["location.city"] = city;
//     if (area) query["location.area"] = area;

//     // Preferences
//     if (smoking !== undefined) query["preferences.smoking"] = smoking;
//     if (drinking !== undefined) query["preferences.drinking"] = drinking;
//     if (sleepSchedule) query["preferences.sleepSchedule"] = sleepSchedule;
//     if (cleanliness) query["preferences.cleanliness"] = Number(cleanliness);
//     if (foodPreference) query["preferences.foodPreference"] = foodPreference;
//     if (pets !== undefined) query["preferences.pets"] = pets;
//     if (preferredGender) query["preferences.preferredGender"] = preferredGender;
//     if (occupation) query["preferences.occupation"] = occupation;
//     if (workStyle) query["preferences.workStyle"] = workStyle;

//     // Amenities
//     if (roomType && Array.isArray(roomType) && roomType.length > 0) {
//         query["amenities.roomType"] = { $in: roomType };
//     }

//     if (AC !== undefined) query["amenities.AC"] = AC;
//     if (refrigerator !== undefined) query["amenities.refrigerator"] = refrigerator;
//     if (parking !== undefined) query["amenities.parking"] = parking;

//     if (furnishedLevel) {
//         query["amenities.furnishedLevel"] = furnishedLevel;
//     }

//     if (isPersonalRoomAvailable !== undefined) {
//         query["amenities.isPersonalRoomAvailable"] = isPersonalRoomAvailable;
//     }

//     if (lat && lng && radius) {
//         query.location = {
//             $near: {
//                 $geometry: {
//                     type: "Point",
//                     coordinates: [parseFloat(lng), parseFloat(lat)],
//                 },
//                 $maxDistance: radius * 1000
//             }
//         };
//     }

//     const rooms = await Room.find(query)
//         .sort({ createdAt: -1 })
//         .populate({
//             path: "postedBy",
//             select: "fullName email profilePicture"
//         });

//     return res.status(200).json(
//         new ApiResponse(200, rooms, "Filtered rooms fetched successfully")
//     );
// });

