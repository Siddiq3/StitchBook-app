# StitchBook visual design system

StitchBook keeps its tailoring workflows and business rules unchanged while using one consistent UI language across authentication, onboarding, dashboard, customers, orders, measurements, staff, subscription and account settings.

## Identity

The product uses a warm orange accent for primary actions and tailoring identity, restrained neutral surfaces for operational screens, and semantic green/amber/red/blue only for meaningful status.

- Primary: `#E2511E`
- Pressed: `#B83E15`
- Primary subtle: `#FEF1EA`
- Canvas: `#F4F4F6`
- Surface: `#FFFFFF`
- Muted surface: `#EEEEF1`
- Primary text: `#101014`
- Secondary text: `#45454F`
- Muted text: `#5B5B66`
- Border: `#E6E6EA`
- Strong border: `#D3D3D9`
- Success: `#15803D`
- Warning: `#B45309`
- Danger: `#BE123C`
- Info: `#1D4ED8`

## Typography

Inter remains the product font so language coverage and the existing loading setup are preserved.

- Display: 34/40 bold
- Page title: 24/30 bold
- Section heading: 18/26 semibold
- Body: 15.5/23 regular
- Supporting copy: 14/21 regular
- Label: 13/18 semibold
- Caption: 12/18 regular

Large operational numbers use the same hierarchy rather than one-off oversized styles.

## Spacing and geometry

The core spacing rhythm is 4 / 8 / 12 / 16 / 24 / 32 / 48.

The core radius scale is 6 / 12 / 18 / 22 / 28 / pill.

Buttons and inputs retain at least 44px touch height. Default controls are 50px high.

Cards are flat white surfaces with subtle borders. Shadows are reserved for floating layers such as bottom sheets, not ordinary list cards.

## Interaction rules

- Primary action: orange filled.
- Secondary action: white with neutral border.
- Ghost action: orange-subtle surface.
- Danger action: red-subtle surface with red text.
- Selected filters use a white segment on a muted track.
- Inputs use persistent labels, clear focus, disabled and error states.
- Empty/error states remain actionable rather than decorative.
- Status meaning is always expressed with text as well as color.

## Screen hierarchy

Operational screens use a shared pattern:

1. page header / context
2. primary action when needed
3. filters/search
4. summary information
5. one-level cards or rows
6. empty/loading/error feedback

Nested floating cards and decorative gradients are avoided. Hero treatment is limited to places where business context benefits from it, such as dashboard revenue and subscription state.

## Navigation

The main tabs remain Dashboard, Orders, Customers and Settings. Their business routes are unchanged. Active navigation uses the same primary-subtle treatment as selected controls, while safe-area behavior and keyboard hiding are preserved.

## Product boundaries

The redesign does not change:

- authentication behavior
- shop onboarding fields
- customer/order/measurement payloads
- order status rules
- staff permissions
- subscription entitlement logic
- API routes
- storage behavior
- account-deletion logic
- navigation destinations

The change is intentionally a UI/UX redesign, not a product/business rewrite.
