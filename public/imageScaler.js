// imageScaler.js

/**
 * Scales an image to fit within 80% of the viewport dimensions while maintaining aspect ratio
 * @param {HTMLImageElement} imageElement - The image element to scale
 * @returns {Object} The calculated dimensions { width, height }
 */
export function scaleImageToViewport(imageElement) {
  // Get the viewport dimensions
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Calculate 80% of viewport dimensions
  const maxWidth = viewportWidth * 0.8;
  const maxHeight = viewportHeight * 0.8;

  // Get the original image dimensions
  const originalWidth = imageElement.naturalWidth || imageElement.width;
  const originalHeight = imageElement.naturalHeight || imageElement.height;

  if (originalWidth < maxWidth && originalHeight < maxHeight) {
    // Return the original dimensions if the image is already smaller than the viewport
    return {
      width: originalWidth,
      height: originalHeight,
    };
  }
  // Calculate the aspect ratio
  const aspectRatio = originalWidth / originalHeight;

  // Initialize scaled dimensions
  let scaledWidth, scaledHeight;

  // Determine which dimension is the limiting factor
  if (maxWidth / aspectRatio <= maxHeight) {
    // Width is the limiting factor
    scaledWidth = maxWidth;
    scaledHeight = maxWidth / aspectRatio;
  } else {
    // Height is the limiting factor
    scaledHeight = maxHeight;
    scaledWidth = maxHeight * aspectRatio;
  }

  // Return the calculated dimensions
  return {
    width: Math.round(scaledWidth),
    height: Math.round(scaledHeight),
  };
}

/**
 * Applies viewport scaling to an image element
 * @param {HTMLImageElement} imageElement - The image element to scale
 * @returns {Promise} A promise that resolves when scaling is applied
 */
export function applyViewportScaling(imageElement) {
  return new Promise((resolve) => {
    const applyScaling = () => {
      const dimensions = scaleImageToViewport(imageElement);

      // Apply the calculated dimensions
      imageElement.style.width = `${dimensions.width}px`;
      imageElement.style.height = `${dimensions.height}px`;
      resolve(dimensions);
    };

    // If the image is already loaded, apply scaling immediately
    if (imageElement.complete && imageElement.naturalWidth) {
      applyScaling();
    } else {
      // Wait for the image to load before applying scaling
      imageElement.onload = applyScaling;
    }
  });
}
