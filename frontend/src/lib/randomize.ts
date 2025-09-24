import { Vendor } from "@/types/vendor";

// Function to get a consistent seed for the entire day
export function getTodaySeed() {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
}

// Deterministic shuffle function
export function shuffleWithSeed(array: Vendor[], seed: string) {
  // Separate vendors into different buckets
  const premiumVendorsWithPictures = array.filter(vendor => vendor.is_premium && vendor.cover_image);
  const withPictures = array.filter(vendor => !vendor.is_premium && vendor.cover_image);
  const withoutPictures = array.filter(vendor => !vendor.cover_image);

  let seedValue = hashString(seed);

  // Function to shuffle a single array with the current seed state
  const shuffleArray = (arr: Vendor[]) => {
    const arrayCopy = [...arr];
    for (let i = arrayCopy.length - 1; i > 0; i--) {
      seedValue = (seedValue * 9301 + 49297) % 233280;
      const j = Math.floor((seedValue / 233280) * (i + 1));
      [arrayCopy[i], arrayCopy[j]] = [arrayCopy[j], arrayCopy[i]];
    }
    return arrayCopy;
  };

  // Shuffle all groups
  const shuffledPremiumWithPictures = shuffleArray(premiumVendorsWithPictures);
  const shuffledWithPictures = shuffleArray(withPictures);
  const shuffledWithoutPictures = shuffleArray(withoutPictures);

  // Combine with pictures first
  return [...shuffledPremiumWithPictures, ...shuffledWithPictures, ...shuffledWithoutPictures];
}

export function shuffleArrayWithSeed(array: string[], seed: string) {
  let seedValue = hashString(seed);

  const shuffledIndices = [...Array(array.length).keys()]

  for (let i = array.length - 1; i > 0; i--) {
    seedValue = (seedValue * 9301 + 49297) % 233280;
    const j = Math.floor((seedValue / 233280) * (i + 1));
    [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
  }
  const shuffledArray = [...array]
  for (let i = 0; i < array.length; i++) {
    shuffledArray[i] = array[shuffledIndices[i]];
  }

  return {
    array: shuffledArray,
    indices: shuffledIndices
  };
}

function hashString(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}