import AccountRecoveryScreen from '../screens/AccountRecoveryScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useStitchPro } from '../context/StitchProContext';
import { useLanguage } from '../context/LanguageContext';
import { navigationTheme } from '../utils/theme';

// ── Pre-auth screens (no navigation needed) ──
import SplashScreen           from '../screens/SplashScreen';
import LoginScreen            from '../screens/LoginScreen';
import RegisterScreen         from '../screens/RegisterScreen';
import ForgotPasswordScreen   from '../screens/ForgotPasswordScreen';
import OnboardingScreen       from '../screens/OnboardingScreen';

// ── Main app (has its own NavigationContainer + tabs) ──
import MainTabNavigator    from './MainTabNavigator';

const AuthStack = createNativeStackNavigator();

const StitchProNavigator = () => {
  const [isSplashReady, setIsSplashReady] = useState(false);
  const {
    isBooting,
    isAuthenticated,
    shop,
    shopError,
    retryShop,
    retryBoot,
    authError,
  } = useStitchPro();

  const {
    isLanguageLoading,
  } = useLanguage();

  const activeTheme = navigationTheme;

  useEffect(() => {
    const timer = setTimeout(() => setIsSplashReady(true), 2400);
    return () => clearTimeout(timer);
  }, []);

  // 1. Wait for both context + language to load from AsyncStorage
  if (isBooting || isLanguageLoading || !isSplashReady) {
    return (
      <NavigationContainer theme={activeTheme}>
        <SplashScreen />
      </NavigationContainer>
    );
  }

  if (shopError || (!isAuthenticated && authError)) {
    return <AccountRecoveryScreen message={shopError || authError} onRetry={shopError ? retryShop : retryBoot} />;
  }

  // 2. Not logged in → show pre-auth flow
  if (!isAuthenticated) {
    return (
      <NavigationContainer theme={activeTheme}>
        <AuthStack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
          <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
          <AuthStack.Screen name="Login" component={LoginScreen} />
          <AuthStack.Screen name="Register" component={RegisterScreen} />
          <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </AuthStack.Navigator>
      </NavigationContainer>
    );
  }

  // 3. Logged in, no shop → onboarding
  if (!shop) {
    return (
      <NavigationContainer theme={activeTheme}>
        <OnboardingScreen />
      </NavigationContainer>
    );
  }

  // 4. Fully ready → main app with tabs
  return (
    <NavigationContainer theme={activeTheme}>
      <MainTabNavigator />
    </NavigationContainer>
  );
};

export default StitchProNavigator;
