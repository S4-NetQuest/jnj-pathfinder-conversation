// frontend/src/utils/urlUtils.js

/**
 * Generate a URL to a file in the public directory
 * @param {string} filename - The filename (e.g., 'document.pdf', 'images/logo.png')
 * @returns {string} - The complete URL to the file
 */
export const getPublicFileUrl = (filename) => {
  const mode = import.meta.env.MODE

  // Use explicit environment variable as primary source, fallback to Vite's BASE_URL
  const baseUrl = import.meta.env.VITE_BASE_URL || import.meta.env.BASE_URL || '/'

  // In development, use simple path
  if (mode === 'development') {
    return `/${filename}`
  }

  // For staging/production, construct the full path with base URL
  let cleanBase = baseUrl
  if (cleanBase.endsWith('/')) {
    cleanBase = cleanBase.slice(0, -1)
  }

  // Construct the full path
  const fullPath = `${cleanBase}/${filename}`
  console.log('Public file URL constructed:', fullPath)

  return fullPath
}

/**
 * Specifically for PDF files in the public directory
 * @param {string} filename - The PDF filename
 * @returns {string} - The complete URL to the PDF
 */
export const getPdfUrl = (filename) => {
  return getPublicFileUrl(filename)
}

/**
 * Generate URL for assets in the public/assets directory
 * @param {string} filename - The asset filename
 * @returns {string} - The complete URL to the asset
 */
export const getAssetUrl = (filename) => {
  return getPublicFileUrl(`assets/${filename}`)
}

/**
 * Generate URL for images in the public/images directory
 * @param {string} filename - The image filename
 * @returns {string} - The complete URL to the image
 */
export const getImageUrl = (filename) => {
  return getPublicFileUrl(`images/${filename}`)
}

// Alternative approach using a class (if you prefer OOP style)
export class UrlBuilder {
  constructor() {
    this.mode = import.meta.env.MODE
    this.baseUrl = import.meta.env.VITE_BASE_URL || import.meta.env.BASE_URL || '/'
  }

  getPublicFileUrl(filename) {
    if (this.mode === 'development') {
      return `/${filename}`
    }

    let cleanBase = this.baseUrl
    if (cleanBase.endsWith('/')) {
      cleanBase = cleanBase.slice(0, -1)
    }

    const fullPath = `${cleanBase}/${filename}`
    console.log('Public file URL constructed:', fullPath)
    return fullPath
  }

  getPdfUrl(filename) {
    return this.getPublicFileUrl(filename)
  }

  getAssetUrl(filename) {
    return this.getPublicFileUrl(`assets/${filename}`)
  }

  getImageUrl(filename) {
    return this.getPublicFileUrl(`images/${filename}`)
  }
}

// Export a singleton instance if using the class approach
export const urlBuilder = new UrlBuilder()