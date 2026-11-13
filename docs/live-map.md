# Parking and charging map

Parking and charging each have a Live map button. Opening it requests optional browser GPS permission. Denial, timeout and unsupported devices retain city/area search. GPS stays in component memory; the availability API receives only service, date, time, plan and duration. Tile requests disclose the viewed region to OpenStreetMap. No background tracking is used.

## Inventory and availability

The map uses the existing reviewed, published catalog (up to 500 per service), including public approximate coordinates. Parking examples and GitHub charging examples are purple and explicitly not bookable. Missing charger coordinates never fall back to guessed city coordinates. Paused, draft, rejected and pending-review listings are not public inventory. All existing discovery filters apply before map status filtering.

The server derives each requested window using the same parking/charging window functions as booking submission. It checks operating hours, days, plan support, accepted reservations, unexpired pending holds and parking calendar blocks. Only aggregate status and explanation are returned: never guest, vehicle, address, booking ID or private block reason. One listing represents one bay or port. Adjacent reservations do not overlap. Expired holds and cancelled reservations do not block supply.

- Green: available to request; host acceptance required.
- Red: reserved for the chosen window, not proof of physical occupancy.
- Amber: temporarily held by another pending request.
- Dark grey: unavailable for the selected window (hours, plan or host block).
- Grey: unknown after a failed/stale check or an unpublished listing.
- Purple: fictional example.

Checks run on opening, changed time/plan, focus, manual refresh and every 30 seconds while visible. Snapshots older than 90 seconds become unknown; fetch failures clear available claims. Old responses are ignored after filter changes. Booking APIs still make atomic conflict checks; a green pin is not a reservation or equipment-health guarantee. Physical presence, off-platform use, electrical faults and remote charger health require future check-in/telemetry integration and pilot validation.

## Location and booking

Public coordinates are rounded to 2 decimals, consistent with existing private-host privacy. They are area hints, not navigation to an entrance. GPS-to-pin distance is a straight-line estimate. Cards and keyboard-operable markers provide another way to select overlapping pins. Selection opens the parking booking page or charging booking form with the chosen slot; non-available cards allow exploring other times without claiming the slot can be booked.

Charging adds nullable latitude/longitude columns with a schema-only migration. New submissions require valid India-range coordinates. Legacy listings stay usable without fabricated pins. Hosts can capture/enter a location and submit it for review; coordinate changes temporarily remove the listing from public inventory. Accepted charging requests retain their stored address snapshot. Parking uses its existing coordinate/edit-and-review flow. Bounds validation is not on-site verification: reviewers must compare coordinates, entrance photos and address before publication.

## Map provider and operation

Leaflet 1.9.4 is bundled and licensed in third-party notices. OpenStreetMap standard tiles use visible attribution, browser HTTP caching and a normal referrer; there is no bulk prefetch or offline download. Tile errors retain usable listing cards. Before significant traffic, provision a tile provider with appropriate service capacity under https://operations.osmfoundation.org/policies/tiles/ . Technical API: https://leafletjs.com/reference .

## Validation

Automated coverage includes status precedence, overlaps, expired/cancelled holds, invalid coordinates and distances. API and browser QA must additionally cover time/hours, private fields, permission granted/denied, status refresh/failure, missing coordinates, mobile overflow and booking handoff. Do not seed QA records in production.
