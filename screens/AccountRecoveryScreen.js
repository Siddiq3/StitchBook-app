import React, { useState } from 'react';
import { ScrollView, Text, StyleSheet, Linking, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AppButton from '../components/AppButton';
import Reveal from '../components/Reveal';
import { useStitchPro } from '../context/StitchProContext';
import DeleteAccountScreen from './DeleteAccountScreen';
import { colors123, fonts, radius, SHADOWS, spacing } from '../utils/theme';

export default function AccountRecoveryScreen({ message, onRetry }) {
  const [deleting,setDeleting] = useState(false);
  const { logout } = useStitchPro();
  if (deleting) return <DeleteAccountScreen />;
  return <ScrollView contentContainerStyle={styles.container}>
    <Reveal style={styles.card}>
      <View style={styles.iconRing}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="wifi-off" size={34} color={colors123.primary} />
        </View>
      </View>
      <Text accessibilityRole="header" style={styles.title}>We couldn’t connect</Text>
      <Text accessibilityLiveRegion="polite" style={styles.body}>{message}</Text>
      <View style={styles.actions}>
        <AppButton label="Try again" icon="refresh" size="lg" onPress={onRetry} />
        <AppButton label="Sign out" variant="secondary" onPress={logout} />
      </View>
    </Reveal>
    <Reveal index={1} style={styles.footer}>
      <AppButton label="Contact support" icon="email-outline" variant="tertiary" onPress={() => Linking.openURL("mailto:stitchbook3@gmail.com")} />
      {/* Kept reachable for Play's account-deletion rule, but not a primary choice on an error screen */}
      <AppButton label="Delete account" variant="tertiary" size="sm" textStyle={{ color: colors123.danger }} onPress={() => setDeleting(true)} />
    </Reveal>
  </ScrollView>;
}
const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: spacing.md, gap: spacing.md, backgroundColor: colors123.background },
  card: { alignItems: 'stretch', gap: spacing.sm, padding: spacing.lg, borderRadius: radius.xl, backgroundColor: colors123.surface, borderWidth: 1, borderColor: colors123.borderSubtle, ...SHADOWS.md },
  iconRing: { alignSelf: 'center', width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: colors123.primarySoft, marginBottom: spacing.xs },
  iconCircle: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center', backgroundColor: colors123.surface },
  title: { fontFamily: fonts.bold, fontSize: 22, lineHeight: 28, color: colors123.text, textAlign: 'center' },
  body: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, color: colors123.textSecondary, textAlign: 'center' },
  actions: { gap: spacing.sm, marginTop: spacing.sm },
  footer: { alignItems: 'center', gap: spacing.xxs },
});
