# Charging equipment and outlet bookings

Reviewed 12 November 2026. Parking and charging remain separate services.

## Service types

- Power outlet: the driver brings a complete manufacturer-approved portable charger or portable EV charging unit. A loose cable is insufficient. Match the actual input plug, voltage, current, vehicle and circuit.
- AC equipment: check whether the station has an attached vehicle cable or requires a compatible driver-supplied cable. A car's onboard charger converts AC power.
- DC equipment: the station supplies the supported DC charging equipment and cable. The vehicle must support that connector and system.
- Other or unconfirmed equipment: obtain explicit host confirmation. Do not infer universal compatibility from a model or connector name.

## Implementation and review

Discovery filters use the explicit connector/outlet field. Outlet offerings require inspection and circuit details, persisted with the listing description. New outlet requests require a driver declaration and portable-charger details, stored in the immutable booking snapshot and shown to the host. Existing bookings keep their original snapshots. No database migration or modification of existing reservations is required.

The nominal 230 V multiplied by the stated outlet current is only a rejection ceiling for impossible advertised power. It does not certify a circuit, set a safe continuous load or establish compatibility. A qualified electrical professional must check the installation, earthing, protective devices, sanctioned load, weather exposure and actual continuous capacity. The reviewer checks this evidence before publication. Equipment changes require a replacement listing after existing commitments end.

Per-kWh offers need appropriate measured energy. Nameplate power multiplied by elapsed time is an estimate, not metering. The application does not currently provide live telemetry, remote control, automated billing or payments. Battery swapping and off-vehicle battery charging remain outside this booking service.

## Sources

- Ola portable charging and Hypercharger compatibility: https://www.olaelectric.com/faq
- Ather charger requirements and installation precautions: https://www.atherenergy.com/blog/electric-scooter-charging-requirements-tips
- Tata XPRES-T model-specific AC charging: https://xprest.tatamotors.com/electric/faq
- Ministry of Power installation and operating guidance: https://www.powermin.gov.in/static/uploads/2025/07/0778e46ab2a12de26bf3d9f2239db9c1.pdf

The exact vehicle manual, charger label and applicable requirements take precedence over illustrative examples. No manufacturer partnership or automatic model certification is claimed.
