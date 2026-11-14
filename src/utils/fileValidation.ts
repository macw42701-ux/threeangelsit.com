export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

const BLOCKED_DANGEROUS_EXTENSIONS = new Set([
  'exe',
  'msi',
  'bat',
  'cmd',
  'sh',
  'bash',
  'ps1',
  'vbs',
  'vbe',
  'js',
  'mjs',
  'cjs',
  'jsx',
  'ts',
  'tsx',
  'php',
  'py',
  'rb',
  'pl',
  'dll',
  'so',
  'dylib',
  'scr',
  'pif',
  'com',
  'jar',
  'app',
  'dmg',
  'iso',
  'html',
  'htm',
  'svg',
]);

const ALLOWED_IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp']);
const ALLOWED_IMAGE_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

const ALLOWED_RESOURCE_EXTENSIONS = new Set(['pdf', 'md', 'txt', 'csv', 'png', 'jpg', 'jpeg', 'webp']);
const ALLOWED_RESOURCE_MIMES = new Set([
  'application/pdf',
  'text/markdown',
  'text/plain',
  'text/csv',
  'image/png',
  'image/jpeg',
  'image/webp',
  '',
]);
const MAX_RESOURCE_BYTES = 15 * 1024 * 1024; // 15 MB

function getFileExtension(fileName: string): string {
  const parts = fileName.toLowerCase().trim().split('.');
  return parts.length > 1 ? parts[parts.length - 1] : '';
}

export function validateImageUpload(file: File): FileValidationResult {
  const ext = getFileExtension(file.name);

  if (BLOCKED_DANGEROUS_EXTENSIONS.has(ext)) {
    return {
      valid: false,
      error: `Blocked security risk: ".${ext}" files are not permitted in the Media Library.`,
    };
  }

  if (!ALLOWED_IMAGE_EXTENSIONS.has(ext) || !ALLOWED_IMAGE_MIMES.has(file.type)) {
    return {
      valid: false,
      error: 'Unsupported image format. Only JPG, JPEG, PNG, and WebP images are permitted.',
    };
  }

  if (file.size <= 0) {
    return { valid: false, error: 'Selected file appears empty (0 bytes).' };
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return {
      valid: false,
      error: `Image exceeds maximum limit of 5 MB (${(file.size / (1024 * 1024)).toFixed(1)} MB selected).`,
    };
  }

  return { valid: true };
}

export function validateDigitalResourceUpload(file: File): FileValidationResult {
  const ext = getFileExtension(file.name);

  if (!ext || BLOCKED_DANGEROUS_EXTENSIONS.has(ext)) {
    return {
      valid: false,
      error: `Security rejection: executable, script, or web markup files (.${ext || 'unknown'}) are strictly prohibited.`,
    };
  }

  if (!ALLOWED_RESOURCE_EXTENSIONS.has(ext)) {
    return {
      valid: false,
      error: 'Unsupported resource type. Allowed: PDF, Markdown (.md), TXT, CSV, PNG, JPG, WebP.',
    };
  }

  if (file.type && !ALLOWED_RESOURCE_MIMES.has(file.type)) {
    return {
      valid: false,
      error: `MIME type "${file.type}" does not match an allowed educational document format.`,
    };
  }

  if (file.size <= 0) {
    return { valid: false, error: 'Selected file is empty (0 bytes).' };
  }

  if (file.size > MAX_RESOURCE_BYTES) {
    return {
      valid: false,
      error: `File exceeds maximum upload limit of 15 MB.`,
    };
  }

  return { valid: true };
}

export function validateSafeEmbedUrl(rawUrl: string): FileValidationResult {
  const trimmed = rawUrl.trim();
  if (!trimmed) return { valid: true };
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:') {
      return {
        valid: false,
        error: 'Video URL must use secure HTTPS protocol.',
      };
    }
    return { valid: true };
  } catch {
    return {
      valid: false,
      error: 'Enter a valid full URL starting with https://',
    };
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
