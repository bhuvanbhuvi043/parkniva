# Standalone EV charging: product and pricing decisions

Updated 11 November 2026. Charging is an independent service, not a parking add-on. A driver can request a charger without selecting or paying for parking. Charging uses separate chargers and charging_bookings tables and a separate dashboard.

## What is implemented

- One listing represents one physical charging port with a dedicated bay. Hosts declare permission and professionally inspected installation, upload an equipment photograph, state connector, vehicle category, exact-model compatibility notes, cable requirements, kW, daily opening hours, session length and energy limit. Review is required before publication.
- Drivers search city/area, car or two-wheeler and session/per-kWh pricing. A vehicle category match is not a compatibility certification. The driver supplies exact make/model and the host confirms compatibility before acceptance.
- Charging requests hold that port atomically for at most two hours, ending earlier at arrival time. Adjacent slots are permitted; overlapping active requests are rejected. Expired requests cannot be accepted. Accepted reservations retain their port until the reserved end.
- Separate driver/host records support acceptance, decline, cancellation before arrival and host-recorded completion after the reserved end. No parking booking is created. Completion is a visit record, not evidence of delivered energy.
- Hosts can update rates for new requests. Existing requests retain the original rate, estimated/fixed price and equipment/address snapshot. The API rejects a stale displayed rate at submission. Hosts can pause new requests and acceptance; existing accepted bookings remain obligations until cancelled or fulfilled.
- Public catalogue omits exact addresses. Guest booking records reveal them after acceptance. Authentication, ownership checks, origin checks, bounded request bodies, upload ownership and daily request limits apply.

## Prices and what one charge means

There is no universal full-charge price. The meaningful comparison is delivered kWh, connector/power, reserved time and all fees. As checked on 11 November 2026:

- BPCL eDrive advertises a promotional INR14/kWh plus GST: https://www.bharatpetroleum.in/our-businesses/fuels-and-services/edrive
- Jio-bp advertises subscription examples INR20.25 and INR20.75/kWh: https://www.jiobp.com/products-and-services/EV-charging
- Jio-bp's FAQ states unit tariffs exclude 18% GST: https://www.jiobp.com/faqs
- Tata Power says tariffs vary by location/charger and are shown in its app: https://www.tatapower.com/ezcharge

These are advertised examples, not a verified live quote for every Chennai station or a nationwide tariff survey. Promotions, subscriptions, locations and taxes affect comparison. Check the chosen station's app immediately before charging.

At an illustrative all-inclusive INR20/kWh, 2kWh delivered costs INR40 and 30kWh costs INR600. These are energy examples, not typical or guaranteed full-charge costs. Battery capacity, starting state and losses determine required supply energy.

Hosts choose either:
1. Per-kWh: a displayed all-inclusive rate times requested energy gives an estimate. Actual cost must use agreed meter readings. A working readable energy meter is required. The app does not remotely meter, stop energy at the requested target, collect money or issue a settled invoice.
2. Fixed session: a fixed fee for the stated reserved minutes and maximum energy allowance. This does not promise a full battery, or guarantee that the vehicle can accept the stated maximum. Unused time/energy has no automatic refund; equipment failures and disputes go to support. Payment automation and formal refund handling are future work.

Bay access and all host fees/applicable taxes are included. No extra parking purchase or hidden bay charge is allowed. The two price types must not be compared by the number alone. Hosts may raise or lower future rates, but pricing remains subject to applicable electricity supply, charging-service and tax rules. Do not interpret the technical price-input maximum as a lawful tariff ceiling. A location-specific tariff and permission review is needed before commercial operation; this software is not legal clearance.

## Business case and trade-offs

Separate charging can serve drivers who do not need long-duration parking, and make productive use of an existing professionally installed charger. It adds a second supply category and repeat-use opportunity. It does not make every driveway a charging station: electrical capacity, earthing/protection, compatible equipment, property permission, access and host response reliability determine suitability.

Slow AC is best aligned with longer visits; DC may reduce dwell time but requires materially different equipment and investment. Two-wheelers vary substantially by model and portable charger; do not advertise a universal socket solution. Never improvise adapters or extension cables. Battery swapping and repairs are outside scope.

A host's contribution per visit is gross revenue less electricity, losses, demand/fixed charges attributable to service, equipment depreciation, maintenance, tax obligations, payment costs when enabled, support and fault/refund costs. Raising the price can reduce demand; station promotions can undercut a residential host. Pilot with existing compliant equipment before encouraging hardware purchases. Do not promise earnings.

## Operational boundaries

The same physical bay/port must not be simultaneously offered in parking inventory or another service. This release relies on host declarations and reviewer checks to prevent physical duplicates; it only prevents overlaps within a charger listing. Shared power, multiple simultaneous ports, cross-platform calendars and a shared parking/charging resource ledger are not implemented. Create one listing per independently usable port; do not claim combined nameplate power when it is shared.

Opening schedules are daily, same-day windows. Pause for closures; no holiday calendar or individual maintenance blocks yet. Pending holds can be abused despite daily request limits; monitor response times and repeated cancellations. Hosts and drivers must check the dashboard: automated SMS/email/push notifications are not enabled.

For faults, incompatibility or no-show, use the support centre. Cancellation is self-service before arrival; after-start failures require support and operator coordination. No automatic billing/refund occurs. Never continue using damaged, wet or overheating equipment. Publication is not electrical certification.

## Next release priorities

1. Equipment/permission verification procedure with documented evidence, local tariff assessment and incident escalation before a commercial pilot.
2. Host alerts and arrival reminders; holiday/maintenance blocks; driver reporting of failed sessions.
3. Metered sessions from a trusted operator integration, authenticated device events, deduplication, timeouts, start/stop confirmation and invoice-grade energy records.
4. Payments, refunds, dispute handling and clear applicable cancellation policies; do not charge estimated energy as if it were measured.
5. Multi-port/shared-load inventory and linked-bay exclusions if parking and charging ever share the same physical resource.
6. Measure accepted requests, response time, failed arrivals, observed availability, repeat use, complaints and net host/platform contribution before wider rollout.

## Verification

Unit/SQL tests cover pricing, India-time windows, invalid dates, overlapping/adjacent bookings, expired holds, ownership on acceptance, paused listings and preservation of price snapshots. The local-only API integration test exercises authentication, public address redaction, uploads, review, guest requests, invalid model category/rate/energy, conflict handling, host acceptance, cancellation and rate changes. Browser checks cover navigation and forms. These checks do not certify electrical installations, test physical chargers, complete a real payment or prove production authentication for every user.
