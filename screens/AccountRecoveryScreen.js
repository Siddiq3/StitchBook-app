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
    <AppButton label="Delete account" variant="danger" onPress={() => setDeleting(true)} />
    <AppButton label="Contact support" variant="ghost" onPress={() => Linking.openURL("mailto:stitchbook3@gmail.com")} />
  </ScrollView>;
}
const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: spacing.md, gap: spacing.sm, backgroundColor: colors123.background },
  title: { fontFamily: fonts.bold, fontSize: 22, lineHeight: 28, color: colors123.text },
  body: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, color: colors123.textSecondary },
});
