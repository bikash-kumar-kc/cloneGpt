import fs from "node:fs/promises";
export async function audioToBase64(filePath: string): Promise<string> {
  const buffer = await fs.readFile(filePath);
  const base64Audio = `data:audio/mp3;base64,${buffer.toString("base64")}`;
  return base64Audio;
}
