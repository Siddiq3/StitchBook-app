import SessionsScreen from '../screens/SessionsScreen';
import DeleteAccountScreen from '../screens/DeleteAccountScreen';
import PasswordScreen from '../screens/PasswordScreen';
import AccountRecoveryScreen from '../screens/AccountRecoveryScreen';
import RecordMeasurementScreen from "../screens/RecordMeasurementScreen";
import ViewMeasurementsScreen from "../screens/ViewMeasurementsScreen";
import MeasurementsScreen from "../screens/MeasurementsScreen";
import ReportsScreen from "../screens/ReportsScreen";
import { fonts } from "../utils/theme";
import React, { Suspense, useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import DashboardScreen from '../screens/DashboardScreen';
import CustomersScreen from '../screens/CustomersScreen';
import OrdersScreen from '../screens/OrdersScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CustomerDetailScreen from '../screens/CustomerDetailScreen';
import CustomerSelectionScreen from '../screens/CustomerSelectionScreen';
// Lazy load CreateOrder to prevent module loading issues with StitchOptionsSheet
const CreateOrder = React.lazy(() => import('../screens/CreateOrder'));
import OrderDetail from '../screens/OrderDetail';
import StaffScreen from '../screens/StaffScreen';
import NotificationScreen from '../screens/NotificationScreen';
import { useStitchPro } from '../context/StitchProContext';
import { useLanguage } from '../context/LanguageContext';

import { colors123, SIZES, normalize } from '../utils/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const iconMap = {
  Dashboard: 'home',
  Customers: 'account-group',
  Orders: 'clipboard-list',
  Settings: 'cog'
};

const iconOutlineMap = {
  Dashboard: 'home-outline',
  Customers: 'account-group-outline',
  Orders: 'clipboard-list-outline',
  Settings: 'cog-outline'
};

// Fallback for lazy-loaded components
const LazyFallback = () =>
<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color={colors123.primary} />
  </View>;

function StudioTabs() {
  const insets = useSafeAreaInsets();
  const { can } = useStitchPro();
  const { t } = useLanguage();
  const tabLabelMap = {
    Dashboard: t('dashboardTab'),
    Orders: t('ordersTab'),
    Customers: t('customersTab'),
    Settings: t('settingsTab')
  };

  return (
    <View style={{ flex: 1 }}>
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarLabel: tabLabelMap[route.name] || route.name,
        tabBarActiveTintColor: colors123.primary,
        tabBarInactiveTintColor: colors123.textMuted,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: {
          fontSize: normalize(SIZES.xs),
          fontFamily: fonts.medium,
          marginBottom: 2
        },
        tabBarIcon: ({ color, focused }) =>
          <View style={[styles.tabIconWrap, focused && styles.tabIconWrapActive]}>
            <MaterialCommunityIcons
              color={color}
              name={focused ? iconMap[route.name] : iconOutlineMap[route.name]}
              size={22}
            />
          </View>,

        tabBarStyle: {
          height: 64 + insets.bottom,
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 6),
          paddingHorizontal: 8,
          borderTopWidth: 1,
          borderColor: colors123.borderLight,
          backgroundColor: colors123.surface,
          elevation: 0,
          shadowColor: colors123.text,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0,
          shadowRadius: 12
        },
        tabBarItemStyle: {
          borderRadius: 12
        }
      })}>

      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      {can("customers:read") && <Tab.Screen name="Customers" component={CustomersScreen} />}
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
    {/* Edge-to-edge: keep scrolled content from showing through the status bar */}
    <View pointerEvents="none" style={[styles.statusBarScrim, { height: insets.top }]} />
    </View>);

}

export default function MainTabNavigator() {
  const { subscription, subscriptionLoading, subscriptionState, fetchSubscription } = useStitchPro();
  const requestedSubscription = useRef(false);

  useEffect(() => {
    if (!requestedSubscription.current && !subscription && !subscriptionLoading) {
      requestedSubscription.current = true;
      fetchSubscription().catch((err) => {

      });
    }
  }, [fetchSubscription, subscription, subscriptionLoading]);

  if (subscriptionLoading && !subscription) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={colors123.primary} />
      </View>);

  }

  if (subscriptionState === "error") {
    return <AccountRecoveryScreen message="Could not check your account status. Your shop data is safe." onRetry={() => fetchSubscription().catch(() => {})} />;
  }

  return (
    <Stack.Navigator initialRouteName="StudioTabs" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Sessions" component={SessionsScreen} options={{headerShown:true,title:"Devices and sessions"}} />
      <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} options={{headerShown:true,title:"Delete account"}} />
      <Stack.Screen name="Password" component={PasswordScreen} options={{headerShown:true,title:"Password & security",headerTintColor:colors123.primary,headerTitleStyle:{fontFamily:fonts.semibold,color:colors123.text}}} />
      <Stack.Screen name="StudioTabs" component={StudioTabs} />
      <Stack.Screen name="RecordMeasurement" component={RecordMeasurementScreen} options={{ headerShown: true, title: 'Record measurement', headerTintColor: colors123.primary, headerTitleStyle: { fontFamily: fonts.semibold, color: colors123.text } }} />
      <Stack.Screen name="ViewMeasurements" component={ViewMeasurementsScreen} options={{ headerShown: true, title: 'Measurement history', headerTintColor: colors123.primary, headerTitleStyle: { fontFamily: fonts.semibold, color: colors123.text } }} />
      <Stack.Screen name="Reports" component={ReportsScreen} options={{ headerShown: true, title: 'Reports', headerTintColor: colors123.primary, headerTitleStyle: { fontFamily: fonts.semibold, color: colors123.text } }} />
      <Stack.Screen name="Measurements" component={MeasurementsScreen} options={{ headerShown: true, title: 'Measurements', headerTintColor: colors123.primary, headerTitleStyle: { fontFamily: fonts.semibold, color: colors123.text } }} />
      <Stack.Screen
        name="CustomerDetail"
        component={CustomerDetailScreen}
        options={{ animation: 'slide_from_right' }} />

      <Stack.Screen
        name="CustomerSelection"
        component={CustomerSelectionScreen}
        options={{ animation: 'slide_from_right' }} />

      <Stack.Screen
        name="CreateOrder"
        options={{ animation: 'slide_from_right' }}>

        {(props) =>
        <Suspense fallback={<LazyFallback />}>
            <CreateOrder {...props} />
          </Suspense>
        }
      </Stack.Screen>
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetail}
        options={{ animation: 'slide_from_right' }} />

      <Stack.Screen
        name="Staff"
        component={StaffScreen}
        options={{
          animation: 'slide_from_right',
          presentation: 'card', headerShown: true, headerTintColor: colors123.primary, headerTitleStyle: { fontFamily: fonts.semibold, color: colors123.text }
        }} />

      <Stack.Screen
        name="Notifications"
        component={NotificationScreen}
        options={{
          animation: 'slide_from_right',
          presentation: 'card', headerShown: true, headerTintColor: colors123.primary, headerTitleStyle: { fontFamily: fonts.semibold, color: colors123.text }
        }} />


    </Stack.Navigator>);

}

const styles = StyleSheet.create({
  statusBarScrim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors123.background,
  },
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors123.background,
  },
  tabIconWrap: {
    minWidth: 40,
    height: 30,
    paddingHorizontal: 9,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  tabIconWrapActive: {
    backgroundColor: colors123.primarySoft,
  },
});
