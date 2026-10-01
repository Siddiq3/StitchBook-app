import InlineAlert from "../components/InlineAlert";
import React, { useEffect, useMemo } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  AppState } from
'react-native';
import { format, parseISO } from 'date-fns';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { MotiView } from '../components/AccessibleMotionView';
import { useStitchPro } from '../context/StitchProContext';
import { useToast } from '../context/ToastContext';
import ScreenHeader from '../components/ScreenHeader';
import AppButton from '../components/AppButton';
import { colors123, fonts, radius, spacing, shadows } from '../utils/theme';import { useLanguage } from "../context/LanguageContext";

const PLAN_FEATURES = [
'Order Management',
'Record Measurements',
'Customer Management',
'Work Flow Management',
'Digital Portfolio',
'Business Dashboard',
'Payment Tracking',
'Bill Sharing',
'Custom Billing',
'Custom Measurement',
'Multi-Language Support',
'Fiza AI Assistant'];

const PLAN_TYPE_LABEL = {
  free: 'Free Plan',
  trial: 'Free Trial',
  expired: 'Trial Expired',
  basic: 'Basic Plan',
  team: 'Team Plan',
  pro: 'Pro Plan',
  premium: 'Pro Plan',
  enterprise: 'Enterprise Plan'
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const toDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getTrialMeta = (subscriptionData = {}) => {
  subscriptionData = subscriptionData || {};
  const startDate = toDate(subscriptionData.trialStartDate || subscriptionData.startDate);
  const endDate = toDate(subscriptionData.trialEndDate || subscriptionData.endDate);
  const fallbackTotal = startDate && endDate ?
  Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / MS_PER_DAY)) :
  10;
  const totalDays = Math.max(1, Number(subscriptionData.trialDaysTotal || fallbackTotal));
  const remainingDays = Math.max(0, Number(
    subscriptionData.trialDaysRemaining ?? subscriptionData.daysRemaining ?? 0
  ));
  const usedDays = Math.min(totalDays, Math.max(0, totalDays - remainingDays));
  const progress = Math.min(1, Math.max(0, usedDays / totalDays));

  return {
    startDate,
    endDate,
    totalDays,
    remainingDays,
    usedDays,
    progress,
    progressPercent: Math.round(progress * 100)
  };
};

const getTrialTone = (remainingDays) => {
  if (remainingDays <= 2) return 'ending';
  if (remainingDays <= 5) return 'attention';
  return 'healthy';
};

const buildFeatureRows = (features = {}) => [
{
  key: 'maxOrders',
  label: `Order Management${features.maxOrders ? ` (${features.maxOrders})` : ''}`,
  active: !!features.maxOrders
},
{
  key: 'maxCustomers',
  label: `Customer Management${features.maxCustomers ? ` (${features.maxCustomers})` : ''}`,
  active: !!features.maxCustomers
},
{
  key: 'maxStaff',
  label: `Staff Users${features.maxStaff > 0 ? ` (${features.maxStaff})` : ' (Owner only)'}`,
  active: features.maxStaff !== undefined ? features.maxStaff > 0 : !!features.hasStaffManagement
},
{
  key: 'hasPortfolio',
  label: 'Digital Portfolio',
  active: !!features.hasPortfolio
},
{
  key: 'hasReports',
  label: 'Business Dashboard',
  active: !!features.hasReports
},
{
  key: 'hasStaffManagement',
  label: 'Staff Management',
  active: !!features.hasStaffManagement
}];

const formatDate = (value) => {
  if (!value) return '-';
  try {
    return format(parseISO(value), 'dd MMM yyyy');
  } catch {
    return value;
  }
};

const SubscriptionScreen = () => {const { t } = useLanguage();
  const { subscriptionError } = useStitchPro();
  const {
    subscription,
    subscriptionLoading,
    fetchSubscription
  } = useStitchPro();
  const { showToast } = useToast();
  const styles = getSubscriptionStyles(); // Get styles from lazy-evaluated cache

  useEffect(() => {
    fetchSubscription().catch((err) => {

    });
  }, [fetchSubscription]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        fetchSubscription().catch((err) => {

        });
      }
    });

    return () => subscription.remove();
  }, [fetchSubscription]);

  const subscriptionData = subscription;
  const isTrial = subscriptionData?.status === 'trial' && subscriptionData?.isActive;
  const isActive = subscriptionData?.status === 'active' && subscriptionData?.isActive;
  const isTrialExpired = subscriptionData?.status === 'trial_expired';
  const isInactive = !subscriptionData || !subscriptionData?.isActive || ['inactive', 'cancelled', 'expired', 'trial_expired'].includes(subscriptionData?.status);
  const trialMeta = useMemo(() => getTrialMeta(subscriptionData), [subscriptionData]);
  const trialTone = getTrialTone(trialMeta.remainingDays);

  const trialText = useMemo(() => {
    if (!subscriptionData) return '';
    if (trialMeta.remainingDays > 0) {
      return `${trialMeta.remainingDays} day${trialMeta.remainingDays === 1 ? '' : 's'} left in your free trial`;
    }
    return 'Your free trial has ended';
  }, [subscriptionData, trialMeta.remainingDays]);

  const activePlanName = subscriptionData?.planType ?
  PLAN_TYPE_LABEL[subscriptionData.planType] || subscriptionData.planType :
  'Basic Plan';
  const heroMeta = useMemo(() => {
    if (isActive) {
      return {
        eyebrow: 'Plan active',
        title: activePlanName,
        description: `${subscriptionData?.daysRemaining ?? '-'} days remaining. Your shop tools are unlocked.`,
        icon: 'check-decagram-outline'
      };
    }

    if (isTrial) {
      return {
        eyebrow: 'Free trial',
        title: trialText,
        description: t("subscriptionTrialDescription"),
        icon: 'timer-sand'
      };
    }

    if (isTrialExpired) {
      return {
        eyebrow: 'Action needed',
        title: 'Trial completed',
        description: t("subscriptionInactiveDescription"),
        icon: 'lock-alert-outline'
      };
    }

    return {
      eyebrow: 'Subscription',
      title: 'Subscription status',
      description: t("subscriptionDefaultDescription"),
      icon: 'shield-lock-outline'
    };
  }, [
  activePlanName,
  isActive,
  isTrial,
  isTrialExpired,
  subscriptionData?.daysRemaining,
  t,
  trialText]
  );

  const featureRows = useMemo(() => buildFeatureRows(subscriptionData?.features), [subscriptionData]);

  const handleRefreshStatus = async () => {
    try {
      await fetchSubscription();
      showToast(t("auto_subscription_status_refreshed"), 'success');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Unable to refresh subscription';
      showToast(message, 'error');
    }
  };

  const renderFeatureItem = (label, active) =>
  <View key={label} style={styles.featureTile}>
      <MaterialCommunityIcons
      name={active ? 'check-circle' : 'circle-outline'}
      size={18}
      color={active ? colors123.success : colors123.textSoft} />

      <Text style={[styles.featureLabel, !active && styles.featureLabelInactive]}>{label}</Text>
    </View>;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}>

      <ScreenHeader
        eyebrow="Account"
        title={t("auto_subscription")}
        subtitle={t("subscriptionScreenSubtitle")} />


      <InlineAlert message={subscriptionError ? t("loadSubscriptionFailed") : null} onRetry={handleRefreshStatus} retryLabel={t("retry")} />
      {subscriptionLoading && !subscriptionData ?
      <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors123.primary} size="large" />
        </View> :
      null}

      {(subscriptionData || (!subscriptionLoading && !subscriptionError)) ? (
      <MotiView
        animate={{ opacity: 1, translateY: 0 }}
        from={{ opacity: 0, translateY: 12 }}
        transition={{ duration: 300, type: 'timing' }}>

        <View



          style={[styles.heroCard, { backgroundColor: colors123.primary }]}>

          <View style={styles.heroTopRow}>
            <View style={styles.heroIcon}>
              <MaterialCommunityIcons name={heroMeta.icon} size={25} color={colors123.surface} />
            </View>
            <TouchableOpacity accessibilityRole="button" onPress={handleRefreshStatus} style={styles.heroRefreshButton}>
              <MaterialCommunityIcons name="refresh" size={15} color={colors123.surface} />
              <Text style={styles.heroRefreshText}>{t("auto_refresh")}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.heroEyebrow}>{heroMeta.eyebrow}</Text>
          <Text style={styles.heroTitle}>{heroMeta.title}</Text>
          <Text style={styles.heroDescription}>{heroMeta.description}</Text>
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>{t("auto_plan")}</Text>
              <Text style={styles.heroStatValue}>{isTrial ? t("freeTrial") : activePlanName}</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>{t("auto_days_remaining")}</Text>
              <Text style={styles.heroStatValue}>{isActive ? subscriptionData?.daysRemaining ?? '-' : isTrial ? trialMeta.remainingDays : 0}</Text>
            </View>
          </View>
        </View>
      </MotiView>
      ) : null}

      {isTrial ?
      <MotiView
        animate={{ opacity: 1, translateY: 0 }}
        from={{ opacity: 0, translateY: 12 }}
        transition={{ delay: 60, duration: 280, type: 'timing' }}
        style={styles.trialStatusCard}>

          <View style={styles.trialStatusHeader}>
            <View style={[
          styles.trialStatusIcon,
          trialTone === 'ending' && styles.trialStatusIconEnding,
          trialTone === 'attention' && styles.trialStatusIconAttention]
          }>
              <MaterialCommunityIcons
              name="calendar-clock-outline"
              size={24}
              color={trialTone === 'ending' ? colors123.error : colors123.primary} />

            </View>
            <View style={styles.trialStatusCopy}>
              <Text style={styles.trialStatusEyebrow}>{t("auto_free_trial_active")}</Text>
              <Text style={styles.trialStatusTitle}>{trialText}</Text>
            </View>
            <TouchableOpacity accessibilityRole="button" onPress={handleRefreshStatus} style={styles.refreshPill}>
              <MaterialCommunityIcons name="refresh" size={15} color={colors123.primary} />
              <Text style={styles.refreshPillText}>{t("auto_refresh")}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.trialProgressTrack}>
            <View style={[
          styles.trialProgressFill,
          { width: `${Math.max(4, trialMeta.progressPercent)}%` },
          trialTone === 'ending' && styles.trialProgressFillEnding,
          trialTone === 'attention' && styles.trialProgressFillAttention]
          } />
          </View>

          <View style={styles.trialMetaGrid}>
            <View style={styles.trialMetaItem}>
              <Text style={styles.trialMetaLabel}>{t("auto_started")}</Text>
              <Text style={styles.trialMetaValue}>{formatDate(subscriptionData?.trialStartDate || subscriptionData?.startDate)}</Text>
            </View>
            <View style={styles.trialMetaItem}>
              <Text style={styles.trialMetaLabel}>{t("auto_ends_on")}</Text>
              <Text style={styles.trialMetaValue}>{formatDate(subscriptionData?.trialEndDate || subscriptionData?.endDate)}</Text>
            </View>
          </View>

          <View style={styles.trialFooterRow}>
            <Text style={styles.trialFooterText}>{t("auto_day")}
            {Math.min(trialMeta.totalDays, trialMeta.usedDays + 1)} of {trialMeta.totalDays}
            </Text>
            <Text style={[
          styles.trialFooterText,
          trialTone === 'ending' && styles.trialFooterTextEnding]
          }>
              {trialMeta.progressPercent}{t("auto_used")}
          </Text>
          </View>
        </MotiView> :
      null}

      {isTrialExpired ?
      <MotiView
        animate={{ opacity: 1, scale: 1 }}
        from={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 260, type: 'timing' }}
        style={styles.expiredCard}>

          <View style={styles.expiredIcon}>
            <MaterialCommunityIcons
            name="lock-alert-outline"
            size={26}
            color={colors123.primary} />

          </View>
          <Text style={styles.expiredTitle}>{t("auto_your_10_day_free_trial_is_completed")}</Text>
          <Text style={styles.expiredText}>{t("subscriptionExpiredDetails")}</Text>
          <AppButton
          icon="refresh"
          label={t("auto_refresh_subscription_status")}
          onPress={handleRefreshStatus}
          style={styles.refreshButton}
          variant="secondary" />

        </MotiView> :
      null}

      {isActive ?
      <MotiView
        animate={{ opacity: 1, translateY: 0 }}
        from={{ opacity: 0, translateY: 12 }}
        transition={{ duration: 280, type: 'timing' }}
        style={styles.activeCard}>

          <View style={styles.activeHeader}>
            <View style={styles.activeIconWrap}>
              <MaterialCommunityIcons name="shield-check" size={24} color={colors123.primary} />
            </View>
            <View style={styles.activeHeaderText}>
              <Text style={styles.activeTitle}>{t("auto_your_plan_is_live")}</Text>
              <Text style={styles.activeSubtitle}>Your StitchBook tools are active and synced.</Text>
            </View>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>{t("auto_active")}</Text>
            </View>
          </View>
          <View style={styles.planDetailList}>
          <View style={styles.rowGroup}>
            <Text style={styles.fieldLabel}>{t("auto_plan")}</Text>
            <Text style={styles.fieldValue}>{activePlanName}</Text>
          </View>
          <View style={styles.rowGroup}>
            <Text style={styles.fieldLabel}>{t("auto_started")}</Text>
            <Text style={styles.fieldValue}>{formatDate(subscriptionData?.startDate)}</Text>
          </View>
          <View style={styles.rowGroup}>
            <Text style={styles.fieldLabel}>{t("auto_valid_until")}</Text>
            <Text style={styles.fieldValue}>{formatDate(subscriptionData?.endDate)}</Text>
          </View>
          <View style={styles.rowGroup}>
            <Text style={styles.fieldLabel}>{t("auto_days_remaining")}</Text>
            <Text style={styles.fieldValue}>{subscriptionData?.daysRemaining ?? '-'}</Text>
          </View>
          </View>

          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>{t("auto_features")}</Text>
          <View style={styles.featureGrid}>
            {featureRows.map((row) => renderFeatureItem(row.label, row.active))}
          </View>

          <View style={styles.buttonGrid}>
            <AppButton
            icon="refresh"
            label={t("auto_refresh_status")}
            onPress={handleRefreshStatus}
            style={styles.secondaryButton}
            variant="secondary" />

          </View>
        </MotiView> :
      null}

      {isInactive || !subscriptionData || isTrial ?
      <View style={styles.buySection}>
          <View style={styles.webBillingCard}>
            <View style={styles.webBillingIcon}>
              <MaterialCommunityIcons
              name="shield-lock-outline"
              size={22}
              color={colors123.primary} />

            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.webBillingTitle}>{t("subscriptionStatusInfoTitle")}</Text>
              <Text style={styles.webBillingText}>{t("subscriptionStatusInfoText")}</Text>
            </View>
          </View>

          <AppButton
          icon="refresh"
          label={t("auto_refresh_subscription_status")}
          onPress={handleRefreshStatus}
          style={styles.refreshButton}
          variant="secondary" />


          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>{t("auto_what_you_get")}</Text>
          <View style={styles.featureGrid}>
            {PLAN_FEATURES.map((feature) => renderFeatureItem(feature, true))}
          </View>

        </View> :
      null}
    </ScrollView>);

};

export default SubscriptionScreen;

// Lazy-create styles to avoid module loading order issues with Hermes
let cachedSubscriptionStyles = null;
const getSubscriptionStyles = () => {
  if (!cachedSubscriptionStyles) {
    cachedSubscriptionStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors123.background,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  loadingContainer: {
    marginTop: spacing.lg,
    alignItems: "center",
  },
  heroCard: {
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    overflow: "hidden",
    ...shadows.card,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  heroIcon: {
    width: 50,
    height: 50,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },
  heroRefreshButton: {
    minHeight: 44,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  heroRefreshText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors123.surface,
  },
  heroEyebrow: {
    fontFamily: fonts.extrabold,
    fontSize: 12,
    color: colors123.surface,
    textTransform: "uppercase",
    marginBottom: spacing.xs,
  },
  heroTitle: {
    fontFamily: fonts.extrabold,
    fontSize: 24,
    lineHeight: 30,
    color: colors123.surface,
  },
  heroDescription: {
    marginTop: spacing.sm,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: "rgba(255,255,255,0.82)",
  },
  heroStatsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  heroStat: {
    flex: 1,
    borderRadius: 18,
    padding: spacing.md,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  heroStatLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: "rgba(255,255,255,0.74)",
  },
  heroStatValue: {
    marginTop: 4,
    fontFamily: fonts.extrabold,
    fontSize: 16,
    color: colors123.surface,
  },
  trialStatusCard: {
    backgroundColor: colors123.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  trialStatusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  trialStatusIcon: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: colors123.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  trialStatusIconAttention: {
    backgroundColor: colors123.warningLight,
  },
  trialStatusIconEnding: {
    backgroundColor: colors123.dangerLight,
  },
  trialStatusCopy: {
    flex: 1,
  },
  trialStatusEyebrow: {
    fontFamily: fonts.extrabold,
    fontSize: 12,
    color: colors123.primary,
    textTransform: "uppercase",
  },
  trialStatusTitle: {
    marginTop: 3,
    fontFamily: fonts.extrabold,
    fontSize: 18,
    color: colors123.text,
  },
  refreshPill: {
    minHeight: 44,
    borderRadius: 17,
    paddingHorizontal: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors123.primarySoft,
  },
  refreshPillText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors123.primary,
  },
  trialProgressTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors123.borderLight,
    overflow: "hidden",
    marginTop: spacing.md,
  },
  trialProgressFill: {
    height: "100%",
    borderRadius: 5,
    backgroundColor: colors123.primary,
  },
  trialProgressFillAttention: {
    backgroundColor: colors123.warning,
  },
  trialProgressFillEnding: {
    backgroundColor: colors123.error,
  },
  trialMetaGrid: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  trialMetaItem: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: colors123.background,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors123.borderLight,
  },
  trialMetaLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors123.textMuted,
  },
  trialMetaValue: {
    marginTop: 4,
    fontFamily: fonts.extrabold,
    fontSize: 14,
    color: colors123.text,
  },
  trialFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  trialFooterText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors123.textMuted,
  },
  trialFooterTextEnding: {
    color: colors123.error,
  },
  expiredCard: {
    backgroundColor: colors123.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignItems: "center",
    ...shadows.card,
  },
  expiredIcon: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: colors123.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  expiredTitle: {
    fontFamily: fonts.extrabold,
    fontSize: 20,
    color: colors123.text,
    textAlign: "center",
  },
  expiredText: {
    marginTop: spacing.sm,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: colors123.textMuted,
    textAlign: "center",
  },
  activeCard: {
    backgroundColor: colors123.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  activeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  activeIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors123.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  activeHeaderText: {
    flex: 1,
  },
  activeBadge: {
    alignItems: "center",
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: colors123.successLight,
  },
  activeBadgeText: {
    fontFamily: fonts.semibold,
    color: colors123.success,
    fontSize: 11,
  },
  activeTitle: {
    fontFamily: fonts.extrabold,
    fontSize: 18,
    color: colors123.text,
  },
  activeSubtitle: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors123.textMuted,
  },
  planDetailList: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors123.borderLight,
  },
  rowGroup: {
    minHeight: 46,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors123.borderLight,
    gap: spacing.md,
  },
  fieldLabel: {
    fontFamily: fonts.medium,
    color: colors123.textMuted,
    fontSize: 13,
  },
  fieldValue: {
    fontFamily: fonts.semibold,
    color: colors123.text,
    fontSize: 13,
    textAlign: "right",
    flexShrink: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors123.borderStrong,
    marginVertical: spacing.md,
  },
  sectionTitle: {
    fontFamily: fonts.extrabold,
    color: colors123.text,
    fontSize: 18,
    marginBottom: spacing.sm,
  },
  featureGrid: {
    gap: 2,
    backgroundColor: colors123.surface,
  },
  featureTile: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: colors123.borderLight,
  },
  featureLabel: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors123.text,
  },
  featureLabelInactive: {
    color: colors123.textSoft,
  },
  buttonGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  secondaryButton: {
    flex: 1,
  },
  buySection: {
    marginTop: spacing.sm,
  },
  webBillingCard: {
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors123.primarySoft,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    marginBottom: spacing.lg,
  },
  webBillingIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors123.surface,
  },
  webBillingTitle: {
    fontFamily: fonts.extrabold,
    fontSize: 15,
    color: colors123.text,
  },
  webBillingText: {
    marginTop: spacing.xs,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: colors123.textMuted,
  },
  refreshButton: {
    marginTop: spacing.sm,
  },
});
  }
  return cachedSubscriptionStyles;
};
