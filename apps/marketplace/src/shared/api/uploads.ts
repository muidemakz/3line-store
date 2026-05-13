import { tokenStorage } from './client';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

/**
 * Upload a single image file to the backend.
 * Returns the public URL that can be stored and displayed later.
 */
export async function uploadFile(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  const token = tokenStorage.getAccess();
  const response = await fetch(`${BASE_URL}/uploads`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
    // Note: do NOT set Content-Type — browser sets it automatically with boundary
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json?.message || 'Upload failed');
  }

  return json.data as UploadResult;
}
