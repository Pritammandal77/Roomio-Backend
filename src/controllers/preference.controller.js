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

    // lean() returns a plain JS object instead of a Mongoose document, improving read performance
    const preference = await Preference.findOne({ user }).lean();

    if (!preference) {
        throw new ApiError(404, "no preference found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, preference, "preference fetched successfully")
        )
})


export const updatePreference = asyncHandler(async (req, res) => {
    const user = req.user?._id

    if (!user) {
        throw new ApiError(401, "User not authenticated")
    }

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

    // Build dynamic update object (only update provided fields)
    const updateFields = {}

    // Budget
    if (minBudget !== undefined || maxBudget !== undefined) {
        updateFields.budget = {}
        if (minBudget !== undefined) updateFields.budget.min = minBudget
        if (maxBudget !== undefined) updateFields.budget.max = maxBudget
    }

    // Basic fields
    if (occupation !== undefined) updateFields.occupation = occupation
    if (personality !== undefined) updateFields.personality = personality
    if (gender !== undefined) updateFields.gender = gender
    if (workStyle !== undefined) updateFields.workStyle = workStyle

    // Lifestyle
    const lifestyle = {}
    if (smoking !== undefined) lifestyle.smoking = smoking
    if (drinking !== undefined) lifestyle.drinking = drinking
    if (sleepSchedule !== undefined) lifestyle.sleepSchedule = sleepSchedule
    if (cleanliness !== undefined) lifestyle.cleanliness = cleanliness
    if (foodPreference !== undefined) lifestyle.foodPreference = foodPreference
    if (pets !== undefined) lifestyle.pets = pets

    if (Object.keys(lifestyle).length > 0) {
        updateFields.lifestyle = lifestyle
    }

    if (minBudget !== undefined && maxBudget !== undefined && minBudget > maxBudget) {
        throw new ApiError(400, "Min budget cannot be greater than max budget")
    }

    const updatedPreference = await Preference.findOneAndUpdate(
        {
            user
        },
        {
            $set: updateFields
        },
        {
            new: true,
            runValidators: true
        }
    ).lean()

    if (!updatedPreference) {
        throw new ApiError(404, "Preference not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedPreference, "Preference updated successfully")
        )
})