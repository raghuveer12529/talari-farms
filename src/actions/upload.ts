'use server';

import { auth } from '@/auth';
import { cloudinary, isCloudinaryConfigured } from '@/lib/cloudinary';

interface UploadResult {
  ok: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload a base64 data URL (image or PDF/COA) to Cloudinary and return the
 * secure URL. Called from client uploaders that read a File via FileReader.
 */
export async function uploadFile(dataUrl: string, folder = 'talari-erp'): Promise<UploadResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: 'Unauthorized' };

  if (!isCloudinaryConfigured) {
    return { ok: false, error: 'File storage is not configured (Cloudinary env vars missing).' };
  }

  if (!dataUrl.startsWith('data:')) {
    return { ok: false, error: 'Invalid file data.' };
  }

  try {
    const res = await cloudinary.uploader.upload(dataUrl, {
      folder,
      resource_type: 'auto',
    });
    return { ok: true, url: res.secure_url };
  } catch (err) {
    console.error('Cloudinary upload failed', err);
    return { ok: false, error: 'Upload failed. Please try again.' };
  }
}
