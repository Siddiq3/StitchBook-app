import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  StyleSheet,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { colors123, fonts, radius, spacing, shadows } from '../utils/theme';
import { useLanguage } from '../context/LanguageContext';

const createStyles = (colors123, fonts, radius, spacing) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors123.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,

    color: colors123.text,
    marginBottom: spacing.sm,
    fontFamily: fonts.bold,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: colors123.textMuted,
    fontFamily: fonts.regular,
  },
  languageList: {
    gap: 0,
    backgroundColor: colors123.surface,
    borderRadius: radius.md,
    overflow: "hidden",
    ...shadows.card,
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 56,
    borderRadius: 0,
    borderWidth: 0,
    borderColor: colors123.borderLight,
    backgroundColor: colors123.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors123.borderLight,
  },
  languageOptionSelected: {
    borderColor: colors123.primary,
    backgroundColor: colors123.primarySoft,
  },
  radioContainer: {
    marginRight: spacing.md,
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
  languageTextContainer: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    color: colors123.text,
    fontFamily: fonts.medium,
  },
  languageNameSelected: {
    color: colors123.primary,
    fontFamily: fonts.semibold,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
  },
  continueButton: {
    flexDirection: "row",
    backgroundColor: colors123.primary,
    minHeight: 48,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
  },
  continueButtonText: {
    fontSize: 14,
    color: colors123.surface,
    fontFamily: fonts.semibold,
  },
  continueButtonIcon: {
    marginLeft: spacing.sm,
  },
});

export default function LanguageSelectionScreen({ navigation }) {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const { selectLanguage, t, supportedLanguages } = useLanguage();
  const styles = useMemo(() => createStyles(colors123, fonts, radius, spacing), []);

  const handleContinue = async () => {
    await selectLanguage(selectedLanguage);
    // Navigator will automatically switch to LoginScreen when isLanguageSelected becomes true
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('selectLanguage')}</Text>
          <Text style={styles.subtitle}>{t('choosePreferredLanguage')}</Text>
        </View>

        <View style={styles.languageList}>
          {supportedLanguages.map((lang) => (
            <TouchableOpacity accessibilityRole="button" accessibilityState={{ selected: Boolean(selectedLanguage === lang.code) }}
              key={lang.code}
              style={[
                styles.languageOption,
                selectedLanguage === lang.code && styles.languageOptionSelected,
              ]}
              onPress={() => setSelectedLanguage(lang.code)}
              activeOpacity={0.7}
            >
              <View style={styles.radioContainer}>
                <View
                  style={[
                    styles.radioOuter,
                    selectedLanguage === lang.code && styles.radioOuterSelected,
                  ]}
                >
                  {selectedLanguage === lang.code && (
                    <View style={styles.radioInner} />
                  )}
                </View>
              </View>

              <View style={styles.languageTextContainer}>
                <Text
                  style={[
                    styles.languageName,
                    selectedLanguage === lang.code && styles.languageNameSelected,
                  ]}
                >
                  {lang.nativeLabel}
                </Text>
              </View>

              {selectedLanguage === lang.code && (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={24}
                  color={colors123.primary}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity accessibilityRole="button"
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>{t('continue')}</Text>
          <MaterialCommunityIcons
            name="arrow-right"
            size={20}
            color={colors123.surface}
            style={styles.continueButtonIcon}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
