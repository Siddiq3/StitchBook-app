# StitchBook readability review — 3 October 2026

Reviewed all screen modules and shared layout components in source. This is a source and build review; a complete live visual walkthrough was not achieved. Browser automation lost the preview window, and the isolated preview did not render a usable screen.

Changes prioritize operational information, compact label/value rows, two-column numeric and measurement summaries, readable text, fewer nested cards, and phone safe areas. Existing form fields, validation, confirmations and navigation destinations remain available.

| Screen | Review outcome |
| --- | --- |
| AccountRecoveryScreen | Retained concise retry and recovery actions. |
| CreateItemDetail | Compact paired measurement facts. |
| CreateOrder | Compact two-column outfit choices; safe-area header. |
| CustomerDetailScreen | Compact measurement grid, reduced section gaps; safe-area header. |
| CustomerSelectionScreen | Safe-area header; removed incorrect fixed row-size hint. |
| CustomersScreen | Grouped divider rows; removed repeated introduction; safe-area header. |
| DashboardScreen | Removed duplicate revenue hero and rotating social banners; compact summaries; retained trial notice and delivery priorities. |
| DeleteAccountScreen | Retained permanent-deletion explanation and confirmation. |
| ForgotPasswordScreen | Retained step-specific instructions and password validation. |
| LanguageSelectionScreen | Grouped choices as divider rows. |
| LoginScreen | Removed repeated welcome and sign-in instructions. |
| MeasurementsScreen | Removed decorative hero and unused code; compact summary strip and profile list. |
| NotificationScreen | Grouped divider rows; larger message text; hide zero-unread subtitle. |
| OnboardingScreen | Horizontal review facts with wrapping values; restored the missing spacing import that caused a startup crash. |
| OrderDetail | Two-column measurement facts; safe-area header. |
| OrdersScreen | Compact summary strip, divider rows, inline paid/balance facts; safe-area header. |
| PasswordScreen | Shorter instructions; scrollable keyboard-aware form. |
| RecordMeasurementScreen | Compact body guide and shared editable measurement rows. |
| RegisterScreen | Removed redundant account introduction. |
| SessionsScreen | Removed duplicate title under native header. |
| SettingsScreen | Grouped account destinations; flattened nested shop facts; safe-area handling. |
| SplashScreen | Retained minimal branding. |
| StaffScreen | Collapsed optional guide; shorter login instructions and bottom padding. |
| SubscriptionScreen | Removed repeated introduction; reduced spacing between plan facts. |
| ViewMeasurementsScreen | Compact two-column previews, complete field labels and fewer nested borders. |

Validation:

- All 30 tests pass, including compact-grid assertions, translation coverage and a regression check for unbound theme tokens.
- All 75 screen, component and navigation JavaScript modules parse successfully.
- Android, iOS and web Expo exports succeed.
- `git diff --check` passes.
- Native-device visual layout, font scaling and keyboard behavior still need a live walkthrough; exports do not establish runtime visual correctness.
