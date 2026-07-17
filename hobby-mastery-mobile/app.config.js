const appJson = require('./app.json');

module.exports = {
  ...appJson.expo,
  extra: {
    ...appJson.expo.extra,
    eas: {
      ...appJson.expo.extra?.eas,
    },
    pexelsApiKey: process.env.EXPO_PUBLIC_PEXELS_API_KEY || '',
  },
};
