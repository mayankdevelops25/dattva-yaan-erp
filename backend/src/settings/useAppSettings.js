const normalizeBaseUrl = (url = '') => {
  if (!url) return 'https://dattvayaan.live/';
  return url.endsWith('/') ? url : `${url}/`;
};

const useAppSettings = () => {
  let settings = {};
  settings['idurar_app_email'] =
    process.env.APP_EMAIL || 'mayankjaindd@gmail.com';
  settings['idurar_base_url'] = normalizeBaseUrl(
    process.env.BASE_URL || process.env.WEBSITE_URL
  );
  return settings;
};

module.exports = useAppSettings;
