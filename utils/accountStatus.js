import { Alert } from "react-native";

// Play Store build: no in-app purchases and no alternative billing, so the app never
// shows plans, prices, or anything that points to where to pay. It only reports status.

export const isAccountInactive = (subscription) =>
  subscription?.status === "trial_expired" || Boolean(subscription?.requiresSubscription);

export function getAccountStatusText(subscription, t) {
  if (!subscription) return "";
  if (isAccountInactive(subscription)) return t("accountInactiveTitle");
  if (subscription.status === "trial" && subscription.isActive) {
    const days = Math.max(0, Number(subscription.trialDaysRemaining ?? subscription.daysRemaining ?? 0));
    return `${t("freeTrial")} · ${t("auto_days_remaining")}: ${days}`;
  }
  return subscription.isActive ? t("auto_active") : t("accountInactiveTitle");
}

export function showAccountInactiveAlert(t) {
  Alert.alert(t("accountInactiveTitle"), t("accountInactiveMessage"), [{ text: t("ok") }]);
}
