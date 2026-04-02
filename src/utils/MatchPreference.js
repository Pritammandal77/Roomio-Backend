export const calculateMatch = (user, preference, room) => {
    let score = 0;
    let totalWeight = 0;

    const weights = {
        rent: 20,
        occupation: 10,
        gender: 15,
        smoking: 10,
        drinking: 10,
        pets: 10,
        foodPreference: 10,
        cleanliness: 10,
        sleepSchedule: 5
    };

    // ✅ Gender
    if (room.preferences?.preferredGender && user.gender) {
        totalWeight += weights.gender;

        if (room.preferences.preferredGender === user.gender) {
            score += weights.gender;
        }
    }

    // ✅ Occupation
    if (preference?.occupation && room.preferences?.occupation) {
        totalWeight += weights.occupation;

        if (preference.occupation === room.preferences.occupation) {
            score += weights.occupation;
        }
    }

    // ✅ Lifestyle fields
    const lifestyleFields = [
        "smoking",
        "drinking",
        "pets",
        "foodPreference",
        "sleepSchedule"
    ];

    lifestyleFields.forEach((field) => {
        if (
            preference?.lifestyle?.[field] !== undefined &&
            room.preferences?.[field] !== undefined
        ) {
            totalWeight += weights[field];

            if (
                preference.lifestyle[field] === room.preferences[field]
            ) {
                score += weights[field];
            }
        }
    });

    // ✅ Cleanliness (range based)
    if (
        preference?.lifestyle?.cleanliness !== undefined &&
        room.preferences?.cleanliness !== undefined
    ) {
        totalWeight += weights.cleanliness;

        const diff = Math.abs(
            preference.lifestyle.cleanliness -
            room.preferences.cleanliness
        );

        if (diff === 0) score += weights.cleanliness;
        else if (diff === 1) score += weights.cleanliness * 0.7;
        else if (diff === 2) score += weights.cleanliness * 0.4;
    }

    // ✅ Rent (range based)
    if (preference?.budget && room.rent) {
        totalWeight += weights.rent;

        const { min, max } = preference.budget;

        if (room.rent >= min && room.rent <= max) {
            score += weights.rent;
        } else if (room.rent >= min - 2000 && room.rent <= max + 2000) {
            score += weights.rent * 0.6;
        }
    }

    if (totalWeight === 0) return 0;

    return Math.round((score / totalWeight) * 100);
};