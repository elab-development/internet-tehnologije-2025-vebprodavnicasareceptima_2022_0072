const API_URL = 'https://open.er-api.com/v6/latest/USD';

/**
 * Fetch exchange rates with USD as base currency.
 * Returns: { base: 'USD', rates: { EUR: 0.92, RSD: 108.5, ... }, updatedAt: number }
 */
export async function fetchUsdRates(signal) {
  const res = await fetch(API_URL, { signal });
  if (!res.ok) {
    throw new Error(`Currency API error: ${res.status}`);
  }

  const data = await res.json();

  if (!data || data.result !== 'success' || !data.rates) {
    throw new Error('Currency API returned invalid response.');
  }

  const rates = data.rates;
  rates.USD = 1;

  return {
    base: data.base_code || 'USD',
    rates,
    updatedAt: Number(data.time_last_update_unix || Date.now() / 1000) * 1000,
  };
}
