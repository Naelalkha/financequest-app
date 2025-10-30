import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Types de fichiers acceptés pour les preuves
 */
const ACCEPTED_FILE_TYPES = {
  'image/jpeg': true,
  'image/jpg': true,
  'image/png': true,
  'image/gif': true,
  'image/webp': true,
  'application/pdf': true,
};

/**
 * Taille maximale du fichier (5 MB)
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Valide un fichier de preuve
 * @param {File} file - Fichier à valider
 * @returns {{valid: boolean, error?: string}}
 */
export const validateProofFile = (file) => {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (!ACCEPTED_FILE_TYPES[file.type]) {
    return { 
      valid: false, 
      error: 'Invalid file type. Only images (JPEG, PNG, GIF, WebP) and PDF are accepted.' 
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: `File is too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.` 
    };
  }

  return { valid: true };
};

/**
 * Upload un fichier de preuve dans Firebase Storage
 * Structure: /proofs/{userId}/{eventId}/{filename}
 * 
 * @param {string} userId - ID de l'utilisateur
 * @param {string} eventId - ID de l'événement d'économie
 * @param {File} file - Fichier à uploader
 * @returns {Promise<{url: string, path: string}>} URL de téléchargement et chemin
 */
export const uploadProofFile = async (userId, eventId, file) => {
  try {
    // Validation
    const validation = validateProofFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Générer un nom de fichier unique avec timestamp
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${sanitizedFileName}`;
    
    // Créer la référence du fichier
    const filePath = `proofs/${userId}/${eventId}/${fileName}`;
    const storageRef = ref(storage, filePath);

    // Upload du fichier
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type,
    });

    // Récupérer l'URL de téléchargement
    const downloadURL = await getDownloadURL(snapshot.ref);

    return {
      url: downloadURL,
      path: filePath,
      fileName: fileName,
      contentType: file.type,
      size: file.size,
    };
  } catch (error) {
    console.error('Error uploading proof file:', error);
    throw error;
  }
};

/**
 * Supprime un fichier de preuve de Firebase Storage
 * @param {string} filePath - Chemin du fichier dans Storage
 * @returns {Promise<void>}
 */
export const deleteProofFile = async (filePath) => {
  try {
    const storageRef = ref(storage, filePath);
    await deleteObject(storageRef);
  } catch (error) {
    // Si le fichier n'existe pas, on ignore l'erreur
    if (error.code === 'storage/object-not-found') {
      console.warn('Proof file not found, skipping deletion:', filePath);
      return;
    }
    console.error('Error deleting proof file:', error);
    throw error;
  }
};

/**
 * Extrait le chemin du fichier depuis une URL Firebase Storage
 * @param {string} url - URL du fichier
 * @returns {string|null} Chemin du fichier ou null si invalide
 */
export const extractFilePathFromURL = (url) => {
  try {
    // Format URL Firebase Storage:
    // https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?alt=media&token={token}
    const urlObj = new URL(url);
    const pathMatch = urlObj.pathname.match(/\/o\/(.+)/);
    if (pathMatch && pathMatch[1]) {
      // Décoder le chemin URL
      return decodeURIComponent(pathMatch[1]);
    }
    return null;
  } catch (error) {
    console.error('Error extracting file path from URL:', error);
    return null;
  }
};

/**
 * Met à jour le fichier de preuve (supprime l'ancien et upload le nouveau)
 * @param {string} userId - ID de l'utilisateur
 * @param {string} eventId - ID de l'événement
 * @param {File} newFile - Nouveau fichier
 * @param {string} [oldFileURL] - URL de l'ancien fichier à supprimer
 * @returns {Promise<{url: string, path: string}>}
 */
export const updateProofFile = async (userId, eventId, newFile, oldFileURL) => {
  try {
    // Supprimer l'ancien fichier si présent
    if (oldFileURL) {
      const oldPath = extractFilePathFromURL(oldFileURL);
      if (oldPath) {
        await deleteProofFile(oldPath);
      }
    }

    // Upload le nouveau fichier
    return await uploadProofFile(userId, eventId, newFile);
  } catch (error) {
    console.error('Error updating proof file:', error);
    throw error;
  }
};

