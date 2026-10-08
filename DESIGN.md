---
name: StitchBook
description: The shop counter's order book, on an Android phone
colors:
  primary: "#007FFF"
  primary-pressed: "#0066CC"
  primary-soft: "#EAF4FF"
  background: "#F4F7FB"
  surface: "#FFFFFF"
  surface-muted: "#F0F4F9"
  text: "#101828"
  text-secondary: "#475467"
  text-muted: "#667085"
  border: "#D0D7E2"
  border-light: "#E4E9F0"
  border-subtle: "#EEF2F6"
  success: "#147A48"
  success-soft: "#EDF8F1"
  warning: "#9A5A08"
  warning-soft: "#FFF7E8"
  danger: "#B4233B"
  danger-soft: "#FFF0F2"
typography:
  headline:
    fontFamily: "Inter_700Bold"
    fontSize: "24px"
    lineHeight: "30px"
    letterSpacing: "-0.6px"
  title:
    fontFamily: "Inter_600SemiBold"
    fontSize: "17px"
    lineHeight: "24px"
  body:
    fontFamily: "Inter_400Regular"
    fontSize: "15.5px"
    lineHeight: "23px"
  label:
    fontFamily: "Inter_600SemiBold"
    fontSize: "13px"
    lineHeight: "18px"
  caption:
    fontFamily: "Inter_400Regular"
    fontSize: "12px"
    lineHeight: "18px"
rounded:
  sm: "10px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  pill: "999px"
spacing:
  xxs: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    height: "48px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.md}"
    height: "48px"
  button-danger:
    backgroundColor: "{colors.danger-soft}"
    textColor: "{colors.danger}"
    rounded: "{rounded.md}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    height: "48px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "14px 16px"
  chip:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary}"
    rounded: "{rounded.pill}"
---

# Design System: StitchBook (mobile app)

Source of truth: `utils/theme.js` (tokens), `components/` (AppButton, AppCard, ListRow, IconInput, PressableScale, Reveal, AuthShell). Product context lives in PRODUCT.md.

## Overview

**The Counter Ledger.** StitchBook replaces the tailor's paper order book, so it should read like a well-kept ledger: plain, dense, trustworthy, one brand blue for anything you can act on. It is used one-handed at a busy counter, in Telugu, Hindi or English, on budget Android phones. Calm structure and fast answers beat decoration.

Mood: practical, precise, quietly confident. Anti-references: gradient SaaS dashboards, glassmorphism, "hero metric" cards, eyebrow labels, emoji as icons.

## Colors

One accent. Azure `primary` marks actions, the current selection and brand moments only (the Home summary band, the auth header, primary buttons). Status colours (success, warning, danger) carry state and never decorate. Neutrals are cool slate so the blue sits naturally. Light theme only for now (`userInterfaceStyle: light`); dark theme is a known gap, not an accident.

No gradients, glows or tinted halos anywhere in the app.

## Typography

One family, Inter, loaded through `@expo-google-fonts/inter`. Hierarchy comes from weight and size steps (headline 24 / title 17 / body 15.5 / label 13 / caption 12), never from a second face. Screen titles are bold; numbers in data use bold weights of the same family. All sizes follow the system font scale; labels that must stay on one line (status stepper, work strip) use `numberOfLines={1}` with `adjustsFontSizeToFit`.

## Layout

4-based spacing scale (`spacing` tokens). Screens use a 16px gutter. Group by proximity first; a card exists only when it groups a real unit (an order, a customer, a settings group). **Never nest cards**: sections inside a card are separated by a hairline divider and a label, not another box. Lists are rows separated by hairlines, 56px minimum height. Primary actions sit at the bottom of task screens, near the thumb.

## Elevation & Depth

Flat with one soft step. Cards use `shadows.card` (2px offset, 8px blur, 7% blue-slate). Muted cards and inner sections have no shadow. `SHADOWS.lg` is reserved for floating surfaces (the auth form card, sheets).

## Shapes

One rule: controls (buttons, inputs, segmented controls) `rounded.md` 12; surfaces (cards, list groups) `rounded.lg` 16; sheets and the auth card `rounded.xl` 20; chips and badges pill. Touch targets are at least 44px tall even when the visible mark is smaller.

## Components

- **AppButton**: primary (filled blue, soft blue shadow), secondary (white, border), ghost (soft blue), tertiary (text), danger (soft red). All 48px; `sm` is 44px. Spring press feedback via PressableScale.
- **AppCard**: the only card. `variant="muted"` for quiet notices.
- **ListRow**: settings-style row with leading icon, title, optional meta and trailing chevron; `titleStyle` for destructive rows.
- **IconInput**: label above, icon, hint/error below. Never placeholder-as-label.
- **AuthShell**: brand-blue header + raised form card for sign-in, sign-up and password reset.
- **Reveal / MotiView**: entrance fade-up, capped stagger, skipped under reduced motion. Uses animated styles, never Reanimated layout animations (they break on Fabric during fast mount/unmount).
- **Status**: StatusBadge pills for order and payment state; stepper for the cutting → stitching → ready → delivered flow.

## Do's and Don'ts

- Do show today's work and money owed in one or two taps; do translate every visible string (en/te/hi).
- Do keep store compliance: never show plans, prices or payment links in the app.
- Don't add gradients, glows, eyebrow labels, section numbers, emoji icons, or cards inside cards.
- Don't show a number the app cannot count correctly (e.g. per-customer order counts from a partial list).
- Don't animate for decoration; motion is press feedback, entrance of new content, and loading progress.
