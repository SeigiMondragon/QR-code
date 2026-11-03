import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import { uploadToCloudinary } from './cloudinary'

const COLLECTION_NAME = 'qr_codes'

/**
 * Persist a new QR Code design into Firestore.
 * Uploads custom logo and preview image to Cloudinary if necessary.
 *
 * @param {Object} params
 * @param {string} params.title
 * @param {Object} params.values
 * @param {string} [params.previewDataUrl]
 * @returns {Promise<Object>} saved document representation
 */
export async function saveQRCode({ title, values, previewDataUrl }) {
  // 1. Upload custom logo if base64 or file
  let logoUrl = values.logoValue || ''
  if (logoUrl && !logoUrl.startsWith('http://') && !logoUrl.startsWith('https://')) {
    logoUrl = await uploadToCloudinary(logoUrl)
  }

  // 2. Upload preview thumbnail to Cloudinary
  let previewUrl = ''
  if (previewDataUrl) {
    try {
      previewUrl = await uploadToCloudinary(previewDataUrl)
    } catch (err) {
      console.warn('Could not upload QR preview snapshot:', err)
    }
  }

  // 3. Assemble document payload
  const cleanValues = {
    ...values,
    logoValue: logoUrl,
  }

  const docPayload = {
    title: (title || '').trim() || 'Untitled QR Code',
    values: cleanValues,
    previewUrl,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  const docRef = await addDoc(collection(db, COLLECTION_NAME), docPayload)
  return { id: docRef.id, ...docPayload }
}

/**
 * Update an existing QR Code document in Firestore.
 *
 * @param {string} id
 * @param {Object} params
 * @param {string} params.title
 * @param {Object} params.values
 * @param {string} [params.previewDataUrl]
 */
export async function updateQRCode(id, { title, values, previewDataUrl }) {
  if (!id) throw new Error('Document ID is required for update')

  let logoUrl = values.logoValue || ''
  if (logoUrl && !logoUrl.startsWith('http://') && !logoUrl.startsWith('https://')) {
    logoUrl = await uploadToCloudinary(logoUrl)
  }

  let previewUrl = values.previewUrl || ''
  if (previewDataUrl) {
    try {
      previewUrl = await uploadToCloudinary(previewDataUrl)
    } catch (err) {
      console.warn('Could not upload QR preview snapshot:', err)
    }
  }

  const cleanValues = {
    ...values,
    logoValue: logoUrl,
  }

  const updatePayload = {
    title: (title || '').trim() || 'Untitled QR Code',
    values: cleanValues,
    updatedAt: serverTimestamp(),
  }

  if (previewUrl) {
    updatePayload.previewUrl = previewUrl
  }

  const docRef = doc(db, COLLECTION_NAME, id)
  await updateDoc(docRef, updatePayload)
  return { id, ...updatePayload }
}

/**
 * Retrieve all saved QR codes ordered by latest updated.
 */
export async function fetchSavedQRCodes() {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('updatedAt', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }))
  } catch (error) {
    // If the index query fails or is empty, fallback to simple collection query
    console.warn('Indexed fetch failed, falling back to basic getDocs:', error)
    const snapshot = await getDocs(collection(db, COLLECTION_NAME))
    const items = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }))
    return items.sort((a, b) => {
      const aTime = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0
      const bTime = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0
      return bTime - aTime
    })
  }
}

/**
 * Delete a saved QR code by ID.
 *
 * @param {string} id
 */
export async function deleteQRCode(id) {
  if (!id) throw new Error('Document ID is required')
  await deleteDoc(doc(db, COLLECTION_NAME, id))
}
