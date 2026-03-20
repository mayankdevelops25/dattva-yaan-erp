const DEFAULT_BASE_URL = 'https://dattvayaan.live/';

const useAppSettings = () => {
  let settings = {};
  settings['idurar_app_email'] =
    process.env.APP_EMAIL || 'mayankjaindd@gmail.com';
  // Priority order: APP_BASE_URL > BASE_URL (backward compatibility) >
  // WEBSITE_URL > default production domain.
  const configuredBaseUrl =
    process.env.APP_BASE_URL ||
    process.env.BASE_URL ||
    process.env.WEBSITE_URL ||
    DEFAULT_BASE_URL;

  // Normalize base URL for email links; this mirrors frontend handling but lives
  // here because frontend and backend bundles cannot share utilities directly
  // in this project layout without restructuring.
  settings['idurar_base_url'] = configuredBaseUrl.endsWith('/')
    ? configuredBaseUrl
    : `${configuredBaseUrl}/`;
  return settings;
};

module.exports = useAppSettings;
