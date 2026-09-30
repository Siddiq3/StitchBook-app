import React, { Suspense, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
import SubscriptionScreen from '../screens/SubscriptionScreen';
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
  const { t } = useLanguage();
  const tabLabelMap = {
    Dashboard: t('dashboardTab'),
    Orders: t('ordersTab'),
    Customers: t('customersTab'),
    Settings: t('settingsTab')
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarLabel: tabLabelMap[route.name] || route.name,
        tabBarActiveTintColor: colors123.primary,
        tabBarInactiveTintColor: colors123.textMuted,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: {
          fontSize: normalize(SIZES.xs),
          fontWeight: '600',
          marginBottom: 5
        },
        tabBarIcon: ({ color, focused }) =>
        <View style={[styles.tabIconWrap, focused && styles.tabIconWrapActive]}>
            <MaterialCommunityIcons
            color={focused ? colors123.surface : color}
            name={focused ? iconMap[route.name] : iconOutlineMap[route.name]}
            size={22} />
          
          </View>,

        tabBarStyle: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 66 + insets.bottom,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingHorizontal: 8,
          borderTopWidth: 1,
          borderColor: colors123.borderLight,
          backgroundColor: colors123.surface,
          elevation: 8,
          shadowColor: colors123.text,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 12
        },
        tabBarItemStyle: {
          borderRadius: 12
        }
      })}>
      
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Customers" component={CustomersScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>);

}

export default function MainTabNavigator() {
  const { subscription, subscriptionLoading, fetchSubscription } = useStitchPro();

  useEffect(() => {
    if (!subscription && !subscriptionLoading) {
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

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StudioTabs" component={StudioTabs} />
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
          presentation: 'card'
        }} />
      
      <Stack.Screen
        name="Notifications"
        component={NotificationScreen}
        options={{
          animation: 'slide_from_right',
          presentation: 'card'
        }} />
      
      <Stack.Screen
        name="Subscription"
        component={SubscriptionScreen}
        options={{
          animation: 'slide_from_right',
          presentation: 'card'
        }} />
      
    </Stack.Navigator>);

}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors123.background
  },
  tabIconWrap: {
    width: 40,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabIconWrapActive: {
    backgroundColor: colors123.primary
  }
});
