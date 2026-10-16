/**
 * Utility for converting and optimizing uploaded image files into high-resolution Data URLs.
 * Keeps image quality sharp for 3x zoom while resizing to max 1600px to ensure localStorage
 * storage quota is never exceeded.
 */
export const fileToOptimizedDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Format de fichier non pris en charge. Veuillez fournir une image.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
    reader.onload = () => {
      const originalDataUrl = reader.result as string;

      const img = new Image();
      img.onerror = () => resolve(originalDataUrl); // fallback to raw data url if decoding fails
      img.onload = () => {
        const maxDimension = 1600;
        let { width, height } = img;

        // If image is already smaller than 1600px, avoid unnecessary resizing
        if (width <= maxDimension && height <= maxDimension && file.size < 600 * 1024) {
          resolve(originalDataUrl);
          return;
        }

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(originalDataUrl);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Export as JPEG at 0.88 quality (balances texture sharpness and compact storage)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
        resolve(compressedDataUrl);
      };
      img.src = originalDataUrl;
    };
    reader.readAsDataURL(file);
  });
};
