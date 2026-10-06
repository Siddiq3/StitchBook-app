import { authApi } from './api';
import { storage } from './storage';

export const authService = {
  refreshProfile: async () => {
    const res = await authApi.profile();
    const user = res.data.data;
    // Never turn a legacy/incomplete profile into unrestricted cached access.
    if (!user?.id || !Array.isArray(user.permissions)) {
      throw new Error('Could not verify your shop permissions. Please try again.');
    }
    await storage.setUser(user);
    return user;
  },

  registerWithPassword: async (data) => {
    const res = await authApi.register(data);
    const { token, refreshToken, user } = res.data.data;
    await storage.saveAuth(token, refreshToken, user);
    return { token, refreshToken, user };
  },

  loginWithPassword: async (identifier, password) => {
    const res = await authApi.login(identifier, password);
    const { token, refreshToken, user } = res.data.data;
    await storage.saveAuth(token, refreshToken, user);
    return { token, refreshToken, user };
  },

  requestPasswordReset: async (email) => {
    const res = await authApi.requestPasswordReset(email);
    return res.data;
  },

  resetPassword: async (email, otp, newPassword) => {
    const res = await authApi.resetPassword(email, otp, newPassword);
    return res.data;
  },

  setPassword: async (currentPassword, newPassword) => {
    const res = await authApi.setPassword(currentPassword, newPassword);
    const user = res.data.data?.user;
    if (user) await storage.setUser(user);
    return res.data.data;
  },

  loginWithFirebase: async (firebaseToken) => {
    const res = await authApi.firebase(firebaseToken);
    const { token, refreshToken, user } = res.data.data;
    await storage.saveAuth(token, refreshToken, user);
    return { token, refreshToken, user };
  },

  loginWithGoogle: async (idToken) => {
    const res = await authApi.google(idToken);
    const { token, refreshToken, user } = res.data.data;
    await storage.saveAuth(token, refreshToken, user);
    return { token, refreshToken, user };
  },

  loginWithMsg91Widget: async (accessToken) => {
    const res = await authApi.msg91Widget(accessToken);
    const { token, refreshToken, user } = res.data.data;
    await storage.saveAuth(token, refreshToken, user);
    return { token, refreshToken, user };
  },

  sendMsg91MobileOtp: async (identifier) => {
    const res = await authApi.msg91MobileSendOtp(identifier);
    return res.data.data;
  },

  loginWithMsg91MobileOtp: async (reqId, otp) => {
    const res = await authApi.msg91MobileVerifyOtp(reqId, otp);
    const { token, refreshToken, user } = res.data.data;
    await storage.saveAuth(token, refreshToken, user);
    return { token, refreshToken, user };
  },

  getAuthMethods: async () => {
    const res = await authApi.methods();
    return res.data.data;
  },

  linkGoogle: async (idToken) => {
    const res = await authApi.linkGoogle(idToken);
    const user = res.data.data?.user;
    if (user) {
      await storage.setUser(user);
    }
    return res.data.data;
  },

  linkMobileWithOtp: async (reqId, otp) => {
    const res = await authApi.linkMobileVerifyOtp(reqId, otp);
    const user = res.data.data?.user;
    if (user) {
      await storage.setUser(user);
    }
    return res.data.data;
  },

  linkMobileWithAccessToken: async (accessToken) => {
    const res = await authApi.linkMobileAccessToken(accessToken);
    const user = res.data.data?.user;
    if (user) {
      await storage.setUser(user);
    }
    return res.data.data;
  },

  restoreSession: async () => {
    const [token, user, shop] = await Promise.all([
      storage.getToken(),
      storage.getUser(),
      storage.getShop(),
    ]);
    if (!token || !user) return null;
    return { token, user, shop };
  },

  logout: async () => {
    try { await authApi.logout(); }
    catch { /* Offline sign-out still clears this device; server revocation requires connectivity. */ }
    finally { await storage.clearAll(); }
  },
};
