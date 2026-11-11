# Mobile usability release — 11 November 2026

## Changes
- One shared menu for parking, charging, both booking systems, both host areas, account and documents.
- Persistent mobile Home, Parking, Charging, Bookings and Menu navigation. The modal menu traps focus, closes on Escape or navigation, scrolls independently and locks background scroll.
- Homepage service choice, separate booking and hosting hubs, clearer parking-only labels, and grouped footer links.
- Larger mobile text and controls, 16px form fields, single-column forms, wrapping action rows, accessible focus states and safe-area spacing above the fixed navigation.
- Fixed an observed homepage horizontal overflow caused by the parking search card's minimum content width.
- Charging activity can be filtered by driver/host role and request status. Booking reference, refresh button and submission receipt make next steps clear.
- New help/document index, getting-started guide, pricing/payment explanation, cancellation/problem guide and feature-availability page. Updated terms, privacy, safety, about text and README to reflect separate charging.
- Added direct GitHub Pages output and validation for every new navigation/document route.

## Checks
- Browser inspection of 20 major routes at 390px, and 14 routes at 320px: no horizontal document overflow after fixes. Includes parking detail/form/dashboard, charging form/bookings/guide, documents and account pages.
- Mobile menu opening, focus, grouped links and booking-hub navigation checked interactively.
- 18 unit/SQL tests passed, including charging and parking conflict handling and price snapshots.
- Local-only parking and charging API smoke tests passed: identity, ownership, review, request creation, cancellation and related validations.
- TypeScript and static Pages route/output checks passed. Production builds and deployment status are recorded by hosting and GitHub workflows.

## Limits
Checks use browser viewport emulation, not every physical iOS/Android device. Local API tests use the portable development identity and local fixtures. No physical charger, live payment, refund or notification delivery was tested; those integrations remain disabled. No legal registration or electrical certification is implied. Real inventory requires host onboarding and review.
