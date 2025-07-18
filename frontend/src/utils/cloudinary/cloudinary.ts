// utils/cloudinary.ts
const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/`;

export const cloudinaryUtils = {
  getRelativePath: (fullUrl: string): string => {
    if (!fullUrl) return '';
    return fullUrl.replace(CLOUDINARY_BASE_URL, '');
  },
  getFullUrl: (relativePath: string): string => {
    if (!relativePath) return '';
    if (relativePath.startsWith('http')) return relativePath;
    return CLOUDINARY_BASE_URL + relativePath;
  },
  uploadImage: async (file: File): Promise<string> => {
    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: uploadData,
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || "Image upload failed");
    }
    return cloudinaryUtils.getRelativePath(data.secure_url);
  }
};