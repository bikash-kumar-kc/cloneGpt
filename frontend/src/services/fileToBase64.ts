export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;

      // Remove: data:audio/webm;base64,
      const base64 = result.split(",")[1];

      if (!base64) {
        reject(new Error("Failed to convert file to Base64"));
        return;
      }

      resolve(base64);
    };

    reader.onerror = () => reject(reader.error);

    reader.readAsDataURL(file);
  });
};