import { Preference } from "../models/preference.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/AsyncHandler";

export const addPreference = asyncHandler(async (req, res) => {
    const {
        minBudget,
        maxBudget,
        occupation,
        personality,
        smoking,
        drinking,
        sleepSchedule,
        cleanliness,
        foodPreference,
        pets,
        gender,
        workStyle
    } = req.body

    const user = req.user?._id

    if (minBudget > maxBudget) {
        throw new ApiError(400, "Min budget cannot be greater than max budget")
    }

    const existingPreference = await Preference.findOne({ user })
    if (existingPreference) {
        throw new ApiError(400, "Preference already exists")
    }

    const preference = await Preference.create({
        user,
        budget: {
            min: minBudget,
            max: maxBudget
        },
        occupation,
        personality,
        lifestyle: {
            smoking,
            drinking,
            sleepSchedule,
            cleanliness,
            foodPreference,
            pets,
        },
        gender,
        workStyle
    })

    return res
        .status(201)
        .json(
            new ApiResponse(201, preference, "Preference added successfully")
        )
})

export const getPreference = asyncHandler(async (req, res) => {
    const user = req.user?._id

    if (!user) {
        throw new ApiError(401, "user not loggedIn")
    }

    const preference = await Preference.findOne({ user })

    if (!preference) {
        throw new ApiError(404, "no preference found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, preference, "preference fetched successfully")
        )
})