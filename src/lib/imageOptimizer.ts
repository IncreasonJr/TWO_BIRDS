/**
 * Client-side image optimizer for Two Birds
 * - Validates file types (JPEG, PNG, WebP)
 * - Enforces max 5MB input file size
 * - Scales down to max 1080x1080px maintaining aspect ratio
 * - Compresses to JPEG with 80% quality
 * - No external libraries required (pure browser Canvas API)
 */

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const MAX_IMAGE_DIMENSION = 1080; // 1080px width/height max
export const JPEG_QUALITY = 0.8; // 80% compression

export async function optimizeImage(file: File): Promise<Blob> {
  // 1. Validation
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Unsupported image format. Please upload a JPEG, PNG, or WebP image.');
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('Image exceeds 5MB limit. Please choose a smaller photo.');
  }

  // 2. Load into HTMLImageElement
  const imageBitmap = await createImageElement(file);

  // 3. Calculate target dimensions preserving aspect ratio
  let { width, height } = imageBitmap;

  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    if (width > height) {
      height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
      width = MAX_IMAGE_DIMENSION;
    } else {
      width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
      height = MAX_IMAGE_DIMENSION;
    }
  }

  // 4. Render on Canvas & compress to JPEG at 0.8 quality
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context is not supported in this browser.');
  }

  // Fill background with dark tone in case of PNG transparency before JPEG conversion
  ctx.fillStyle = '#1A1A1A';
  ctx.fillRect(0, 0, width, height);

  ctx.drawImage(imageBitmap, 0, 0, width, height);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to compress and optimize image.'));
        }
      },
      'image/jpeg',
      JPEG_QUALITY
    );
  });
}

function createImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image for processing.'));
    };

    img.src = objectUrl;
  });
}
