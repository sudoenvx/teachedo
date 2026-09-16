export const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
export const ACCEPTED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];
export const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export const MAX_SIZES_BYTES = {
  video: 2 * 1024 * 1024 * 1024, // 2GB
  document: 50 * 1024 * 1024, // 50MB
  image: 10 * 1024 * 1024, // 10MB
  avatar: 5 * 1024 * 1024, // 5MB
};

export function getFileExtension(filename: string): string {
  return filename.slice(filename.lastIndexOf(".") + 1).toLowerCase();
}