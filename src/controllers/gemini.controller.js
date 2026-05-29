import { AiReview } from '../models/AiReview.js';
import { User } from '../models/User.js';
import { Listing } from '../models/Listing.js';
import { Preference } from '../models/preference.model.js';
import { generateCompatibilityReview } from '../services/geminiService.js';

export const getOrUpdateAiReview = async (req, res) => {
  try {
    const { listingId } = req.params;
    const userId = req.user.id; 

    // 1. Fetch latest data across all tracks
    const user = await User.findById(userId);
    const listing = await Listing.findById(listingId);
    const preference = await Preference.findOne({ user: userId }); // Matches your schema's 'user' field
    
    if (!user || !listing) {
      return res.status(404).json({ message: "User or Listing not found" });
    }

    // 2. Look for an existing cached review
    let cachedReview = await AiReview.findOne({ userId, listingId });

    // 3. Define the validation flags based on your 3 separate change-vectors
    const hasUserUpdated = cachedReview && 
      new Date(user.updatedAt).getTime() > new Date(cachedReview.lastUserUpdatedAt).getTime();
      
    const hasListingUpdated = cachedReview && 
      new Date(listing.updatedAt).getTime() > new Date(cachedReview.lastListingUpdatedAt).getTime();

    const preferenceUpdatedAt = preference ? new Date(preference.updatedAt).getTime() : 0;
    const hasUserPreferenceUpdated = cachedReview && 
      preferenceUpdatedAt > new Date(cachedReview.lastUserPreferenceUpdatedAt).getTime();

    // 4. Run the conditional checkpoint
    if (!cachedReview || hasUserUpdated || hasListingUpdated || hasUserPreferenceUpdated) {
      console.log(!cachedReview ? "No cached review. Generating fresh..." : "Data changed. Regenerating...");

      // Default fallback preferences if the user hasn't filled out their preference profile yet
      const fallbackPreference = preference || {
        budget: { min: 0, max: 999999 },
        occupation: "Not specified",
        personality: "ambivert",
        workStyle: "Hybrid",
        lifestyle: { smoking: false, drinking: false, sleepSchedule: "late", cleanliness: 3, foodPreference: "veg", pets: false }
      };

      // Call Gemini Service with all 3 pieces of data
      const aiResponse = await generateCompatibilityReview(user, fallbackPreference, listing);

      // Upsert into your AiReview model layout
      cachedReview = await AiReview.findOneAndUpdate(
        { userId, listingId },
        {
          reviewText: aiResponse.summary,
          compatibilityScore: aiResponse.score,
          lastUserUpdatedAt: user.updatedAt,
          lastListingUpdatedAt: listing.updatedAt,
          lastUserPreferenceUpdatedAt: preference ? preference.updatedAt : new Date()
        },
        { new: true, upsert: true }
      );
    } else {
      console.log("Serving review directly from MongoDB Cache");
    }

    // 5. Respond back to Roomio frontend
    return res.status(200).json({
      score: cachedReview.compatibilityScore,
      review: cachedReview.reviewText,
      cached: !hasUserUpdated && !hasListingUpdated && !hasUserPreferenceUpdated && !!cachedReview
    });

  } catch (error) {
    console.error("Review Controller Error:", error);
    return res.status(500).json({ message: "Server error tracking AI review" });
  }
};