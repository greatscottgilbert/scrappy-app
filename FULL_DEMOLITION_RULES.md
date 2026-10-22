# Full-building demolition eligibility rules

Scrappy's paid site discovery must include only **complete demolition of an entire building or separately identifiable standalone structure**.

## Inclusion
- Explicit full/complete/total demolition of a detached house, multi-unit building, commercial or industrial building, warehouse, or other entire standalone structure.
- Complete demolition of a distinct building within a larger complex, provided the entire separate building is removed.

## Exclusion
- Interior-only, selective, partial, facade, floor, wing, or structural-component demolition.
- Single apartment, condo, suite, commercial unit, tenant improvement, or unit-specific work.
- Renovations, alterations, deconstruction of a portion of a building, and demolition associated with a new project where whole-building removal is not explicitly confirmed.
- Permits cancelled, withdrawn, or rejected; treat status separately from eligibility.

## Conservative automated classification
- Never infer full demolition from a generic permit category of "demolition" alone.
- Require explicit whole-building evidence in structured permit fields or work description, and reject conflicting partial/unit terms.
- Ambiguous cases are `needs_review` and excluded from customer results until manually verified.
- Preserve original source text, source ID, and a decision reason privately for audit and corrections.
- Normalize addresses and distinguish an entire standalone building from an individual unit at that address.
- Permit import updates must never override crowdsourced site-progress stages.

## Test cases
- "Demolish existing single-family dwelling in its entirety" => include.
- "Complete demolition of standalone warehouse building B" => include.
- "Interior demolition of unit 210" => exclude.
- "Remove east wing of apartment complex" => exclude.
- "Demolition permit" with no scope => needs_review.
- "Demolish building" with conflicting suite-only scope => exclude or needs_review, never auto-include.
