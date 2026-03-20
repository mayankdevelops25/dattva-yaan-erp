const DEFAULT_PROD_URL = 'https://dattvayaan.live/';

/**
 * Normalize a base URL by trimming whitespace, applying a fallback when empty,
 * and ensuring it ends with a trailing slash.
 * @param {string | undefined} url - candidate URL to normalize
 * @param {string} fallback - URL to use when the candidate is missing/empty
 * @returns {string} normalized URL that always ends with `/`
 */
const normalizeUrlWithTrailingSlash = (url, fallback = DEFAULT_PROD_URL) => {
  const trimmedInput = typeof url === 'string' ? url.trim() : '';
  const candidate = trimmedInput.length > 0 ? trimmedInput : fallback;
  const applySlash = (value) => (value.endsWith('/') ? value : `${value}/`);

  try {
    const normalized = new URL(candidate).toString();
    return applySlash(normalized);
  } catch (error) {
    console.warn(
      'Invalid base URL provided, falling back to default.',
      error?.message || error
    );
    return applySlash(fallback);
  }
};

const isProdLike =
  import.meta.env.PROD || import.meta.env.VITE_DEV_REMOTE === 'remote';

const backendBaseUrl = normalizeUrlWithTrailingSlash(
  import.meta.env.VITE_BACKEND_SERVER,
  DEFAULT_PROD_URL
);

export const API_BASE_URL = isProdLike
  ? `${backendBaseUrl}api/`
  : 'http://localhost:8888/api/';

export const BASE_URL = isProdLike
  ? backendBaseUrl
  : 'http://localhost:8888/';

const websiteBaseUrl = normalizeUrlWithTrailingSlash(
  import.meta.env.VITE_WEBSITE_URL || import.meta.env.VITE_WEBSITE,
  DEFAULT_PROD_URL
);

export const WEBSITE_URL = import.meta.env.PROD
  ? websiteBaseUrl
  : 'http://localhost:3000/';

export const DOWNLOAD_BASE_URL = isProdLike
  ? `${backendBaseUrl}download/`
  : 'http://localhost:8888/download/';
export const ACCESS_TOKEN_NAME = 'x-auth-token';

export const FILE_BASE_URL = import.meta.env.VITE_FILE_BASE_URL;

 console.log(
 '🚀 Welcome to Dattva Yaan! Your Complete Business Management Solution.'
);
