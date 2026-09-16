import { ACCEPTED_DOCUMENT_TYPES, ACCEPTED_IMAGE_TYPES, ACCEPTED_VIDEO_TYPES, MAX_SIZES_BYTES } from "./mime";

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export type LmsUploadKind = "video" | "document" | "image" | "avatar";

const KIND_TYPES: Record<LmsUploadKind, string[]> = {
  video: ACCEPTED_VIDEO_TYPES,
  document: ACCEPTED_DOCUMENT_TYPES,
  image: ACCEPTED_IMAGE_TYPES,
  avatar: ACCEPTED_IMAGE_TYPES,
};

/** Validates a course-material upload before it hits the wire (type + size). */
export function validateUpload(file: File, kind: LmsUploadKind): FileValidationResult {
  const allowedTypes = KIND_TYPES[kind];
  const maxSize = MAX_SIZES_BYTES[kind];

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `Unsupported file type for ${kind}: ${file.type || "unknown"}` };
  }
  if (file.size > maxSize) {
    return { valid: false, error: `File exceeds max size of ${maxSize / (1024 * 1024)}MB` };
  }
  return { valid: true };
}