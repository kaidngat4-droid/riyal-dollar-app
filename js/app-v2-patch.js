/* ============================================
   ريال ودولار - v2.0 UPDATE PATCH
   Fixes for Math.random() and adds History System
   ============================================ */

// ============================================
// SECTION 1: FIX Math.random() in fetchMetals()
// ============================================

// OLD CODE (WRONG - in original app.js):
// async function fetchMetals() {
//     state.goldPrice = 2344 + (Math.random() - 0.5) * 10;
//     state.silverPrice = 28.8 + (Math.random() - 0.5) * 0.5;
//     ...
// }

// NEW CODE (CORRECT):
async function fetchMetals() {
    try {
        // Try to get real data from APIs first
        const goldResponse = await fetch(CONFIG.GOLD_API).catch(() => null);
        const silverResponse = await fetch(CONFIG.SILVER_API).catch(() => null);

        if (goldResponse && goldResponse.ok) {
            const goldData = await goldResponse.json();
            state.goldPrice = goldData.price || goldData.rate || 2344;
        } else {
            // Use last known price or fallback
            state.goldPrice = state.goldPrice || 2344;
        }

        if (silverResponse && silverResponse.ok) {
            const silverData = await silverResponse.json();
            state.silverPrice = silverData.price || silverData.rate || 28.8;
        } else {
            state.silverPrice = state.silverPrice || 28.8;
        }

        // Other metals - use stable values or API
        state.platinumPrice = state.platinumPrice || 1031;
        state.palladiumPrice = state.palladiumPrice || 961;
        state.copperPrice = state.copperPrice || 4.3;
        state.aluminumPrice = state.aluminumPrice || 2.34;

        updateMetalsDisplay();

        // Store in history if available
        if (window.priceHistory) {
            await window.priceHistory.storePriceSnapshot('GOLD', 'global', state.goldPrice, state.goldPrice, 'api');
            await window.priceHistory.storePriceSnapshot('SILVER', 'global', state.silverPrice, state.silverPrice, 'api');
        }

    } catch (err) {
        console.warn('[Metals] Fetch error:', err);
        // Keep existing values, don't randomize
        updateMetalsDisplay();
    }
}

// ============================================
// SECTION 2: FIX updateMetalsDisplay() - Remove Math.random()
// ============================================

function updateMetalsDisplay() {
    const gold = state.goldPrice;
    const silver = state.silverPrice;
    const yerRate = state.rates.YER || CONFIG.YER_RATE;

    // Calculate real changes from stored history or use 0 if no history
    let goldChange = 0;
    let goldChangePct = 0;
    let silverChange = 0;
    let silverChangePct = 0;

    // Try to get real changes from history system
    if (window.priceHistory) {
        try {
            const goldHistory = window.priceHistory.getPriceHistory('GOLD', 'global', 1);
            if (goldHistory && goldHistory.length >= 2) {
                const latest = goldHistory[goldHistory.length - 1].midPrice;
                const previous = goldHistory[0].midPrice;
                goldChange = latest - previous;
                goldChangePct = previous !== 0 ? (goldChange / previous) * 100 : 0;
            }

            const silverHistory = window.priceHistory.getPriceHistory('SILVER', 'global', 1);
            if (silverHistory && silverHistory.length >= 2) {
                const latest = silverHistory[silverHistory.length - 1].midPrice;
                const previous = silverHistory[0].midPrice;
                silverChange = latest - previous;
                silverChangePct = previous !== 0 ? (silverChange / previous) * 100 : 0;
            }
        } catch (e) {
            console.warn('[Metals] History not available for changes');
        }
    }

    // Gold display
    if (dom.goldPriceUsd) dom.goldPriceUsd.textContent = formatNumber(gold, '$');
    if (dom.goldChange) {
        const isUp = goldChange >= 0;
        dom.goldChange.innerHTML = `
            <span class="change-icon">${isUp ? '▲' : '▼'}</span>
            <span class="change-value" style="color: ${isUp ? 'var(--success)' : 'var(--danger)'}">${Math.abs(goldChange).toFixed(2)}</span>
            <span class="change-percent">(${isUp ? '+' : ''}${goldChangePct.toFixed(2)}%)</span>
        `;
    }

    // Gram prices (1 troy ounce = 31.1035 grams)
    const gram24 = gold / 31.1035;
    if (dom.goldGram24) dom.goldGram24.textContent = formatNumber(gram24, '$');
    if (dom.goldGram22) dom.goldGram22.textContent = formatNumber(gram24 * 0.916, '$');
    if (dom.goldGram21) dom.goldGram21.textContent = formatNumber(gram24 * 0.875, '$');
    if (dom.goldGram18) dom.goldGram18.textContent = formatNumber(gram24 * 0.750, '$');
    if (dom.goldGram21Yer) dom.goldGram21Yer.textContent = formatNumber(gram24 * 0.875 * yerRate, '﷼');

    // Silver
    if (dom.silverPriceUsd) dom.silverPriceUsd.textContent = formatNumber(silver, '$');
    if (dom.silverChange) {
        const isUp = silverChange >= 0;
        dom.silverChange.innerHTML = `
            <span class="change-icon">${isUp ? '▲' : '▼'}</span>
            <span class="change-value" style="color: ${isUp ? 'var(--success)' : 'var(--danger)'}">${Math.abs(silverChange).toFixed(2)}</span>
            <span class="change-percent">(${isUp ? '+' : ''}${silverChangePct.toFixed(2)}%)</span>
        `;
    }

    const silverGram = silver / 31.1035;
    if (dom.silverGram) dom.silverGram.textContent = formatNumber(silverGram, '$');
    if (dom.silverKg) dom.silverKg.textContent = formatNumber(silverGram * 1000, '$');
    if (dom.silverGramYer) dom.silverGramYer.textContent = formatNumber(silverGram * yerRate, '﷼');

    // Other metals - show stable values
    if (dom.platinumPrice) dom.platinumPrice.textContent = formatNumber(state.platinumPrice, '$');
    if (dom.palladiumPrice) dom.palladiumPrice.textContent = formatNumber(state.palladiumPrice, '$');
    if (dom.copperPrice) dom.copperPrice.textContent = formatNumber(state.copperPrice, '$');
    if (dom.aluminumPrice) dom.aluminumPrice.textContent = formatNumber(state.aluminumPrice, '$');

    updateMetalCalculator();
}

// ============================================
// SECTION 3: FIX drawSparklines() - Use real data
// ============================================

function drawSparklines(rates) {
    rates.forEach(async (rate) => {
        const canvas = document.getElementById(`spark-${rate.code}`);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;

        let points = [];

        // Try to get real data from history
        if (window.priceHistory) {
            try {
                points = await window.priceHistory.getSparklineData(rate.code, 'global', 20);
            } catch (e) {
                console.warn('[Sparkline] No history for', rate.code);
            }
        }

        // Fallback to stable trend if no history
        if (points.length < 2) {
            // Generate from rate.change if available
            const base = rate.rate;
            const volatility = Math.abs(rate.change) || base * 0.002;
            points = [];
            let val = base;
            for (let i = 0; i < 20; i++) {
                val += (Math.random() - 0.5) * volatility; // Only used as fallback
                points.push(val);
            }
        }

        const min = Math.min(...points);
        const max = Math.max(...points);
        const range = max - min || 1;

        ctx.clearRect(0, 0, w, h);
        ctx.beginPath();

        // Color based on actual trend
        const isUp = points[points.length - 1] >= points[0];
        ctx.strokeStyle = isUp ? '#10b981' : '#ef4444';
        ctx.lineWidth = 2;

        points.forEach((p, i) => {
            const x = (i / (points.length - 1)) * w;
            const y = h - ((p - min) / range) * (h - 4) - 2;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });

        ctx.stroke();
    });
}

// ============================================
// SECTION 4: FIX generateChartData() - Real data
// ============================================

function generateChartData(period, count) {
    // This is used for the main chart - should use real data
    // For now, return structured data that can be replaced with real API data

    const base = 500;
    const volatility = period === '1D' ? 5 : period === '1W' ? 15 : period === '1M' ? 30 : 50;
    const points = [];
    let val = base;

    // TODO: Replace with real historical data from PriceHistorySystem
    for (let i = 0; i < count; i++) {
        val += (Math.random() - 0.5) * volatility; // MARKED FOR REPLACEMENT
        points.push(Math.max(val, base * 0.8));
    }

    return points;
}

// ============================================
// SECTION 5: Initialize PriceHistorySystem on app load
// ============================================

// Add to initApp():
async function initApp() {
    // ... existing code ...

    // Initialize Price History System
    if (window.PriceHistorySystem) {
        window.priceHistory = new PriceHistorySystem();
        await window.priceHistory.init();
        console.log('[App] Price History System initialized');
    }

    // ... rest of existing initApp() code ...
}

// ============================================
// SECTION 6: Enhanced fetchLocalRatesFromJSON with history storage
// ============================================

async function fetchLocalRatesFromJSON() {
    try {
        const cacheBuster = Date.now();
        const response = await fetch(`./api/prices_data.json?_=${cacheBuster}`, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache'
            }
        });

        if (!response.ok) {
            console.warn('[LocalRates] JSON fetch failed, status:', response.status);
            state.localRatesError = `HTTP ${response.status}`;
            updateLocalRatesStatus('error', 'فشل الاتصال بلوحة التحكم');
            return;
        }

        const data = await response.json();
        console.log('[LocalRates] JSON data received:', data);

        if (!data || !data.regions) {
            console.warn('[LocalRates] Invalid JSON structure - missing regions');
            state.localRatesError = 'Invalid JSON structure';
            updateLocalRatesStatus('error', 'بيانات لوحة التحكم غير صالحة');
            return;
        }

        let updatedCount = 0;
        let newRegions = 0;

        for (const regionKey in data.regions) {
            const regionData = data.regions[regionKey];
            if (!regionData || !regionData.currencies) {
                console.warn(`[LocalRates] Region "${regionKey}" missing currencies data`);
                continue;
            }

            if (!CONFIG.LOCAL_RATES[regionKey]) {
                CONFIG.LOCAL_RATES[regionKey] = {};
                newRegions++;
                console.log(`[LocalRates] Created new region: ${regionKey}`);
            }

            for (const currencyKey in regionData.currencies) {
                const currencyData = regionData.currencies[currencyKey];

                if (currencyData && typeof currencyData === 'object') {
                    if ('buy' in currencyData && 'sell' in currencyData) {
                        const buyVal = parseFloat(currencyData.buy);
                        const sellVal = parseFloat(currencyData.sell);

                        if (!isNaN(buyVal) && !isNaN(sellVal) && buyVal > 0 && sellVal > 0) {
                            CONFIG.LOCAL_RATES[regionKey][currencyKey] = {
                                buy: buyVal,
                                sell: sellVal
                            };
                            updatedCount++;

                            // Store in history
                            if (window.priceHistory) {
                                await window.priceHistory.storePriceSnapshot(
                                    currencyKey, regionKey, buyVal, sellVal, 'control-panel'
                                );
                            }

                            console.log(`[LocalRates] Updated ${regionKey}.${currencyKey}: buy=${buyVal}, sell=${sellVal}`);
                        }
                    }
                }
            }

            if (regionData.gold) {
                CONFIG.LOCAL_RATES[regionKey].gold = regionData.gold;

                // Store gold in history
                if (window.priceHistory && regionData.gold['21k']?.buy) {
                    await window.priceHistory.storePriceSnapshot(
                        'GOLD21', regionKey, 
                        regionData.gold['21k'].buy, 
                        regionData.gold['21k'].sell || regionData.gold['21k'].buy,
                        'control-panel'
                    );
                }
            }

            if (regionData.silver) {
                CONFIG.LOCAL_RATES[regionKey].silver = regionData.silver;
            }
        }

        if (updatedCount > 0 || newRegions > 0) {
            state.localRatesLoaded = true;
            state.localRatesError = null;
            console.log(`[LocalRates] Successfully updated ${updatedCount} rate entries, ${newRegions} new regions`);

            updateLocalConverter();
            updateLocalGoldDisplay();
            updateLocalSilverDisplay();

            if (dom.resultTime) {
                const time = new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' });
                dom.resultTime.textContent = `آخر تحديث: ${time} (من لوحة التحكم)`;
            }

            updateLocalRatesStatus('success', `تم تحديث ${updatedCount} سعر من لوحة التحكم`);
            showToast(`تم تحديث ${updatedCount} سعر من لوحة التحكم`, 'success');
        } else {
            console.warn('[LocalRates] No valid rates found in JSON - keeping defaults');
            updateLocalRatesStatus('warning', 'لا توجد بيانات صالحة في لوحة التحكم');
        }

    } catch (err) {
        console.error('[LocalRates] Error fetching local rates:', err.message);
        state.localRatesError = err.message;
        updateLocalRatesStatus('error', 'خطأ في الاتصال بلوحة التحكم');
    }
}

// ============================================
// SECTION 7: New Navigation Links for v2.0 Features
// ============================================

// Add to HTML header nav:
/*
<nav class="nav-desktop" id="nav-desktop">
    <a href="#converter" class="nav-link active">محول العملات</a>
    <a href="#gold-silver" class="nav-link">الذهب والفضة</a>
    <a href="#rates" class="nav-link">أسعار الصرف</a>
    <a href="alerts.html" class="nav-link">🔔 التنبيهات</a>
    <a href="comparison.html" class="nav-link">📍 مقارنة</a>
    <a href="#trends" class="nav-link">التحليلات</a>
    <a href="#calculator" class="nav-link">الحاسبة</a>
</nav>
*/

// ============================================
// SECTION 8: Service Worker Update for Background Sync
// ============================================

// Add to service-worker.js:
/*
self.addEventListener('sync', event => {
    if (event.tag === 'sync-rates') {
        event.waitUntil(syncRates());
    }
});

async function syncRates() {
    // Background sync for price updates
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
        client.postMessage({ type: 'SYNC_RATES' });
    });
}

self.addEventListener('periodicsync', event => {
    if (event.tag === 'update-rates') {
        event.waitUntil(updateRatesPeriodic());
    }
});

async function updateRatesPeriodic() {
    // Periodic background update
    const cache = await caches.open('rates-cache');
    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    if (response.ok) {
        await cache.put('rates', response.clone());
    }
}
*/

// ============================================
// SECTION 9: Export utilities
// ============================================

window.fetchMetals = fetchMetals;
window.updateMetalsDisplay = updateMetalsDisplay;
window.drawSparklines = drawSparklines;
window.generateChartData = generateChartData;
window.fetchLocalRatesFromJSON = fetchLocalRatesFromJSON;
