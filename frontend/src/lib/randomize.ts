import { Vendor } from "@/types/vendor";

// Function to get a consistent seed for the entire day
export function getTodaySeed() {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
}

// Deterministic shuffle function
export function shuffleWithSeed(array: Vendor[], seed: string) {
  const arrayCopy = [...array];
  let seedValue = hashString(seed);
  
  for (let i = arrayCopy.length - 1; i > 0; i--) {
    seedValue = (seedValue * 9301 + 49297) % 233280;
    const j = Math.floor((seedValue / 233280) * (i + 1));
    [arrayCopy[i], arrayCopy[j]] = [arrayCopy[j], arrayCopy[i]];
  }
  
  return arrayCopy;
}

function hashString(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}