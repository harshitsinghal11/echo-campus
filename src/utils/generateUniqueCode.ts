// utils/generateUniqueCode.ts
export function generateUniqueCode(length: number = 6): string {
  if (length < 3) {
    throw new Error("Length must be at least 3 to fit @ _ # pattern.");
  }

  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let middle = "";

  // middle part is length - 3 because @ _ #
  const middleLength = length - 3;

  for (let i = 0; i < middleLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    middle += characters[randomIndex];
  }

  return `@${middle}_#`;
}
