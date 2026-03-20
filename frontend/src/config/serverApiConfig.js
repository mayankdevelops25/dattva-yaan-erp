const ensureTrailingSlash = (url = '') =>
  url.endsWith('/') ? url : `${url}/`;

const isProdLike =
  import.meta.env.PROD || import.meta.env.VITE_DEV_REMOTE == 'remote';

const backendBaseUrl = ensureTrailingSlash(
  import.meta.env.VITE_BACKEND_SERVER || 'https://dattvayaan.live/'
);

export const API_BASE_URL = isProdLike
  ? `${backendBaseUrl}api/`
  : 'http://localhost:8888/api/';

export const BASE_URL = isProdLike
  ? backendBaseUrl
  : 'http://localhost:8888/';

const websiteBaseUrl = ensureTrailingSlash(
  import.meta.env.VITE_WEBSITE_URL ||
    import.meta.env.VITE_WEBSITE ||
    'https://dattvayaan.live/'
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
