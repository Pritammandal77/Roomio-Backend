import { GoogleGenAI } from '@google/generative-ai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateCompatibilityReview = async (user, preference, listing) => {
  try {
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const systemInstruction = `
      You are an expert AI roommate and housing compatibility assistant for the platform Roomio. 
      Your job is to analyze a user's profile and living preferences against a room listing and provide an honest compatibility review.
      
      Respond STRICTLY in valid JSON format with the following keys:
      {
        "score": (a number between 0 and 100 representing overall compatibility),
        "summary": "A 2-3 sentence summary highlighting why this is or isn't a great match based on their profile and preferences."
      }
    `;

    const prompt = `
      --- USER PROFILE ---
      Name: ${user.fullName}
      Gender: ${user.gender}
      About: ${user.aboutUser || 'Not provided'}

      --- USER HOUSING PREFERENCES ---
      Budget: ₹${preference.budget.min} - ₹${preference.budget.max}
      Occupation: ${preference.occupation}
      Personality: ${preference.personality}
      Work Style: ${preference.workStyle}
      Lifestyle:
        - Smoking allowed: ${preference.lifestyle.smoking}
        - Drinking allowed: ${preference.lifestyle.drinking}
        - Sleep Schedule: ${preference.lifestyle.sleepSchedule}
        - Cleanliness Level (1-5): ${preference.lifestyle.cleanliness}
        - Food Preference: ${preference.lifestyle.foodPreference}
        - Has/Ok with Pets: ${preference.lifestyle.pets}

      --- ROOM LISTING DETAILS ---
      Title: ${listing.title}
      Description: ${listing.description}
      Rules/Amenities: ${JSON.stringify(listing.amenities)}
      Location: ${listing.location}
    `;

    const result = await model.generateContent({
      contents: prompt,
      generationConfig: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.2,
      }
    });

    return JSON.parse(result.response.text());

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw new Error("Failed to generate AI review");
  }
};