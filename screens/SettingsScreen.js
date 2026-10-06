import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors123, spacing, fonts, radius, shadows } from '../utils/theme';
import ScreenHeader from '../components/ScreenHeader';
import ListRow from '../components/ListRow';
import AppButton from '../components/AppButton';
import { useLanguage } from '../context/LanguageContext';
import { useStitchPro } from '../context/StitchProContext';
import { useToast } from '../context/ToastContext';
import { getAccountStatusText } from '../utils/accountStatus';
import { formatPhone } from '../utils/formHelpers';
import { PRIVACY_URL, TERMS_URL, openLink } from '../utils/legalLinks';
import { languages } from '../localization/translations';

export default function SettingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { t, language, selectLanguage } = useLanguage();
  const { user, shop, logout, updateShop, subscription, can, isOwner } = useStitchPro();
  const hasStaffManagement = Boolean(subscription?.features?.hasStaffManagement);
  const { showToast } = useToast();
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [shopEditModalVisible, setShopEditModalVisible] = useState(false);
  const [shopForm, setShopForm] = useState({
    name: shop?.name || '',
    phone: shop?.phone || '',
    location: shop?.location || ''
  });
  const [isUpdatingShop, setIsUpdatingShop] = useState(false);

  useEffect(() => {
    setShopForm({
      name: shop?.name || '',
      phone: shop?.phone || '',
      location: shop?.location || ''
    });
  }, [shop]);

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

  // The badge sits next to the user's name, so use their initials
  const shopInitials = (user?.name || shop?.name || 'S').split(' ').filter(Boolean).map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.container}>
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
            {can('shop:write') &&
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={t('editShopDetails')}
              style={styles.editButton}
              onPress={() => setShopEditModalVisible(true)}>

              <MaterialCommunityIcons
                name="pencil"
                size={20}
                color={colors123.text} />

            </TouchableOpacity>
            }
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
                    <Text style={styles.shopInfoValue}>{formatPhone(shop.phone)}</Text>
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

        {/* Everyday shop tools first, account housekeeping last */}
        <View style={styles.groupCard}>
          <Text style={styles.groupTitle}>{t("shop")}</Text>
          {[
            can("staff:read") && hasStaffManagement && { key: "staff", title: t("staffManagement"), icon: "account-multiple-outline", onPress: () => navigation.navigate("Staff") },
            can("measurements:read") && { key: "measurements", title: t("measurements"), icon: "ruler", onPress: () => navigation.navigate("Measurements") },
            { key: "notifications", title: t("notifications"), icon: "bell-outline", onPress: () => navigation.navigate("Notifications") },
          ].filter(Boolean).map(item => <ListRow key={item.key} title={item.title}
            leading={<MaterialCommunityIcons name={item.icon} size={20} color={colors123.textSecondary} />}
            trailing={<MaterialCommunityIcons name="chevron-right" size={20} color={colors123.textMuted} />}
            onPress={item.onPress} />)}
        </View>

        <View style={styles.groupCard}>
          <Text style={styles.groupTitle}>{t("account")}</Text>
          {isOwner &&
          <ListRow title={t("accountStatus")} meta={getAccountStatusText(subscription, t) || "—"}
            leading={<MaterialCommunityIcons name="shield-check-outline" size={20} color={colors123.textSecondary} />} />
          }
          {[
            { key: "password", title: t("passwordSecurity"), icon: "lock-outline", onPress: () => navigation.navigate("Password") },
            { key: "sessions", title: t("devicesSessions"), icon: "devices", onPress: () => navigation.navigate("Sessions") },
            { key: "privacy", title: t("privacyPolicy"), icon: "shield-lock-outline", onPress: () => openLink(PRIVACY_URL) },
            { key: "terms", title: t("termsOfService"), icon: "file-document-outline", onPress: () => openLink(TERMS_URL) },
            { key: "delete", title: t("deleteAccount"), icon: "delete-outline", onPress: () => navigation.navigate("DeleteAccount") },
          ].map(item => <ListRow key={item.key} title={item.title}
            leading={<MaterialCommunityIcons name={item.icon} size={20} color={colors123.textSecondary} />}
            trailing={<MaterialCommunityIcons name="chevron-right" size={20} color={colors123.textMuted} />}
            onPress={item.onPress} />)}
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

    </SafeAreaView>);

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors123.background,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  headerWrap: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    backgroundColor: colors123.background,
  },
  groupCard: { marginTop: spacing.md, marginHorizontal: spacing.md, paddingHorizontal: spacing.md, paddingTop: spacing.sm, backgroundColor: colors123.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors123.borderSubtle, ...shadows.card },
  groupTitle: { fontSize: 14, color: colors123.textMuted, fontFamily: fonts.semibold, paddingTop: spacing.xs },
  profileSection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.md,
    backgroundColor: colors123.surface,
    borderWidth: 1,
    borderColor: colors123.borderSubtle,
    borderRadius: radius.md,
    ...shadows.card,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  profileImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
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
    backgroundColor: "transparent",
    borderRadius: radius.md,
    borderWidth: 0,
    borderColor: colors123.borderLight,
    gap: spacing.sm,
    paddingHorizontal: 0,
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
    marginTop: spacing.md,
    marginHorizontal: spacing.md,
    backgroundColor: colors123.surface,
    borderRadius: radius.md,
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
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors123.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors123.borderLight,
    gap: spacing.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
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
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 14,

    color: colors123.textMuted,
    fontFamily: fonts.semibold,
    marginBottom: spacing.sm,
  },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors123.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors123.borderSubtle,
    gap: spacing.md,
    ...shadows.card,
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
    backgroundColor: colors123.dangerSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    gap: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
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
