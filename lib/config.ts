// API_URL = endpoint API (dengan /api) -> https://api.herclo.co.id/api
// ASSET_URL = host storage gambar -> https://herclo.co.id (tanpa /api, sesuai contoh user: https://herclo.co.id/storage/banners/...)

const productionApiUrl = 'https://api.herclo.co.id/api';
const productionBackendUrl = 'https://api.herclo.co.id';

export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || productionApiUrl
).replace(/\/+$/, '');

export const ASSET_URL = (
  process.env.NEXT_PUBLIC_ASSET_URL || 
  process.env.NEXT_PUBLIC_BACKEND_URL || 
  productionBackendUrl
).replace(/\/+$/, '');

export const getAssetUrl = (path?: string): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${ASSET_URL}${normalized}`;
};
