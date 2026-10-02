import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { MotiView } from '../components/AccessibleMotionView';
import { colors123 } from '../utils/theme';

const machineLogo = require('../assets/splash-machine.png');
const wordmarkLogo = require('../assets/splash-wordmark.png');

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <MotiView
        animate={{ opacity: 1, scale: 1, translateY: -6 }}
        from={{ opacity: 0, scale: 1, translateY: 8 }}
        transition={{ type: 'timing', delay: 120, duration: 200 }}
        style={styles.machineWrap}
      >
        <Image source={machineLogo} resizeMode="contain" style={styles.machineLogo} />
        <MotiView
          animate={{ opacity: 1, scaleX: 1 }}
          from={{ opacity: 0, scaleX: 0.25 }}
          transition={{ type: 'timing', delay: 680, duration: 200 }}
          style={styles.stitchLine}
        />
      </MotiView>

      <MotiView
        animate={{ opacity: 1, scale: 1, translateY: 0 }}
        from={{ opacity: 0, scale: 0.96, translateY: 14 }}
        transition={{ type: 'timing', delay: 980, duration: 200 }}
        style={styles.wordmarkWrap}
      >
        <Image source={wordmarkLogo} resizeMode="contain" style={styles.wordmarkLogo} />
      </MotiView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: colors123.background,
  },
  machineWrap: {
    width: 210,
    height: 210,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 28,
    backgroundColor: colors123.surface,
    shadowColor: colors123.primary,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0,
    shadowRadius: 28,
    elevation: 0,
  },
  machineLogo: {
    width: 174,
    height: 174,
  },
  stitchLine: {
    position: "absolute",
    bottom: 22,
    width: 92,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors123.accent,
  },
  wordmarkWrap: {
    width: "100%",
    maxWidth: 320,
    height: 78,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  wordmarkLogo: {
    width: "100%",
    height: "100%",
  },
});
