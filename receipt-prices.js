// Receipt-derived CAD/lb observations. No receipt image or customer details are bundled.
(() => {
  const observations = [
    {
      id: 'capital-salvage-2026-10-25-aluminum-radiator',
      yard: 'Capital Salvage',
      metal: 'Aluminum radiator',
      weight: 3,
      paid: 1.65,
      date: '2026-10-25',
      reference: 'User-provided Capital Salvage receipt dated 2026-10-25',
      source: 'receipt',
      currency: 'CAD',
      unit: 'lb'
    },
    {
      id: 'capital-salvage-2026-10-25-copper-breakage',
      yard: 'Capital Salvage',
      metal: 'Copper breakage',
      weight: 1,
      paid: 0.15,
      date: '2026-10-25',
      reference: 'User-provided Capital Salvage receipt dated 2026-10-25',
      source: 'receipt',
      currency: 'CAD',
      unit: 'lb'
    },
    {
      id: 'capital-salvage-2026-10-25-electric-motors',
      yard: 'Capital Salvage',
      metal: 'Electric motors',
      weight: 1,
      paid: 0.40,
      date: '2026-10-25',
      reference: 'User-provided Capital Salvage receipt dated 2026-10-25',
      source: 'receipt',
      currency: 'CAD',
      unit: 'lb'
    }
  ];
  const importKey = 'scrappy-imported-receipt-prices-v1';
  const imported = new Set(read(importKey));
  const normalize = value => String(value || '').trim().toLowerCase();
  const sameCategory = (a, b) =>
    normalize(a.yard) === normalize(b.yard) &&
    normalize(a.metal) === normalize(b.metal);
  let pricesChanged = false;
  let importsChanged = false;

  for (const observation of observations) {
    // Import once so reloads do not duplicate or restore a deleted observation.
    if (imported.has(observation.id)) continue;
    const latest = prices.filter(price => sameCategory(price, observation))
      .sort((a, b) => String(b.date).localeCompare(String(a.date)))[0];
    // Preserve any local observation from the same date or a later date.
    if (!latest || String(latest.date) < observation.date) {
      prices.push({
        ...observation,
        yard: latest ? latest.yard : observation.yard,
        metal: latest ? latest.metal : observation.metal
      });
      pricesChanged = true;
    }
    imported.add(observation.id);
    importsChanged = true;
  }
  if (pricesChanged) {
    save('scrappy-prices-v1', prices);
    showPrices();
  }
  if (importsChanged) save(importKey, [...imported]);
})();
