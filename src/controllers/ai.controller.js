import { Preference } from '../models/preference.model.js';
import { AiReview } from '../models/aireview.model.js';
import { User } from '../models/user.model.js';
import { Room } from '../models/room.model.js';
import { generateCompatibilityReview } from '../services/gemini.service.js';

export const getOrUpdateAiReview = async (req, res) => {
  try {
    const { listingId } = req.params;
    const userId = req.user.id; 

    // 1. Fetch latest data across all tracks
    const user = await User.findById(userId);
    const listing = await Room.findById(listingId);
    const preference = await Preference.findOne({ user: userId }); 
    
    if (!user || !listing) {
      return res.status(404).json({ message: "User or Listing not found" });
    }

    // NEW GUARDRAIL: If user hasn't set up their preferences yet, return early
    if (!preference) {
      return res.status(200).json({
        hasPreferences: false,
        message: "Add preferences to get an AI compatibility review."
      });
    }

    // 2. Look for an existing cached review
    let cachedReview = await AiReview.findOne({ userId, listingId });

    // 3. Define the validation flags based on your 3 separate change-vectors
    const hasUserUpdated = cachedReview && 
      new Date(user.updatedAt).getTime() > new Date(cachedReview.lastUserUpdatedAt).getTime();
      
    const hasListingUpdated = cachedReview && 
      new Date(listing.updatedAt).getTime() > new Date(cachedReview.lastListingUpdatedAt).getTime();

    // No need to fall back to 0 here anymore because we are guaranteed to have a preference object
    const hasUserPreferenceUpdated = cachedReview && 
      new Date(preference.updatedAt).getTime() > new Date(cachedReview.lastUserPreferenceUpdatedAt).getTime();

    // 4. Run the conditional checkpoint
    if (!cachedReview || hasUserUpdated || hasListingUpdated || hasUserPreferenceUpdated) {
      console.log(!cachedReview ? "👉 No cached review. Generating fresh..." : "🔄 Data changed. Regenerating...");

      // Call Gemini Service with all 3 pieces of actual user data
      const aiResponse = await generateCompatibilityReview(user, preference, listing);

      // Upsert into your AiReview model layout
      cachedReview = await AiReview.findOneAndUpdate(
        { userId, listingId },
        {
          reviewText: aiResponse.summary,
          compatibilityScore: aiResponse.score,
          lastUserUpdatedAt: user.updatedAt,
          lastListingUpdatedAt: listing.updatedAt,
          lastUserPreferenceUpdatedAt: preference.updatedAt
        },
        { new: true, upsert: true }
      );
    } else {
      console.log("Serving review directly from MongoDB Cache");
    }

    // 5. Respond back to Roomio frontend (Including the flag for cleaner client parsing)
    return res.status(200).json({
      hasPreferences: true,
      score: cachedReview.compatibilityScore,
      review: cachedReview.reviewText,
      cached: !hasUserUpdated && !hasListingUpdated && !hasUserPreferenceUpdated && !!cachedReview
    });

  } catch (error) {
    console.error("Review Controller Error:", error);
    return res.status(500).json({ message: "Server error tracking AI review" });
  }
};