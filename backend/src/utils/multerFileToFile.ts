import fs from "node:fs/promises";

export async function multerFileToFile(
  multerFile: Express.Multer.File
): Promise<File> {
  const buffer = await fs.readFile(multerFile.path);

  return new File(
    [buffer],
    multerFile.originalname,
    {
      type: multerFile.mimetype,
    }
  );
}