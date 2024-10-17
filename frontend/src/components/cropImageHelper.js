export const getCroppedImg = (imageSrc, croppedAreaPixels) => {
  return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = imageSrc;

      image.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Set canvas size based on cropped area
          canvas.width = croppedAreaPixels.width;
          canvas.height = croppedAreaPixels.height;

          // Draw the cropped image on the canvas
          ctx.drawImage(
              image,
              croppedAreaPixels.x,
              croppedAreaPixels.y,
              croppedAreaPixels.width,
              croppedAreaPixels.height,
              0,
              0,
              croppedAreaPixels.width,
              croppedAreaPixels.height
          );

          // Convert the canvas to a Blob (JPEG format)
          canvas.toBlob((blob) => {
              if (!blob) {
                  reject(new Error('Canvas is empty'));
                  return;
              }
              resolve(blob); // Return the blob
          }, 'image/jpeg');
      };

      image.onerror = () => {
          reject(new Error('Failed to load image'));
      };
  });
};
