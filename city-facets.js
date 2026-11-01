/* Data-backed city choices and address suggestions. No geocoding or paid APIs. */
(function () {
  'use strict';
  const INCLUDED_CITY = 'Vancouver'; // Bundled, refreshed data/vancouver-sites.json.
  const normalize = value => String(value == null ? '' : value).trim().replace(/\s+/g, ' ');
  const key = value => normalize(value).toLocaleLowerCase('en-CA');

  function availableCities(rows) {
    const cities = new Map([[key(INCLUDED_CITY), INCLUDED_CITY]]);
    for (const row of Array.isArray(rows) ? rows : []) {
      const city = normalize(row && row.city);
      const address = normalize(row && row.address);
      if (city && address && !cities.has(key(city))) {
        const display = /^[a-z]+(?:[ -][a-z]+)*$/.test(city)
          ? city.replace(/\b[a-z]/g, letter => letter.toUpperCase()) : city;
        cities.set(key(city), display);
      }
    }
    return [...cities.values()].sort((a, b) => a.localeCompare(b, 'en-CA'));
  }

  function suggestAddresses(rows, city, selectedYears, query, limit = 20) {
    const cityKey = key(city), search = key(query);
    if (!cityKey || search.length < 3 || !selectedYears || !selectedYears.size) return [];
    const unique = new Map();
    for (const row of Array.isArray(rows) ? rows : []) {
      if (!row || key(row.city) !== cityKey) continue;
      const address = normalize(row.address);
      const year = String(row.date || '').slice(0, 4);
      if (!address || !selectedYears.has(year) || !key(address).includes(search)) continue;
      if (!unique.has(key(address))) unique.set(key(address), address);
    }
    return [...unique.values()]
      .sort((a, b) => Number(key(b).startsWith(search)) - Number(key(a).startsWith(search)) || a.localeCompare(b, 'en-CA'))
      .slice(0, Math.max(0, Math.min(20, limit)));
  }

  function attach(doc, getPermits) {
    const citySelect = doc.getElementById('cityChoice');
    const searchInput = doc.getElementById('search');
    const suggestions = doc.getElementById('addressSuggestions');
    if (!citySelect || !searchInput || !suggestions) return null;
    const yearInputs = [...doc.querySelectorAll('#permitYears input')];
    function refreshCities() {
      const previous = key(citySelect.value);
      const cities = availableCities(getPermits());
      const placeholder = doc.createElement('option');
      placeholder.value = ''; placeholder.textContent = 'Select city'; placeholder.disabled = true;
      const options = cities.map(city => {
        const option = doc.createElement('option');
        option.value = city; option.textContent = city;
        return option;
      });
      citySelect.replaceChildren(placeholder, ...options);
      citySelect.value = cities.find(city => key(city) === previous) || '';
    }
    function refreshSuggestions() {
      const years = new Set(yearInputs.filter(input => input.checked).map(input => input.value));
      const addresses = suggestAddresses(getPermits(), citySelect.value, years, searchInput.value);
      suggestions.replaceChildren(...addresses.map(address => {
        const option = doc.createElement('option');
        option.value = address; return option;
      }));
    }
    searchInput.addEventListener('input', refreshSuggestions);
    citySelect.addEventListener('change', refreshSuggestions);
    for (const input of yearInputs) input.addEventListener('change', refreshSuggestions);
    doc.addEventListener('scrappy:permits-updated', () => { refreshCities(); refreshSuggestions(); });
    refreshCities(); refreshSuggestions();
    return { refreshCities, refreshSuggestions };
  }

  const api = { availableCities, suggestAddresses, attach };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else if (typeof document !== 'undefined') attach(document, () => permits);
}());