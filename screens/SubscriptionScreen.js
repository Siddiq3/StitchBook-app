import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  AppState,
  Linking } from
'react-native';
import { format, parseISO } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useStitchPro } from '../context/StitchProContext';
import { useToast } from '../context/ToastContext';
import { subscriptionApi } from '../services/api';
import ScreenHeader from '../components/ScreenHeader';
import AppButton from '../components/AppButton';
import { colors123, fonts, radius, spacing, shadows } from '../utils/theme';import { useLanguage } from "../context/LanguageContext";

const PLAN_CONFIG = {
  basic: {
    amount: 299,
    display: 'INR 299/Monthly',
    planType: 'basic',
    label: 'Basic',
    caption: 'Owner-only access for small shops',
    badge: '',
    staffText: '1 owner login',
    features: ['Customers + orders', 'Measurements', 'Payments + bills', 'No staff login']
  },
  team: {
    amount: 399,
    display: 'INR 399/Monthly',
    planType: 'team',
    label: 'Team',
    caption: 'For owner with cutter/stitcher access',
    badge: 'Most useful',
    staffText: 'Owner + 2 staff users',
    features: ['Everything in Basic', '2 staff app logins', 'Cutting/Stitching assignment', 'Staff work status']
  },
  pro: {
    amount: 599,
    display: 'INR 599/Monthly',
    planType: 'pro',
    label: 'Pro',
    caption: 'For busier shops with a small team',
    badge: 'Best for teams',
    staffText: 'Owner + 5 staff users',
    features: ['Everything in Team', '5 staff app logins', 'Staff earnings tracking', 'Production dashboard']
  }
};

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
  const {
    subscription,
    subscriptionLoading,
    fetchSubscription
  } = useStitchPro();
  const { showToast } = useToast();
  const [openingPlan, setOpeningPlan] = useState('');
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

  const offerDaysLeft = useMemo(() => {
    if (!subscriptionData?.trialEndDate) return 0;
    const offerEndDate = new Date(subscriptionData.trialEndDate);
    const today = new Date();
    const diff = Math.ceil((offerEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [subscriptionData]);

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
        description: 'Your shop tools stay open during trial. After web activation, refresh here to sync your plan.',
        icon: 'timer-sand'
      };
    }

    if (isTrialExpired) {
      return {
        eyebrow: 'Action needed',
        title: 'Trial completed',
        description: 'Subscription activation is handled on the StitchBook web account. Return here and refresh after activation.',
        icon: 'lock-alert-outline'
      };
    }

    return {
      eyebrow: 'Subscription',
      title: 'Subscription status',
      description: 'View plan details here. Payments are handled on the StitchBook web account and synced automatically.',
      icon: 'shield-lock-outline'
    };
  }, [
  activePlanName,
  isActive,
  isTrial,
  isTrialExpired,
  subscriptionData?.daysRemaining,
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

  const getUpgradeErrorMessage = (err) => {
    const responseData = err.response?.data;
    return responseData?.error?.message ||
    responseData?.message ||
    err.message ||
    'Unable to open subscription page';
  };

  const handleTakeSubscriptionPress = async (planKey = 'basic') => {
    if (openingPlan) return;

    setOpeningPlan(planKey);
    try {
      const response = await subscriptionApi.createUpgradeSession(planKey);
      const upgradeUrl = response.data?.data?.upgradeUrl || response.data?.upgradeUrl;

      if (!upgradeUrl) {
        throw new Error(t("auto_unable_to_create_subscription_page_link"));
      }

      const canOpen = await Linking.canOpenURL(upgradeUrl);
      if (!canOpen) {
        throw new Error(t("auto_unable_to_open_subscription_page"));
      }

      await Linking.openURL(upgradeUrl);
      showToast(t("auto_opening_subscription_page"), 'success');
    } catch (err) {
      showToast(getUpgradeErrorMessage(err), 'error');
    } finally {
      setOpeningPlan('');
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


  const renderPlanCard = (planKey) => {
    const plan = PLAN_CONFIG[planKey];

    return (
      <MotiView
        key={planKey}
        animate={{ opacity: 1, translateY: 0 }}
        from={{ opacity: 0, translateY: 14 }}
        transition={{ delay: planKey === 'team' ? 80 : planKey === 'pro' ? 130 : 30, duration: 280, type: 'timing' }}
        style={[
        styles.planCard,
        planKey === 'team' && styles.planCardRecommended]
        }>
        
        {plan.badge ?
        <View style={styles.planTopBadge}>
            <MaterialCommunityIcons name="star-four-points" size={13} color={colors123.text} />
            <Text style={styles.planTopBadgeText}>{plan.badge}</Text>
          </View> :
        null}
        <View style={styles.planHeader}>
          <View style={styles.planNameGroup}>
            <Text style={styles.planLabel}>{plan.label}</Text>
            <Text style={styles.planCaption}>
              {plan.caption}
            </Text>
          </View>
          <View style={styles.planPriceBlock}>
            <Text style={styles.planAmount}>{t("auto_inr")}{plan.amount}</Text>
            <Text style={styles.planCycle}>per month</Text>
          </View>
        </View>
        {plan.staffText ?
        <View style={styles.planStaffRow}>
            <MaterialCommunityIcons name="account-group-outline" size={14} color={colors123.primary} />
            <Text style={styles.planSavings}>{plan.staffText}</Text>
          </View> :
        null}
        <View style={styles.planDivider} />
        <View style={styles.planMiniFeatures}>
          {plan.features.map((item) =>
          <View key={`${planKey}-${item}`} style={styles.planMiniFeature}>
              <MaterialCommunityIcons name="check" size={14} color={colors123.success} />
              <Text style={styles.planMiniFeatureText}>{item}</Text>
            </View>
          )}
        </View>
        <AppButton
          disabled={Boolean(openingPlan)}
          icon="credit-card-outline"
          label={openingPlan === planKey ? 'Opening Subscription Page...' : `Take ${plan.label}`}
          loading={openingPlan === planKey}
          onPress={() => handleTakeSubscriptionPress(planKey)}
          style={styles.planButton}
          variant={planKey === 'team' ? 'accent' : 'primary'} />
        
      </MotiView>);

  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}>
      
      <ScreenHeader
        eyebrow="Billing"
        title={t("auto_subscription")}
        subtitle={t("auto_pick_the_plan_that_keeps_your_tailoring_work")} />
      

      {subscriptionLoading && !subscriptionData ?
      <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors123.primary} size="large" />
        </View> :
      null}

      <MotiView
        animate={{ opacity: 1, translateY: 0 }}
        from={{ opacity: 0, translateY: 12 }}
        transition={{ duration: 300, type: 'timing' }}>
        
        <LinearGradient
          colors={[colors123.primaryDark, colors123.primary, '#1D7A5C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}>
          
          <View style={styles.heroTopRow}>
            <View style={styles.heroIcon}>
              <MaterialCommunityIcons name={heroMeta.icon} size={25} color={colors123.surface} />
            </View>
            <TouchableOpacity onPress={handleRefreshStatus} style={styles.heroRefreshButton}>
              <MaterialCommunityIcons name="refresh" size={15} color={colors123.surface} />
              <Text style={styles.heroRefreshText}>{t("auto_refresh")}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.heroEyebrow}>{heroMeta.eyebrow}</Text>
          <Text style={styles.heroTitle}>{heroMeta.title}</Text>
          <Text style={styles.heroDescription}>{heroMeta.description}</Text>
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Basic</Text>
              <Text style={styles.heroStatValue}>{t("auto_inr")}{PLAN_CONFIG.basic.amount}</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Team</Text>
              <Text style={styles.heroStatValue}>{t("auto_inr")}{PLAN_CONFIG.team.amount}</Text>
            </View>
          </View>
        </LinearGradient>
      </MotiView>

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
            <TouchableOpacity onPress={handleRefreshStatus} style={styles.refreshPill}>
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
          <Text style={styles.expiredText}>{t("auto_your_trial_is_expired_activate_a_plan_from_t")}

        </Text>
          <AppButton
          icon="credit-card-outline"
          label={t("auto_take_subscription")}
          loading={openingPlan === 'basic'}
          disabled={Boolean(openingPlan)}
          onPress={() => handleTakeSubscriptionPress('basic')}
          style={styles.openBillingButton}
          variant="primary" />
        
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
              <Text style={styles.webBillingTitle}>{t("auto_web_billing_only")}</Text>
              <Text style={styles.webBillingText}>{t("auto_billing_stays_on_the_stitchpro_web_account_t")}

            </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>{t("auto_available_plans")}</Text>
          <Text style={styles.sectionSubtitle}>{t("auto_review_plan_pricing_here_plan_activation_hap")}

        </Text>
          <View style={styles.planList}>
            {Object.keys(PLAN_CONFIG).map(renderPlanCard)}
          </View>

          <AppButton
          icon="credit-card-outline"
          label={t("auto_take_subscription")}
          loading={Boolean(openingPlan)}
          disabled={Boolean(openingPlan)}
          onPress={() => handleTakeSubscriptionPress('basic')}
          style={styles.openBillingButton}
          variant="primary" />
        

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

          {offerDaysLeft > 0 ?
        <View style={styles.offerBanner}>
              <MaterialCommunityIcons
            name="bell-alert-outline"
            size={18}
            color={colors123.primary} />
          
              <Text style={styles.offerText}>{t("auto_offer_ends_in")}{offerDaysLeft}{t("auto_days_limited_period_offer")}</Text>
            </View> :
        null}
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
        backgroundColor: colors123.background
      },
      contentContainer: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl
      },
      loadingContainer: {
        marginTop: spacing.lg,
        alignItems: 'center'
      },
      heroCard: {
        borderRadius: 26,
        padding: spacing.lg,
        marginBottom: spacing.md,
        overflow: 'hidden',
        ...shadows.card
      },
      heroTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.lg
      },
      heroIcon: {
        width: 50,
        height: 50,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.16)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.22)'
      },
      heroRefreshButton: {
        minHeight: 36,
        borderRadius: radius.pill,
        paddingHorizontal: spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: 'rgba(255,255,255,0.14)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.18)'
      },
      heroRefreshText: {
        fontFamily: fonts.semibold,
        fontSize: 12,
        color: colors123.surface
      },
      heroEyebrow: {
        fontFamily: fonts.extrabold,
        fontSize: 12,
        color: colors123.accent,
        textTransform: 'uppercase',
        marginBottom: spacing.xs
      },
      heroTitle: {
        fontFamily: fonts.extrabold,
        fontSize: 27,
        lineHeight: 33,
        color: colors123.surface
      },
      heroDescription: {
        marginTop: spacing.sm,
        fontFamily: fonts.regular,
        fontSize: 14,
        lineHeight: 22,
        color: 'rgba(255,255,255,0.82)'
      },
      heroStatsRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: spacing.lg
      },
      heroStat: {
        flex: 1,
        borderRadius: 18,
        padding: spacing.md,
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.16)'
      },
      heroStatLabel: {
        fontFamily: fonts.medium,
        fontSize: 12,
        color: 'rgba(255,255,255,0.74)'
      },
      heroStatValue: {
        marginTop: 4,
        fontFamily: fonts.extrabold,
        fontSize: 16,
        color: colors123.surface
      },
      trialStatusCard: {
        backgroundColor: colors123.surface,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: colors123.borderLight,
        padding: spacing.lg,
        marginBottom: spacing.md,
        ...shadows.card
      },
      trialStatusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm
      },
      trialStatusIcon: {
        width: 48,
        height: 48,
        borderRadius: 18,
        backgroundColor: colors123.primarySoft,
        alignItems: 'center',
        justifyContent: 'center'
      },
      trialStatusIconAttention: {
        backgroundColor: colors123.warningLight
      },
      trialStatusIconEnding: {
        backgroundColor: colors123.dangerLight
      },
      trialStatusCopy: {
        flex: 1
      },
      trialStatusEyebrow: {
        fontFamily: fonts.extrabold,
        fontSize: 11,
        color: colors123.primary,
        textTransform: 'uppercase'
      },
      trialStatusTitle: {
        marginTop: 3,
        fontFamily: fonts.extrabold,
        fontSize: 18,
        color: colors123.text
      },
      refreshPill: {
        minHeight: 34,
        borderRadius: 17,
        paddingHorizontal: spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: colors123.primarySoft
      },
      refreshPillText: {
        fontFamily: fonts.semibold,
        fontSize: 12,
        color: colors123.primary
      },
      trialProgressTrack: {
        height: 10,
        borderRadius: 5,
        backgroundColor: colors123.borderLight,
        overflow: 'hidden',
        marginTop: spacing.md
      },
      trialProgressFill: {
        height: '100%',
        borderRadius: 5,
        backgroundColor: colors123.primary
      },
      trialProgressFillAttention: {
        backgroundColor: colors123.warning
      },
      trialProgressFillEnding: {
        backgroundColor: colors123.error
      },
      trialMetaGrid: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: spacing.md
      },
      trialMetaItem: {
        flex: 1,
        borderRadius: 16,
        backgroundColor: colors123.background,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors123.borderLight
      },
      trialMetaLabel: {
        fontFamily: fonts.regular,
        fontSize: 12,
        color: colors123.textMuted
      },
      trialMetaValue: {
        marginTop: 4,
        fontFamily: fonts.extrabold,
        fontSize: 14,
        color: colors123.text
      },
      trialFooterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.sm
      },
      trialFooterText: {
        fontFamily: fonts.semibold,
        fontSize: 12,
        color: colors123.textMuted
      },
      trialFooterTextEnding: {
        color: colors123.error
      },
      trialBanner: {
        backgroundColor: colors123.primarySoft,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: colors123.primary,
        padding: spacing.md,
        marginTop: spacing.md,
        flexDirection: 'row',
        gap: spacing.sm,
        justifyContent: 'space-between',
        alignItems: 'center'
      },
      trialLabel: {
        fontFamily: fonts.semibold,
        color: colors123.primary,
        fontSize: 14,
        flex: 1
      },
      upgradeNow: {
        fontFamily: fonts.semibold,
        color: colors123.primary,
        fontSize: 14
      },
      expiredCard: {
        backgroundColor: colors123.surface,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: colors123.borderLight,
        padding: spacing.lg,
        marginBottom: spacing.md,
        alignItems: 'center',
        ...shadows.card
      },
      expiredIcon: {
        width: 56,
        height: 56,
        borderRadius: 20,
        backgroundColor: colors123.primarySoft,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md
      },
      expiredTitle: {
        fontFamily: fonts.extrabold,
        fontSize: 20,
        color: colors123.text,
        textAlign: 'center'
      },
      expiredText: {
        marginTop: spacing.sm,
        fontFamily: fonts.regular,
        fontSize: 14,
        lineHeight: 21,
        color: colors123.textMuted,
        textAlign: 'center'
      },
      activeCard: {
        backgroundColor: colors123.surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors123.borderLight,
        padding: spacing.md,
        marginBottom: spacing.md,
        ...shadows.card
      },
      activeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.md
      },
      activeIconWrap: {
        width: 46,
        height: 46,
        borderRadius: 14,
        backgroundColor: colors123.primarySoft,
        alignItems: 'center',
        justifyContent: 'center'
      },
      activeHeaderText: {
        flex: 1
      },
      activeBadge: {
        alignItems: 'center',
        borderRadius: radius.pill,
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: '#E8F8EF'
      },
      activeBadgeText: {
        fontFamily: fonts.semibold,
        color: colors123.success,
        fontSize: 11
      },
      activeTitle: {
        fontFamily: fonts.extrabold,
        fontSize: 18,
        color: colors123.text
      },
      activeSubtitle: {
        marginTop: 3,
        fontFamily: fonts.regular,
        fontSize: 12,
        color: colors123.textMuted
      },
      planDetailList: {
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors123.borderLight
      },
      rowGroup: {
        minHeight: 46,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: colors123.borderLight,
        gap: spacing.md
      },
      fieldLabel: {
        fontFamily: fonts.medium,
        color: colors123.textMuted,
        fontSize: 13
      },
      fieldValue: {
        fontFamily: fonts.semibold,
        color: colors123.text,
        fontSize: 13,
        textAlign: 'right',
        flexShrink: 1
      },
      divider: {
        height: 1,
        backgroundColor: colors123.borderStrong,
        marginVertical: spacing.md
      },
      sectionTitle: {
        fontFamily: fonts.extrabold,
        color: colors123.text,
        fontSize: 18,
        marginBottom: spacing.sm
      },
      sectionSubtitle: {
        fontFamily: fonts.regular,
        color: colors123.textMuted,
        fontSize: 14,
        marginBottom: spacing.md
      },
      featureGrid: {
        gap: 2,
        backgroundColor: colors123.surface
      },
      featureTile: {
        minHeight: 42,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingVertical: 9,
        borderBottomWidth: 1,
        borderBottomColor: colors123.borderLight
      },
      featureLabel: {
        flex: 1,
        fontFamily: fonts.medium,
        fontSize: 13,
        color: colors123.text
      },
      featureLabelInactive: {
        color: colors123.textSoft
      },
      buttonGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: spacing.sm,
        marginTop: spacing.md
      },
      secondaryButton: {
        flex: 1
      },
      buySection: {
        marginTop: spacing.sm
      },
      webBillingCard: {
        flexDirection: 'row',
        gap: spacing.md,
        padding: spacing.md,
        backgroundColor: colors123.primarySoft,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: colors123.borderLight,
        marginBottom: spacing.lg
      },
      webBillingIcon: {
        width: 44,
        height: 44,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors123.surface
      },
      webBillingTitle: {
        fontFamily: fonts.extrabold,
        fontSize: 15,
        color: colors123.text
      },
      webBillingText: {
        marginTop: spacing.xs,
        fontFamily: fonts.regular,
        fontSize: 13,
        lineHeight: 20,
        color: colors123.textMuted
      },
      planList: {
        gap: spacing.sm
      },
      planCard: {
        backgroundColor: colors123.surface,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: colors123.borderLight,
        padding: spacing.md,
        ...shadows.card
      },
      planCardRecommended: {
        borderColor: colors123.primary,
        backgroundColor: '#F8FBFF'
      },
      planTopBadge: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        borderRadius: radius.pill,
        paddingHorizontal: spacing.sm,
        paddingVertical: 6,
        backgroundColor: colors123.accent,
        marginBottom: spacing.sm
      },
      planTopBadgeText: {
        fontFamily: fonts.extrabold,
        fontSize: 11,
        color: colors123.text,
        textTransform: 'uppercase'
      },
      planHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.sm
      },
      planNameGroup: {
        flex: 1
      },
      planLabel: {
        fontFamily: fonts.extrabold,
        fontSize: 18,
        color: colors123.text
      },
      planCaption: {
        marginTop: 4,
        fontFamily: fonts.medium,
        fontSize: 13,
        color: colors123.textMuted
      },
      planPriceBlock: {
        alignItems: 'flex-end',
        minWidth: 92
      },
      planAmount: {
        fontFamily: fonts.extrabold,
        fontSize: 20,
        color: colors123.primary,
        textAlign: 'right',
        flexShrink: 0
      },
      planCycle: {
        marginTop: 2,
        fontFamily: fonts.medium,
        fontSize: 12,
        color: colors123.textMuted
      },
      planStaffRow: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingVertical: 4
      },
      planSavings: {
        fontFamily: fonts.semibold,
        color: colors123.primary,
        fontSize: 12
      },
      planDivider: {
        height: 1,
        backgroundColor: colors123.borderLight,
        marginVertical: spacing.sm
      },
      planMiniFeatures: {
        gap: 7
      },
      planMiniFeature: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs
      },
      planMiniFeatureText: {
        fontFamily: fonts.medium,
        fontSize: 13,
        color: colors123.textSecondary
      },
      planButton: {
        marginTop: spacing.sm
      },
      refreshButton: {
        marginTop: spacing.sm
      },
      openBillingButton: {
        marginTop: spacing.md
      },
      offerBanner: {
        marginTop: spacing.md,
        padding: spacing.md,
        backgroundColor: colors123.primarySoft,
        borderRadius: radius.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm
      },
      offerText: {
        fontFamily: fonts.semibold,
        color: colors123.primary,
        fontSize: 14
      }
    });
  }
  return cachedSubscriptionStyles;
};
