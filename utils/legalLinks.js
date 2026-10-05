import { Linking } from "react-native";

// Public policy pages on the StitchBook website (also listed in the Play Console).
const WEB_APP_URL = (process.env.EXPO_PUBLIC_WEB_APP_URL || "https://stitch-book-web.vercel.app").replace(/\/$/, "");

export const PRIVACY_URL = `${WEB_APP_URL}/privacy`;
export const TERMS_URL = `${WEB_APP_URL}/terms`;

export const openLink = (url) => Linking.openURL(url).catch(() => {});
