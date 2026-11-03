export const CLOUD_PRESET = 'sample'
export const CLOUD_NAME = 'dxao3dleg'

/**
 * Upload an image (File, Blob, or Data URI) to Cloudinary.
 * If the input is already an external HTTP(S) URL, it is returned unchanged.
 *
 * @param {File | Blob | string} fileOrDataUri
 * @returns {Promise<string>} The secure HTTPS URL of the uploaded image
 */
export async function uploadToCloudinary(fileOrDataUri) {
  if (!fileOrDataUri) return null

  // If it's already a hosted URL (Cloudinary or preset icon), skip re-uploading
  if (
    typeof fileOrDataUri === 'string' &&
    (fileOrDataUri.startsWith('http://') || fileOrDataUri.startsWith('https://'))
  ) {
    return fileOrDataUri
  }

  const formData = new FormData()
  formData.append('file', fileOrDataUri)
  formData.append('upload_preset', CLOUD_PRESET)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    let message = 'Upload failed'
    try {
      const errJson = await response.json()
      message = errJson.error?.message || message
    } catch {
      message = response.statusText || message
    }
    throw new Error(`Cloudinary error: ${message}`)
  }

  const data = await response.json()
  return data.secure_url
}
