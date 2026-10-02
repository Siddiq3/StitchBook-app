import { ListSkeleton } from "../components/SkeletonBlock";
import InlineAlert from "../components/InlineAlert";
import React, { useCallback, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  FlatList,
  RefreshControl } from
'react-native';
import { useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { MotiView } from '../components/AccessibleMotionView';
import AppButton from '../components/AppButton';
import ScreenHeader from '../components/ScreenHeader';
import EmptyState from '../components/EmptyState';
import { useStitchPro } from '../context/StitchProContext';
import { colors123, fonts, radius, spacing } from '../utils/theme';
import { formatDistanceToNow, parseISO } from 'date-fns';import { useLanguage } from "../context/LanguageContext";

function NotificationItem({ notification, onPress, onMarkRead }) {
  const iconMap = {
    order: 'clipboard-text-outline',
    payment: 'cash-multiple',
    delivery: 'truck-delivery-outline',
    trial: 'calendar-outline',
    comment: 'message-outline'
  };

  const getTypeColor = (type) => {
    const colorMap = {
      order: colors123.primary,
      payment: colors123.success,
      delivery: colors123.warning,
      trial: colors123.info,
      comment: colors123.secondary
    };
    return colorMap[type] || colors123.textMuted;
  };

  return (
    <MotiView
      animate={{ opacity: 1, translateY: 0 }}
      from={{ opacity: 0, translateY: 10 }}
      transition={{ duration: 300, type: 'timing' }}>

      <Pressable accessibilityRole="button"
        style={[
        styles.notification,
        !notification.read && styles.notificationUnread]
        }
        onPress={() => {
          if (!notification.read) {
            onMarkRead(notification.id);
          }
          onPress(notification);
        }}>

        <View style={[
        styles.notificationIcon,
        { backgroundColor: getTypeColor(notification.type) + '20' }]
        }>
          <MaterialCommunityIcons
            name={iconMap[notification.type] || 'bell-outline'}
            size={18}
            color={getTypeColor(notification.type)} />

        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.notificationTitle}>
            {notification.title}
          </Text>
          <Text style={styles.notificationBody} numberOfLines={2}>
            {notification.body}
          </Text>
          <Text style={styles.notificationTime}>
            {formatDistanceToNow(parseISO(notification.createdAt), { addSuffix: true })}
          </Text>
        </View>

        {!notification.read &&
        <View style={styles.unreadBadge} />
        }
      </Pressable>
    </MotiView>);

}

export default function NotificationScreen({ navigation }) {const { t } = useLanguage();
  const { notificationsError } = useStitchPro();
  const {
    notifications,
    notificationsLoading,
    notificationCount,
    fetchNotifications,
    markAllRead,
    markNotificationRead
  } = useStitchPro();

  useEffect(() => {
    fetchNotifications();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [fetchNotifications])
  );

  const onRefresh = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  const handleNotificationPress = (notification) => {
    if (notification.orderId) {
      navigation.navigate('OrderDetail', { orderId: notification.orderId });
    }
  };

  const unreadNotifications = notifications.filter((n) => !n.read);

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={
      <RefreshControl
        refreshing={notificationsLoading}
        onRefresh={onRefresh}
        tintColor={colors123.primary} />

      }>

      <ScreenHeader
        title={t("auto_notifications")}
        subtitle={`You have ${notificationCount} unread`} />


<InlineAlert message={notificationsError ? t("loadNotificationsFailed") : null} onRetry={onRefresh} retryLabel={t("retry")} />
      {unreadNotifications.length > 0 &&
      <AppButton
        label={`Mark all ${unreadNotifications.length} as read`}
        onPress={markAllRead}
        variant="secondary"
        style={styles.markAllButton} />

      }

      {notificationsLoading && !notifications.length ? <ListSkeleton /> : notificationsError && !notifications.length ? null : notifications.length === 0 ?
      <EmptyState
        icon="bell-outline"
        title={t("auto_no_notifications")}
        description={t("auto_you_re_all_caught_up_new_order_updates_will_")} /> :

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={{ gap: spacing.sm }}
        renderItem={({ item }) =>
        <NotificationItem
          notification={item}
          onPress={handleNotificationPress}
          onMarkRead={markNotificationRead} />

        } />

      }
    </ScrollView>);

}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
    backgroundColor: colors123.background,
  },
  markAllButton: {
    marginBottom: spacing.md,
  },
  notification: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors123.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors123.borderLight,
  },
  notificationUnread: {
    backgroundColor: colors123.primarySoft,
    borderColor: colors123.borderLight,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  notificationTitle: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors123.text,
    marginBottom: spacing.xs,
  },
  notificationBody: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors123.textMuted,
    marginBottom: spacing.xs,
    lineHeight: 16,
  },
  notificationTime: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors123.textMuted,
  },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors123.primary,
    marginTop: spacing.sm,
  },
});
