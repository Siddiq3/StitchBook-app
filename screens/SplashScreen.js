import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLanguage } from '../context/LanguageContext';
import { colors123, fonts, spacing } from '../utils/theme';

const machineLogo = require('../assets/splash-machine.png');
const wordmarkLogo = require('../assets/splash-wordmark.png');

const FABRIC_W = 220;
const STITCHES = 13;
const PASS_MS = 2200;

// Shown while the app restores the session and loads the shop. A needle keeps
// stitching across a strip of fabric so a slow network reads as progress, not a
// freeze, and the line under it says what is happening the longer it takes.
export default function SplashScreen() {
  const { t } = useLanguage();
  const reducedMotion = useReducedMotion();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const progress = useSharedValue(reducedMotion ? 1 : 0);
  const bob = useSharedValue(0);
  useEffect(() => {
    if (reducedMotion) return;
    progress.value = withRepeat(withTiming(1, { duration: PASS_MS, easing: Easing.inOut(Easing.quad) }), -1, false);
    bob.value = withRepeat(
      withSequence(withTiming(1, { duration: 140 }), withTiming(0, { duration: 140 })),
      -1,
      false,
    );
  }, [reducedMotion, progress, bob]);

  const sewnStyle = useAnimatedStyle(() => ({ width: progress.value * FABRIC_W }));
  const needleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * FABRIC_W - 11 }, { translateY: bob.value * 7 }],
  }));

  const status = elapsed >= 8 ? t('loaderSlow') : elapsed >= 3 ? t('loaderFetching') : t('loaderOpening');

  return (
    <View style={styles.container} accessible accessibilityRole="progressbar" accessibilityLabel={`${t('loaderTagline')}. ${status}`}>
      <Image source={machineLogo} resizeMode="contain" style={styles.machine} />

      <View style={styles.fabricWrap} importantForAccessibility="no-hide-descendants">
        <View style={styles.fabric}>
          <View style={styles.guide}>
            {Array.from({ length: STITCHES }).map((_, i) => <View key={i} style={styles.guideDash} />)}
          </View>
          <Animated.View style={[styles.sewn, sewnStyle]}>
            <View style={styles.thread}>
              {Array.from({ length: STITCHES }).map((_, i) => <View key={i} style={styles.stitch} />)}
            </View>
          </Animated.View>
        </View>
        {!reducedMotion ? (
          <Animated.View style={[styles.needle, needleStyle]}>
            <MaterialCommunityIcons name="needle" size={22} color={colors123.text} style={{ transform: [{ rotate: '135deg' }] }} />
          </Animated.View>
        ) : null}
      </View>

      <Image source={wordmarkLogo} resizeMode="contain" style={styles.wordmark} />
      <Text style={styles.tagline}>{t('loaderTagline')}</Text>
      <Text accessibilityLiveRegion="polite" style={styles.status}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: colors123.surface,
  },
  machine: { width: 132, height: 132 },
  fabricWrap: { width: FABRIC_W, height: 40, marginTop: spacing.sm, justifyContent: 'center' },
  fabric: {
    width: FABRIC_W,
    height: 22,
    borderRadius: 6,
    backgroundColor: colors123.primarySoft,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  guide: { position: 'absolute', left: 8, right: 8, flexDirection: 'row', justifyContent: 'space-between' },
  guideDash: { width: 9, height: 2, borderRadius: 1, backgroundColor: 'rgba(0,127,255,0.18)' },
  sewn: { position: 'absolute', left: 0, top: 0, bottom: 0, overflow: 'hidden', justifyContent: 'center' },
  thread: { width: FABRIC_W, paddingHorizontal: 8, flexDirection: 'row', justifyContent: 'space-between' },
  stitch: { width: 9, height: 3, borderRadius: 1.5, backgroundColor: colors123.primary },
  needle: { position: 'absolute', left: 0, top: -6 },
  wordmark: { width: '100%', maxWidth: 260, height: 52, marginTop: spacing.md },
  tagline: { marginTop: spacing.xs, fontFamily: fonts.semibold, fontSize: 15, color: colors123.primary, textAlign: 'center' },
  status: { marginTop: spacing.sm, fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors123.textMuted, textAlign: 'center', maxWidth: 280, minHeight: 38 },
});
