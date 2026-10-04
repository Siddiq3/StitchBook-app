import React, { useState } from 'react';
import { ScrollView, Text, StyleSheet, Linking } from 'react-native';
import AppButton from '../components/AppButton';
import { useStitchPro } from '../context/StitchProContext';
import DeleteAccountScreen from './DeleteAccountScreen';
import { colors123, fonts, spacing } from '../utils/theme';

export default function AccountRecoveryScreen({ message, onRetry }) {
  const [deleting,setDeleting] = useState(false);
  const { logout } = useStitchPro();
  if (deleting) return <DeleteAccountScreen />;
  return <ScrollView contentContainerStyle={styles.container}>
    <Text accessibilityRole="header" style={styles.title}>We couldn’t connect</Text>
    <Text accessibilityLiveRegion="polite" style={styles.body}>{message}</Text>
    <AppButton label="Try again" onPress={onRetry} />
    <AppButton label="Sign out" variant="secondary" onPress={logout} />
    <AppButton label="Contact support" variant="ghost" onPress={() => Linking.openURL("mailto:stitchbook3@gmail.com")} />
    {/* Kept reachable for Play's account-deletion rule, but not a primary choice on an error screen */}
    <AppButton label="Delete account" variant="tertiary" size="sm" textStyle={{ color: colors123.danger }} onPress={() => setDeleting(true)} />
  </ScrollView>;
}
const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: spacing.md, gap: spacing.sm, backgroundColor: colors123.background },
  title: { fontFamily: fonts.bold, fontSize: 22, lineHeight: 28, color: colors123.text },
  body: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, color: colors123.textSecondary },
});
