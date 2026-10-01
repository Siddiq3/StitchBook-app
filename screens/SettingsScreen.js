import { getNativeGoogleModule, getMsg91Module } from "../services/nativeAuthModules";
import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Modal,
  Pressable,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform } from
'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Constants from 'expo-constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors123, spacing, fonts, radius } from '../utils/theme';
import ScreenHeader from '../components/ScreenHeader';
import AppButton from '../components/AppButton';
import { useLanguage } from '../context/LanguageContext';
import { useStitchPro } from '../context/StitchProContext';
import { useToast } from '../context/ToastContext';
import { languages } from '../localization/translations';
import { authService } from '../services/authService';

const googleWebClientId = Constants.expoConfig?.extra?.googleWebClientId || '';
const msg91WidgetId = Constants.expoConfig?.extra?.msg91WidgetId || '';
const msg91WidgetTokenAuth = Constants.expoConfig?.extra?.msg91WidgetTokenAuth || '';
const extractMsg91AccessToken = (response) =>
  response?.accessToken ||
  response?.access_token ||
  response?.message ||
  response?.data?.accessToken ||
  response?.data?.message ||
  '';

const toMsg91Identifier = (phone) => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  return digits;
};

const settingsMenuItems = [
{
  id: 'notifications',
  icon: 'bell-outline',
  label: 'notifications',
  iconBgColor: colors123.primaryLight
},
{
  id: 'staff-management',
  icon: 'account-multiple',
  label: 'staffManagement',
  iconBgColor: colors123.primaryLight
},
{
  id: 'subscription',
  icon: 'credit-card',
  label: 'subscription',
  iconBgColor: colors123.primaryLight
}];

function SettingsMenuItem({ item, onPress, t }) {
  return (
    <TouchableOpacity accessibilityRole="button"
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}>

      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name={item.icon}
          size={20}
          color={colors123.primary} />

      </View>
      <Text style={styles.menuLabel}>{t(item.label)}</Text>
      <MaterialCommunityIcons
        name="chevron-right"
        size={24}
        color={colors123.textSoft} />

    </TouchableOpacity>);

}

export default function SettingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { t, language, selectLanguage } = useLanguage();
  const { user, shop, logout, updateShop, updateAuthenticatedUser } = useStitchPro();
  const { showToast } = useToast();
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [shopEditModalVisible, setShopEditModalVisible] = useState(false);
  const [mobileLinkModalVisible, setMobileLinkModalVisible] = useState(false);
  const [shopForm, setShopForm] = useState({
    name: shop?.name || '',
    phone: shop?.phone || '',
    location: shop?.location || ''
  });
  const [isUpdatingShop, setIsUpdatingShop] = useState(false);
  const [authMethods, setAuthMethods] = useState(null);
  const [authMethodsLoading, setAuthMethodsLoading] = useState(false);
  const [linkingGoogle, setLinkingGoogle] = useState(false);
  const [linkingMobile, setLinkingMobile] = useState(false);
  const [linkPhone, setLinkPhone] = useState('');
  const [linkOtp, setLinkOtp] = useState('');
  const [linkReqId, setLinkReqId] = useState('');

  useEffect(() => {
    setShopForm({
      name: shop?.name || '',
      phone: shop?.phone || '',
      location: shop?.location || ''
    });
  }, [shop]);

  useEffect(() => {
    loadAuthMethods();

    if (Platform.OS === 'android' && googleWebClientId) {
      const googleModule = getNativeGoogleModule();
      googleModule?.GoogleSignin?.configure({
        webClientId: googleWebClientId,
        scopes: ['profile', 'email']
      });
    }

    if (msg91WidgetId && msg91WidgetTokenAuth) {
      const msg91 = getMsg91Module();
      msg91?.OTPWidget?.initializeWidget(msg91WidgetId, msg91WidgetTokenAuth);
    }
  }, []);

  const currentLanguageName = languages.find(
    (lang) => lang.code === language
  )?.nativeName || language;

  const handleLanguageSelect = async (languageCode) => {
    await selectLanguage(languageCode);
    setLanguageModalVisible(false);
  };

  const handleUpdateShop = async () => {
    if (!shopForm.name.trim()) {
      showToast(t('shopNameRequired'), 'error');
      return;
    }

    setIsUpdatingShop(true);
    try {
      await updateShop({
        name: shopForm.name.trim(),
        phone: shopForm.phone.trim(),
        location: shopForm.location.trim()
      });
      showToast(t('shopUpdated'), 'success');
      setShopEditModalVisible(false);
    } catch (err) {
      showToast(err.message || t('shopUpdateFailed'), 'error');
    } finally {
      setIsUpdatingShop(false);
    }
  };

  const loadAuthMethods = async () => {
    setAuthMethodsLoading(true);
    try {
      const methods = await authService.getAuthMethods();
      setAuthMethods(methods);
    } catch (err) {
      setAuthMethods(null);
    } finally {
      setAuthMethodsLoading(false);
    }
  };

  const handleLinkGoogle = async () => {
    if (!googleWebClientId) {
      showToast('Google login is not configured for this app build.', 'error');
      return;
    }

    setLinkingGoogle(true);
    try {
      const googleModule = getNativeGoogleModule();
      if (!googleModule?.GoogleSignin) {
        throw new Error('Connecting Google is unavailable in this preview. Please use the latest installed StitchBook app.');
      }

      const { GoogleSignin } = googleModule;
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      await GoogleSignin.signOut().catch(() => null);
      const response = await GoogleSignin.signIn();
      if (response?.type === 'cancelled') return;

      const googleUser = response?.data || response;
      const idToken = googleUser?.idToken || (await GoogleSignin.getTokens())?.idToken;
      if (!idToken) {
        throw new Error('Google did not return an ID token.');
      }

      const data = await authService.linkGoogle(idToken);
      if (data?.user) await updateAuthenticatedUser(data.user);
      setAuthMethods(data?.methods || null);
      showToast('Google login connected', 'success');
    } catch (err) {
      const googleModule = getNativeGoogleModule();
      if (err.code === googleModule?.statusCodes?.SIGN_IN_CANCELLED) return;
      const message =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        err.message ||
        'Could not connect Google login';
      showToast(message, 'error');
    } finally {
      setLinkingGoogle(false);
    }
  };

  const resetMobileLink = () => {
    setLinkPhone('');
    setLinkOtp('');
    setLinkReqId('');
  };

  const handleSendLinkOtp = async () => {
    const identifier = toMsg91Identifier(linkPhone);
    if (identifier.length < 12) {
      showToast('Enter a valid mobile number', 'error');
      return;
    }

    setLinkingMobile(true);
    try {
      const msg91 = getMsg91Module();
      if (!msg91?.OTPWidget || !msg91WidgetId || !msg91WidgetTokenAuth) {
        throw new Error('MSG91 mobile OTP is not configured in this app build.');
      }

      await msg91.OTPWidget.initializeWidget(msg91WidgetId, msg91WidgetTokenAuth);
      const response = await msg91.OTPWidget.sendOTP({ identifier });
      if (response?.type === 'error' || response?.hasError || response?.status === 'fail') {
        throw new Error(response?.message || 'Could not send OTP');
      }

      const reqId = response?.reqId || response?.message || response?.data?.reqId;
      if (!reqId) throw new Error('OTP request missing. Please try again.');
      setLinkReqId(reqId);
      showToast('OTP sent', 'success');
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        err.message ||
        'Could not send OTP';
      showToast(message, 'error');
    } finally {
      setLinkingMobile(false);
    }
  };

  const handleVerifyLinkOtp = async () => {
    if (!linkReqId) {
      showToast('Send OTP first', 'error');
      return;
    }

    const cleanOtp = linkOtp.replace(/\D/g, '');
    if (cleanOtp.length < 4) {
      showToast('Enter the OTP', 'error');
      return;
    }

    setLinkingMobile(true);
    try {
      const msg91 = getMsg91Module();
      if (!msg91?.OTPWidget || !msg91WidgetId || !msg91WidgetTokenAuth) {
        throw new Error('MSG91 mobile OTP is not configured in this app build.');
      }

      await msg91.OTPWidget.initializeWidget(msg91WidgetId, msg91WidgetTokenAuth);
      const response = await msg91.OTPWidget.verifyOTP({
        reqId: linkReqId,
        otp: cleanOtp
      });

      if (response?.type === 'error' || response?.hasError || response?.status === 'fail') {
        throw new Error(response?.message || 'Could not verify OTP');
      }

      const accessToken = extractMsg91AccessToken(response);
      if (!accessToken) {
        throw new Error('MSG91 verified OTP, but did not return access token.');
      }

      const data = await authService.linkMobileWithAccessToken(accessToken);
      if (data?.user) await updateAuthenticatedUser(data.user);
      setAuthMethods(data?.methods || null);
      setMobileLinkModalVisible(false);
      resetMobileLink();
      showToast('Mobile login connected', 'success');
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        err.message ||
        'Could not verify OTP';
      showToast(message, 'error');
    } finally {
      setLinkingMobile(false);
    }
  };

  const handleMenuItemPress = (itemId) => {

    // Navigate to respective screens
    switch (itemId) {
      case 'staff-management':
        navigation.navigate('Staff');
        break;
      case 'notifications':
        navigation.navigate('Notifications');
        break;
      case 'subscription':
        navigation.navigate('Subscription');
        break;
      default:

    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('logoutConfirmTitle'),
      t('logoutConfirmMessage'),
      [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('logout'),
        style: 'destructive',
        onPress: async () => {
          await logout();
          showToast(t('logoutSuccess'));
        }
      }]

    );
  };

  const shopInitials = shop?.name ?
  shop.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) :
  user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'S';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.headerWrap}>
        <ScreenHeader title={t('settings')} />
      </View>

      <ScrollView
        contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: insets.bottom + spacing.xl }]
        }
        showsVerticalScrollIndicator={false}>

        {/* Profile Section */}
        <View style={styles.profileSection}>
            <View style={styles.profileHeader}>
              <View style={styles.profileImageContainer}>
                <Text style={styles.profileInitial}>{shopInitials}</Text>
              </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name || t('user')}</Text>
              <Text style={styles.profileRole}>{shop?.name || t('shopOwner')}</Text>
            </View>
            <TouchableOpacity accessibilityRole="button"
              style={styles.editButton}
              onPress={() => setShopEditModalVisible(true)}>

              <MaterialCommunityIcons
                name="pencil"
                size={20}
                color={colors123.text} />

            </TouchableOpacity>
          </View>

          {/* Shop Info Card */}
          {shop &&
          <>
              <View style={styles.shopInfoCard}>
                <View style={styles.shopInfoRow}>
                  <MaterialCommunityIcons name="store" size={18} color={colors123.primary} />
                  <Text style={styles.shopInfoLabel}>{t('shopName')}:</Text>
                  <Text style={styles.shopInfoValue}>{shop.name}</Text>
                </View>
                {shop.phone &&
              <View style={styles.shopInfoRow}>
                    <MaterialCommunityIcons name="phone" size={18} color={colors123.primary} />
                    <Text style={styles.shopInfoLabel}>{t('phone')}:</Text>
                    <Text style={styles.shopInfoValue}>{shop.phone}</Text>
                  </View>
              }
                {shop.location &&
              <View style={styles.shopInfoRow}>
                    <MaterialCommunityIcons name="map-marker" size={18} color={colors123.primary} />
                    <Text style={styles.shopInfoLabel}>{t('address')}:</Text>
                    <Text style={styles.shopInfoValue} numberOfLines={1}>{shop.location}</Text>
                  </View>
              }
              </View>
              <TouchableOpacity accessibilityRole="button"
              style={styles.editShopButton}
              onPress={() => setShopEditModalVisible(true)}>

                <MaterialCommunityIcons name="pencil" size={16} color={colors123.primary} />
                <Text style={styles.editShopButtonText}>{t('editShopDetails')}</Text>
              </TouchableOpacity>
            </>
          }
        </View>

        {/* Language Section */}
        <View style={styles.languageSection}>
          <Text style={styles.sectionTitle}>{t('changeLanguage')}</Text>
          <TouchableOpacity accessibilityRole="button"
            style={styles.languageItem}
            onPress={() => setLanguageModalVisible(true)}
            activeOpacity={0.7}>

            <View style={styles.languageIconContainer}>
              <MaterialCommunityIcons
                name="earth"
                size={20}
                color={colors123.primary} />

            </View>
            <View style={styles.languageInfo}>
              <Text style={styles.languageLabel}>{t('language')}</Text>
              <Text style={styles.languageValue}>{currentLanguageName}</Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={colors123.textSoft} />

          </TouchableOpacity>
        </View>

        {/* Login Methods Section - disabled in this build */}
        {/*
        <View style={styles.authSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Login methods</Text>
            <TouchableOpacity onPress={loadAuthMethods} disabled={authMethodsLoading}>
              <MaterialCommunityIcons
                name="refresh"
                size={18}
                color={authMethodsLoading ? colors123.textMuted : colors123.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.authCard}>
            <View style={styles.authMethodRow}>
              <View style={[styles.authMethodIcon, styles.googleIcon]}>
                <MaterialCommunityIcons name="google" size={20} color={colors123.surface} />
              </View>
              <View style={styles.authMethodCopy}>
                <Text style={styles.authMethodTitle}>Google</Text>
                <Text style={styles.authMethodMeta} numberOfLines={1}>
                  {authMethods?.google?.linked ? authMethods.google.email || user?.email || 'Connected' : 'Not connected'}
                </Text>
              </View>
              {authMethods?.google?.linked ? (
                <View style={styles.connectedPill}>
                  <MaterialCommunityIcons name="check" size={14} color={colors123.success} />
                  <Text style={styles.connectedText}>Connected</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.connectButton}
                  onPress={handleLinkGoogle}
                  disabled={linkingGoogle}
                  activeOpacity={0.8}>
                  <Text style={styles.connectButtonText}>{linkingGoogle ? 'Connecting' : 'Connect'}</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.authDivider} />

            <View style={styles.authMethodRow}>
              <View style={[styles.authMethodIcon, styles.mobileIcon]}>
                <MaterialCommunityIcons name="cellphone-check" size={20} color={colors123.primary} />
              </View>
              <View style={styles.authMethodCopy}>
                <Text style={styles.authMethodTitle}>Mobile OTP</Text>
                <Text style={styles.authMethodMeta} numberOfLines={1}>
                  {authMethods?.mobile?.linked ? authMethods.mobile.phone || user?.phone || 'Connected' : 'Not connected'}
                </Text>
              </View>
              {authMethods?.mobile?.linked ? (
                <View style={styles.connectedPill}>
                  <MaterialCommunityIcons name="check" size={14} color={colors123.success} />
                  <Text style={styles.connectedText}>Connected</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.connectButton}
                  onPress={() => setMobileLinkModalVisible(true)}
                  activeOpacity={0.8}>
                  <Text style={styles.connectButtonText}>Connect</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <Text style={styles.authHelpText}>
            Connect both methods to open the same StitchBook account from Google or OTP.
          </Text>
        </View>
        */}

        <AppButton label="Devices and sessions" variant="secondary" onPress={() => navigation.navigate("Sessions")} />
        <AppButton label="Delete account" variant="danger" onPress={() => navigation.navigate('DeleteAccount')} />
        {/* Settings Menu */}
        <View style={styles.settingsMenu}>
          <Text style={styles.sectionTitle}>{t("shopDetails")}</Text>
          <SettingsMenuItem item={{ id: 'measurements', icon: 'ruler', label: 'measurements' }} t={t} onPress={() => navigation.navigate('Measurements')} />
          <Text style={styles.sectionTitle}>{t("team")}</Text>
          {settingsMenuItems.filter(item => item.id !== "subscription").map((item) =>
          <SettingsMenuItem
            key={item.id}
            item={item}
            t={t}
            onPress={() => handleMenuItemPress(item.id)} />

          )}
        </View>

        <View style={styles.settingsMenu}>
          <Text style={styles.sectionTitle}>{t("account")}</Text>
          {settingsMenuItems.filter(item => item.id === "subscription").map(item => <SettingsMenuItem key={item.id} item={item} t={t} onPress={() => handleMenuItemPress(item.id)} />)}
        </View>
        {/* Logout Button */}
        <TouchableOpacity accessibilityRole="button"
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}>

          <View style={[styles.iconContainer, { backgroundColor: colors123.danger }]}>
            <MaterialCommunityIcons
              name="logout"
              size={20}
              color={colors123.surface} />

          </View>
          <Text style={styles.logoutLabel}>{t('logout')}</Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color={colors123.textSoft} />

        </TouchableOpacity>
      </ScrollView>

      {/* Shop Edit Modal */}
      <Modal
        visible={shopEditModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setShopEditModalVisible(false)}>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}>

          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('editShopDetails')}</Text>
                <TouchableOpacity accessibilityRole="button" onPress={() => setShopEditModalVisible(false)}>
                  <MaterialCommunityIcons name="close" size={24} color={colors123.text} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>{t('shopName')} *</Text>
                  <TextInput accessibilityLabel={t('enterShopName')}
                    style={styles.input}
                    placeholder={t('enterShopName')}
                    value={shopForm.name}
                    onChangeText={(text) => setShopForm({ ...shopForm, name: text })} />

                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>{t('phone')}</Text>
                  <TextInput accessibilityLabel={t('enterPhoneNumber')}
                    style={styles.input}
                    placeholder={t('enterPhoneNumber')}
                    value={shopForm.phone}
                    onChangeText={(text) => setShopForm({ ...shopForm, phone: text })}
                    keyboardType="phone-pad" />

                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>{t('locationAddress')}</Text>
                  <TextInput accessibilityLabel={t('enterShopLocation')}
                    style={[styles.input, { minHeight: 80 }]}
                    placeholder={t('enterShopLocation')}
                    value={shopForm.location}
                    onChangeText={(text) => setShopForm({ ...shopForm, location: text })}
                    multiline
                    textAlignVertical="top" />

                </View>
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity accessibilityRole="button"
                  style={styles.cancelButton}
                  onPress={() => setShopEditModalVisible(false)}>

                  <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
                </TouchableOpacity>
                <AppButton
                  title={isUpdatingShop ? t('updating') : t('saveChanges')}
                  onPress={handleUpdateShop}
                  disabled={isUpdatingShop}
                  style={{ flex: 1, marginLeft: spacing.md }} />

              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Language Selection Modal */}
      <Modal
        visible={languageModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLanguageModalVisible(false)}>

        <Pressable accessibilityRole="button"
          style={styles.modalOverlay}
          onPress={() => setLanguageModalVisible(false)}>

          <View style={styles.languageModalContent}>
            <View style={styles.languageModalHeader}>
              <Text style={styles.languageModalTitle}>{t('selectLanguage')}</Text>
              <TouchableOpacity accessibilityRole="button" onPress={() => setLanguageModalVisible(false)}>
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={colors123.text} />

              </TouchableOpacity>
            </View>

            <ScrollView style={styles.languageList}>
              {languages.map((lang) =>
              <TouchableOpacity accessibilityRole="button" accessibilityState={{ selected: Boolean(language === lang.code) }}
                key={lang.code}
                style={[
                styles.languageOption,
                language === lang.code && styles.languageOptionSelected]
                }
                onPress={() => handleLanguageSelect(lang.code)}
                activeOpacity={0.7}>

                  <View
                  style={[
                  styles.radioOuter,
                  language === lang.code && styles.radioOuterSelected]
                  }>

                    {language === lang.code &&
                  <View style={styles.radioInner} />
                  }
                  </View>
                  <Text
                  style={[
                  styles.languageOptionText,
                  language === lang.code && styles.languageOptionTextSelected]
                  }>

                    {lang.nativeName}
                  </Text>
                  {language === lang.code &&
                <MaterialCommunityIcons
                  name="check-circle"
                  size={20}
                  color={colors123.primary} />

                }
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* Mobile Link Modal */}
      <Modal
        visible={mobileLinkModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setMobileLinkModalVisible(false);
          resetMobileLink();
        }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Connect mobile login</Text>
                  <Text style={styles.modalSubtitle}>Verify OTP to link this number safely.</Text>
                </View>
                <TouchableOpacity accessibilityRole="button"
                  onPress={() => {
                    setMobileLinkModalVisible(false);
                    resetMobileLink();
                  }}>
                  <MaterialCommunityIcons name="close" size={24} color={colors123.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Mobile number</Text>
                  <TextInput accessibilityLabel="Enter 10 digit number"
                    style={styles.input}
                    placeholder="Enter 10 digit number"
                    value={linkPhone}
                    onChangeText={setLinkPhone}
                    keyboardType="phone-pad"
                    maxLength={14} />
                </View>

                {linkReqId ? (
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>OTP</Text>
                    <TextInput accessibilityLabel="Enter OTP"
                      style={styles.input}
                      placeholder="Enter OTP"
                      value={linkOtp}
                      onChangeText={setLinkOtp}
                      keyboardType="number-pad"
                      maxLength={8} />
                  </View>
                ) : null}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity accessibilityRole="button"
                  style={styles.cancelButton}
                  onPress={() => {
                    setMobileLinkModalVisible(false);
                    resetMobileLink();
                  }}>
                  <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
                </TouchableOpacity>
                <AppButton
                  title={linkReqId ? 'Verify and connect' : 'Send OTP'}
                  onPress={linkReqId ? handleVerifyLinkOtp : handleSendLinkOtp}
                  disabled={linkingMobile}
                  style={{ flex: 1, marginLeft: spacing.md }} />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>);

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors123.background,
  },
  scrollContent: {
    paddingBottom: 168,
  },
  headerWrap: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    backgroundColor: colors123.background,
  },
  profileSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.md,
    backgroundColor: colors123.surface,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    borderRadius: 18,
    shadowColor: colors123.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0,
    shadowRadius: 10,
    elevation: 0,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  profileImageContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors123.primarySoft,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInitial: {
    fontSize: 24,

    color: colors123.primary,
    fontFamily: fonts.bold,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,

    color: colors123.text,
    fontFamily: fonts.semibold,
  },
  profileRole: {
    fontSize: 14,
    color: colors123.textMuted,
    fontFamily: fonts.regular,
    marginTop: 2,
  },
  editButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    backgroundColor: colors123.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  shopInfoCard: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors123.surfaceMuted,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    gap: spacing.sm,
  },
  shopInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  shopInfoLabel: {
    fontSize: 13,
    color: colors123.textMuted,
    fontFamily: fonts.regular,
  },
  shopInfoValue: {
    fontSize: 13,
    color: colors123.text,
    fontFamily: fonts.medium,
    flex: 1,
  },
  settingsMenu: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.md,
    backgroundColor: colors123.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    overflow: "hidden",
    shadowColor: colors123.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0,
    shadowRadius: 10,
    elevation: 0,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors123.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors123.borderLight,
    gap: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors123.surfaceMuted,
    justifyContent: "center",
    alignItems: "center",
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: colors123.text,
    fontFamily: fonts.medium,
  },
  languageSection: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 14,

    color: colors123.textMuted,
    fontFamily: fonts.semibold,
    marginBottom: spacing.md,
    textTransform: "uppercase",
  },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors123.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    gap: spacing.md,
    shadowColor: colors123.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0,
    shadowRadius: 4,
    elevation: 0,
  },
  languageIconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors123.primarySoft,
    justifyContent: "center",
    alignItems: "center",
  },
  languageInfo: {
    flex: 1,
  },
  languageLabel: {
    fontSize: 14,
    color: colors123.textMuted,
    fontFamily: fonts.regular,
  },
  languageValue: {
    fontSize: 16,

    color: colors123.text,
    fontFamily: fonts.semibold,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  languageModalContent: {
    backgroundColor: colors123.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: "80%",
    paddingTop: spacing.lg,
  },
  languageModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors123.border,
  },
  languageModalTitle: {
    fontSize: 18,

    color: colors123.text,
    fontFamily: fonts.bold,
  },
  languageList: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors123.surface,
    gap: spacing.md,
  },
  languageOptionSelected: {
    backgroundColor: colors123.primarySoft,
    borderWidth: 2,
    borderColor: colors123.primary,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors123.border,
    justifyContent: "center",
    alignItems: "center",
  },
  radioOuterSelected: {
    borderColor: colors123.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors123.primary,
  },
  languageOptionText: {
    flex: 1,
    fontSize: 15,
    color: colors123.text,
    fontFamily: fonts.medium,
  },
  languageOptionTextSelected: {
    color: colors123.primary,
    fontFamily: fonts.semibold,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors123.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    gap: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.xxl,
    shadowColor: colors123.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0,
    shadowRadius: 4,
    elevation: 0,
  },
  logoutLabel: {
    flex: 1,
    fontSize: 15,
    color: colors123.danger,
    fontFamily: fonts.medium,
  },
  editShopButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  editShopButtonText: {
    fontSize: 14,
    color: colors123.primary,
    fontFamily: fonts.semibold,
  },
  modalContent: {
    backgroundColor: colors123.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: "90%",
    paddingTop: spacing.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors123.border,
  },
  modalTitle: {
    fontSize: 18,

    color: colors123.text,
    fontFamily: fonts.bold,
  },
  modalSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: colors123.textMuted,
    fontFamily: fonts.regular,
  },
  modalBody: {
    padding: spacing.lg,
    maxHeight: "70%",
  },
  modalActions: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors123.border,
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 14,

    color: colors123.text,
    fontFamily: fonts.semibold,
    marginBottom: spacing.sm,
  },
  input: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors123.border,
    borderRadius: radius.md,
    fontSize: 14,
    color: colors123.text,
    backgroundColor: colors123.surface,
    fontFamily: fonts.regular,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors123.border,
    borderRadius: radius.md,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 14,

    color: colors123.text,
    fontFamily: fonts.semibold,
  },
});
