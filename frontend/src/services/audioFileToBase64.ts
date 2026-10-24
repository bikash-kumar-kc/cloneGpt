export const audioFileToBase64 = async (
  audioPath: string,
): Promise<string> => {
  const response = await fetch(audioPath);

  if (!response.ok) {
    throw new Error(`Failed to fetch audio: ${response.status}`);
  }

  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      const result = reader.result as string;

      // Remove: data:audio/wav;base64,
      const base64 = result.split(",")[1];

      if (!base64) {
        reject(new Error("Failed to extract Base64 from audio"));
        return;
      }

      resolve(base64);
    };

    reader.onerror = () => {
      reject(reader.error);
    };

    reader.readAsDataURL(blob);
  });
};