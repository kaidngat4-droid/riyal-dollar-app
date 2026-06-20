/* ============================================
   DATA FETCHER - v2.0
   Fetches prices from prices_data.json (admin panel)
   Replaces hardcoded values in app.js with real data
   ============================================ */

class DataFetcher {
    constructor() {
        this.apiUrl = './api/prices_data.json';
        this.fallbackUrl = 'https://raw.githubusercontent.com/kaidngat4-droid/riyal-dollar-app/main/api/prices_data.json';
        this.lastData = null;
        this.listeners = [];
    }

    async init() {
        await this.fetchData();
        // Auto-refresh every 30 seconds
        setInterval(() => this.fetchData(), 30000);
    }

    async fetchData() {
        try {
            // Try local first
            let response = await fetch(`${this.apiUrl}?_=${Date.now()}`, {
                headers: { 'Cache-Control': 'no-cache' }
            });

            // Fallback to GitHub if local fails
            if (!response.ok) {
                response = await fetch(`${this.fallbackUrl}?_=${Date.now()}`, {
                    headers: { 'Cache-Control': 'no-cache' }
                });
            }

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            this.lastData = data;

            // Update CONFIG.LOCAL_RATES dynamically
            this.updateLocalRates(data);

            // Update global rates if available
            this.updateGlobalRates(data);

            // Update metals
            this.updateMetals(data);

            // Store in history
            if (window.priceHistory) {
                await this.storeInHistory(data);
            }

            // Notify listeners
            this.listeners.forEach(cb => cb(data));

            return data;

        } catch (err) {
            console.warn('[DataFetcher] Failed to fetch:', err.message);
            // Use last known data or fallback
            if (this.lastData) {
                this.updateLocalRates(this.lastData);
            }
            return this.lastData;
        }
    }

    updateLocalRates(data) {
        if (!data || !data.regions) return;

        for (const [regionKey, regionData] of Object.entries(data.regions)) {
            if (!CONFIG.LOCAL_RATES[regionKey]) {
                CONFIG.LOCAL_RATES[regionKey] = {};
            }

            // Update currencies
            if (regionData.currencies) {
                for (const [curr, rates] of Object.entries(regionData.currencies)) {
                    if (rates && typeof rates === 'object' && 'buy' in rates && 'sell' in rates) {
                        CONFIG.LOCAL_RATES[regionKey][curr] = {
                            buy: parseFloat(rates.buy) || 0,
                            sell: parseFloat(rates.sell) || 0
                        };
                    }
                }
            }

            // Update gold
            if (regionData.gold) {
                CONFIG.LOCAL_RATES[regionKey].gold = {};
                for (const [karat, prices] of Object.entries(regionData.gold)) {
                    if (prices && typeof prices === 'object') {
                        CONFIG.LOCAL_RATES[regionKey].gold[karat] = {
                            buy: parseFloat(prices.buy) || 0,
                            sell: parseFloat(prices.sell) || 0
                        };
                    }
                }
            }

            // Update silver
            if (regionData.silver) {
                CONFIG.LOCAL_RATES[regionKey].silver = {
                    buy: parseFloat(regionData.silver.buy) || 0,
                    sell: parseFloat(regionData.silver.sell) || 0
                };
            }
        }

        // Update UI if available
        if (typeof updateLocalConverter === 'function') updateLocalConverter();
        if (typeof updateLocalGoldDisplay === 'function') updateLocalGoldDisplay();
        if (typeof updateLocalSilverDisplay === 'function') updateLocalSilverDisplay();

        // Update status
        if (typeof updateLocalRatesStatus === 'function') {
            updateLocalRatesStatus('success', 'تم تحديث الأسعار من لوحة التحكم');
        }
    }

    updateGlobalRates(data) {
        if (!data.currencies) return;

        for (const curr of data.currencies) {
            if (curr.code && curr.price_yer) {
                // Update RATES_TABLE_DATA if exists
                const rateEntry = RATES_TABLE_DATA.find(r => r.code === curr.code);
                if (rateEntry) {
                    rateEntry.rate = curr.price_yer / (state.rates.YER || CONFIG.YER_RATE);
                    rateEntry.change = curr.change_24h || 0;
                    rateEntry.changePct = curr.change_percent || 0;
                }

                // Update state.rates
                if (state.rates && curr.code !== 'YER') {
                    state.rates[curr.code] = curr.price_yer / (state.rates.YER || CONFIG.YER_RATE);
                }
            }
        }

        if (typeof updateRatesTable === 'function') updateRatesTable();
        if (typeof updateQuickConversions === 'function') updateQuickConversions();
    }

    updateMetals(data) {
        if (!data) return;

        // Update gold price
        if (data.gold?.ounce?.price_usd) {
            state.goldPrice = parseFloat(data.gold.ounce.price_usd);
        }

        // Update silver price
        if (data.silver?.price_usd) {
            state.silverPrice = parseFloat(data.silver.price_usd);
        }

        // Update other metals
        if (data.metals) {
            for (const metal of data.metals) {
                switch(metal.code) {
                    case 'XPT': state.platinumPrice = parseFloat(metal.price_usd) || state.platinumPrice; break;
                    case 'XPD': state.palladiumPrice = parseFloat(metal.price_usd) || state.palladiumPrice; break;
                    case 'AL': state.aluminumPrice = parseFloat(metal.price_usd) || state.aluminumPrice; break;
                    case 'HG': state.copperPrice = parseFloat(metal.price_usd) || state.copperPrice; break;
                }
            }
        }

        if (typeof updateMetalsDisplay === 'function') updateMetalsDisplay();
    }

    async storeInHistory(data) {
        if (!window.priceHistory) return;

        const timestamp = Date.now();
        const date = new Date().toISOString().split('T')[0];

        // Store currency rates
        for (const [regionKey, regionData] of Object.entries(data.regions || {})) {
            for (const [curr, rates] of Object.entries(regionData.currencies || {})) {
                if (rates.buy && rates.sell) {
                    await window.priceHistory.storePriceSnapshot(curr, regionKey, rates.buy, rates.sell, 'admin-panel');
                }
            }

            // Store gold
            if (regionData.gold) {
                for (const [karat, prices] of Object.entries(regionData.gold)) {
                    if (prices.buy) {
                        await window.priceHistory.storePriceSnapshot(`GOLD${karat}`, regionKey, prices.buy, prices.sell || prices.buy, 'admin-panel');
                    }
                }
            }
        }

        // Store global metals
        if (data.gold?.ounce?.price_usd) {
            await window.priceHistory.storePriceSnapshot('GOLD', 'global', data.gold.ounce.price_usd, data.gold.ounce.price_usd, 'admin-panel');
        }
        if (data.silver?.price_usd) {
            await window.priceHistory.storePriceSnapshot('SILVER', 'global', data.silver.price_usd, data.silver.price_usd, 'admin-panel');
        }
    }

    onUpdate(callback) {
        this.listeners.push(callback);
    }

    getLastData() {
        return this.lastData;
    }
}

// Initialize on load
window.dataFetcher = new DataFetcher();

// Auto-init when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.dataFetcher) {
        window.dataFetcher.init();
    }
});
/* ============================================
   FETCHER - Global Rates Fetcher
   ============================================ */

const GLOBAL_API_URL = './api/prices_data.json';
const FALLBACK_APIS = {
  exchange: 'https://api.frankfurter.app/latest?from=USD',
  gold: 'https://api.gold-api.com/price/XAU',
  silver: 'https://api.gold-api.com/price/XAG'
};

async function fetchGlobalRates() {
  try {
    // المحاولة 1: من prices_data.json (أسرع - محلي)
    const localRes = await fetch(`${GLOBAL_API_URL}?_=${Date.now()}`, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    
    if (localRes.ok) {
      const data = await localRes.json();
      if (data.global) {
        console.log('[Fetcher] Loaded from local JSON');
        return data.global;
      }
    }

    // المحاولة 2: من APIs خارجية (fallback)
    console.log('[Fetcher] Falling back to external APIs...');
    return await fetchFromExternalAPIs();

  } catch (err) {
    console.error('[Fetcher] Error:', err);
    return null;
  }
}

async function fetchFromExternalAPIs() {
  try {
    const [exchangeRes, goldRes, silverRes] = await Promise.all([
      fetch(FALLBACK_APIS.exchange),
      fetch(FALLBACK_APIS.gold),
      fetch(FALLBACK_APIS.silver)
    ]);

    const exchangeData = exchangeRes.ok ? await exchangeRes.json() : null;
    const goldData = goldRes.ok ? await goldRes.json() : null;
    const silverData = silverRes.ok ? await silverRes.json() : null;

    return {
      last_update: new Date().toISOString(),
      source: 'external-apis',
      exchange: exchangeData?.rates || {},
      metals: {
        gold: { price: goldData?.price || 2344, change: 0, changePct: 0 },
        silver: { price: silverData?.price || 28.8, change: 0, changePct: 0 },
        platinum: { price: 1031, change: 0, changePct: 0 },
        palladium: { price: 961, change: 0, changePct: 0 }
      }
    };

  } catch (err) {
    console.error('[Fetcher] External APIs failed:', err);
    return null;
  }
}

// تصدير للاستخدام في app.js
window.fetchGlobalRates = fetchGlobalRates;
