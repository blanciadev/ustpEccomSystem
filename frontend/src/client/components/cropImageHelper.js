// export const getCroppedImg = (imageSrc, croppedAreaPixels) => {
//   return new Promise((resolve, reject) => {
//     const image = new Image();
//     image.src = imageSrc;

//     image.onload = () => {
//       const canvas = document.createElement('canvas');
//       const ctx = canvas.getContext('2d');

//       // Set canvas size
//       canvas.width = croppedAreaPixels.width;
//       canvas.height = croppedAreaPixels.height;

//       ctx.drawImage(
//         image,
//         croppedAreaPixels.x,
//         croppedAreaPixels.y,
//         croppedAreaPixels.width,
//         croppedAreaPixels.height,
//         0,
//         0,
//         croppedAreaPixels.width,
//         croppedAreaPixels.height,
//       );

//       // Convert to Blob and resolve
//       canvas.toBlob((blob) => {
//         if (!blob) {
//           reject(new Error('Canvas is empty'));
//           return;
//         }

//         const reader = new FileReader();
//         reader.onload = () => {
//           // Convert ArrayBuffer to a new Blob
//           const arrayBuffer = reader.result;
//           const longBlob = new Blob([arrayBuffer], { type: 'image/jpeg' });
//           resolve(longBlob);
//         };

//         // Read the blob as an ArrayBuffer
//         reader.readAsArrayBuffer(blob);
//       }, 'image/jpeg');
//     };

//     image.onerror = () => {
//       reject(new Error('Failed to load image'));
//     };
//   });
// };
