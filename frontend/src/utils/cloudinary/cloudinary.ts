// utils/cloudinary.ts
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_DELIVERY_BASE = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/`;
const CLOUDINARY_UPLOAD_BASE = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}`;

type ResourceType = 'image' | 'video' | 'raw';
type FileType = 'image' | 'video' | 'audio' | 'document';

const getResourceType = (fileType: FileType): ResourceType => {
  switch (fileType) {
    case 'image':
      return 'image';
    case 'video':
    case 'audio':
      return 'video';
    case 'document':
      return 'raw';
  }
};

const getUploadEndpoint = (resourceType: ResourceType): string => 
  `${CLOUDINARY_UPLOAD_BASE}/${resourceType}/upload`;

export const cloudinaryUtils = {
  getRelativePath: (fullUrl: string): string => {
    if (!fullUrl) return '';
    return fullUrl.replace(CLOUDINARY_DELIVERY_BASE, '');
  },
  getFullUrl: (relativePath: string): string => {
    if (!relativePath) return '';
    if (relativePath.startsWith('http')) return relativePath;
    return CLOUDINARY_DELIVERY_BASE + relativePath;
  },
  uploadFile: async (file: File, type: FileType): Promise<string> => {
    const resourceType = getResourceType(type);
    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(getUploadEndpoint(resourceType), {
      method: 'POST',
      body: uploadData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || `${type} upload failed`);
    }
    return cloudinaryUtils.getRelativePath(data.secure_url);
  },
  // Backward compatibility for existing code
  uploadImage: async (file: File): Promise<string> => {
    return cloudinaryUtils.uploadFile(file, 'image');
  },
};