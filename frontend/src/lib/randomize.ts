import { Vendor } from "@/types/vendor";

// Function to get a consistent seed for the entire day
export function getTodaySeed() {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
}

// Function to shuffle a single array with the current seed state
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function shuffleArray(array: any[], seed: string) {
  let seedValue = hashString(seed);
  const arrayCopy = [...array];
  for (let i = arrayCopy.length - 1; i > 0; i--) {
    seedValue = (seedValue * 9301 + 49297) % 233280;
    const j = Math.floor((seedValue / 233280) * (i + 1));
    [arrayCopy[i], arrayCopy[j]] = [arrayCopy[j], arrayCopy[i]];
  }
  return arrayCopy;
}

// Deterministic shuffle function
export function shuffleVendorsWithSeed(array: Vendor[], seed: string) {
  // Separate vendors into different buckets
  const premiumVendorsWithPictures = array.filter(vendor => vendor.is_premium && vendor.cover_image);
  const withPictures = array.filter(vendor => !vendor.is_premium && vendor.cover_image);
  const withoutPictures = array.filter(vendor => !vendor.cover_image);

  // Shuffle all groups
  const shuffledPremiumWithPictures = shuffleArray(premiumVendorsWithPictures, seed);
  const shuffledWithPictures = shuffleArray(withPictures, seed);
  const shuffledWithoutPictures = shuffleArray(withoutPictures, seed);

  // Combine with pictures first
  return [...shuffledPremiumWithPictures, ...shuffledWithPictures, ...shuffledWithoutPictures];
}

export function shuffleMediaWithSeed(array: string[], seed: string) {
  if (!array || array.length === 0 || !seed) {
    return {
      array: [],
      indices: []
    };
  }

  const shuffledIndices = shuffleArray([...Array(array.length).keys()], seed);

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