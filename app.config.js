module.exports = ({ config }) => ({
  ...config,
  extra: { ...config.extra, apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || config.extra.apiBaseUrl },
});
