# Parking and EV charging

## Product decision

Offer parking with optional charging for electric cars, scooters and motorcycles. Keep parking available independently: an EV driver may need only parking, and a host may have a bay without a charger. The first release adds discovery, vehicle filters, compatibility guidance and an illustrative energy/time/cost estimator. It does not sell or guarantee a charging session.

The existing EV amenity is a host declaration, not proof of compatibility, electrical inspection or real-time uptime. A two-wheeler parking filter only checks space eligibility; it does not certify that its battery or connector works with the equipment. Samples remain fictional.

## Required listing information before charging reservations

Store a separate charger record linked to a parking site: equipment make/model, connector/outlet standard, AC/DC, maximum and currently available power, voltage/current where relevant, supported vehicle models, cable provision and whether the driver must bring an approved portable charger. Record port count and simultaneous charging capacity separately. Photos should show the actual equipment and connector without exposing private identifiers.

Record charging opening hours, host assistance requirements, shared access, maintenance outages, last operator confirmation and independent review status. Existing chargers must default to unverified details, never acquire a verified badge automatically. An installation professional must assess supply capacity, earthing, protective devices and local requirements; this application cannot certify them from photos.

## Pricing and affordability

Hosts propose their rates, subject to applicable rules and operator agreements. Show parking and charging as separate amounts, not one ambiguous hourly price. Charging records need billing basis (included, per kWh, per session or per time), rate, minimum, session fee, taxes and any idle fee/grace period. Display the entire basis before consent. Do not label a price affordable without a relevant comparison.

An energy estimate is battery capacity multiplied by requested percentage change. Supply energy is higher due to losses; the public calculator uses an explicit illustrative 90% efficiency assumption. Actual billable energy requires a suitable meter/session record. Constant-power time is only an estimate: vehicle limits, tapering, temperature and shared power can change it. Do not promise a completed charge from a departure time alone. The calculator's sample ₹/kWh is not a tariff recommendation.

## Reservation design

Create charger-port reservations independently from parking reservations and confirm both atomically when sold together. A charger shared by several bays must have one inventory ledger. Pending holds need expiry and retries need idempotency keys. Host acceptance must recheck both resources and outages. Snapshot the accepted price basis, equipment, requested connector and cancellation conditions. Parking-only bookings must never silently consume or promise a charger.

Support explicit requested, accepted, arrived, charging, completed, cancelled and failed states. Do not infer that charging started merely because someone checked in. Start with operator-confirmed sessions; later add authenticated charger integration, signed session events, deduplicated meter readings and remote-stop controls. No live status or remote control should be advertised before an actual integration exists.

## Failures, support and commercial operation

Define what happens when a charger is occupied, offline, incompatible, inaccessible or delivers less power than advertised. Let the customer choose parking-only continuation when appropriate; record both parties' consent and calculate the adjustment from the original price snapshot. Failed-session refunds, cancellation fees, overstay and disputes need published rules and a real payment provider before collection. Notify customers of outages and changed access hours. Current parking requests do not include charger guarantees or charging payments.

Treat driver vehicle/model data and exact location as personal data with purpose limits, retention/deletion policies and restricted staff access. Avoid collecting battery diagnostics unless required. Never request that drivers use improvised adapters, unsafe extensions or unattended damaged equipment. Battery swapping and repair are separate services outside this feature.

## Rollout and measurements

Pilot with a small set of inspected, permissioned hosts and explicit connector/model combinations. Measure usable ports, host response time, failed arrivals, compatibility failures, uptime, delivered energy, support demand and repeat visits. Calculate margin after electricity, demand charges where relevant, equipment/installation, maintenance, connectivity, payment fees, support and refunds; gross charging receipts are not profit. Expand only after reliable access and support are demonstrated. Operator integrations and verified multi-port inventory should precede automatic instant charging reservations.

## Reference and limits

The Ministry of Power's [17 September 2024 EV charging guidelines](https://beeindia.gov.in/sites/default/files/Guidelines%20and%20Standards%20for%20EVCI%20dated%2017-09-2024_compressed.pdf) cover private, semi-public and public charging settings. Consult [BEE's EV resources](https://beeindia.gov.in/show_content.php?lang=1&level=2&lid=67&ls_id=345) and the applicable CEA electrical-safety requirements. Confirm current amendments, state electricity rules, property permissions and local requirements for each actual installation before offering paid charging. This is a product plan, not installation instructions or a legal compliance certification.
