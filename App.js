import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useFonts } from "expo-font";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { StitchProProvider } from "./context/StitchProContext";
import { LanguageProvider } from "./context/LanguageContext";
import { ToastProvider } from "./context/ToastContext";
import StitchProNavigator from "./navigation/StitchProNavigator";
import { colors123 } from "./utils/theme";

export default function StitchProApp() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    });

  const appBackground = colors123?.background ?? '#F8FAFC';

  useEffect(() => {
    if (colors123?.background) {
      SystemUI.setBackgroundColorAsync(colors123.background).catch(() => {});
    }
  }, []);

  if (!fontsLoaded) {
    return <View accessible accessibilityLabel="Loading StitchBook" accessibilityState={{ busy: true }} style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: appBackground }}><ActivityIndicator color={colors123.primary} /></View>;
  }

  return (
    <GestureHandlerRootView
      style={{ flex: 1, backgroundColor: appBackground }}
    >
      <SafeAreaProvider>
        <LanguageProvider>
          <ToastProvider>
            <StitchProProvider>
              <StatusBar style="dark" />
              <StitchProNavigator />
            </StitchProProvider>
          </ToastProvider>
        </LanguageProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
