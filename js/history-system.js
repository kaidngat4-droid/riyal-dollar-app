/* ============================================
   PRICE HISTORY SYSTEM - v2.0
   Real Historical Data + IndexedDB Storage
   Replaces Math.random() with actual stored data
   ============================================ */

class PriceHistorySystem {
    constructor() {
        this.dbName = 'RiyalDollarDB';
        this.dbVersion = 1;
        this.db = null;
        this.maxHistoryDays = 90;
        this.init();
    }

    async init() {
        await this.initDB();
        this.startDataCollection();
    }

    // Initialize IndexedDB
    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Price history store
                if (!db.objectStoreNames.contains('priceHistory')) {
                    const historyStore = db.createObjectStore('priceHistory', { keyPath: 'id', autoIncrement: true });
                    historyStore.createIndex('currency', 'currency', { unique: false });
                    historyStore.createIndex('region', 'region', { unique: false });
                    historyStore.createIndex('date', 'date', { unique: false });
                    historyStore.createIndex('currencyRegion', ['currency', 'region'], { unique: false });
                }

                // Daily snapshots store
                if (!db.objectStoreNames.contains('dailySnapshots')) {
                    const snapshotStore = db.createObjectStore('dailySnapshots', { keyPath: 'date' });
                    snapshotStore.createIndex('currency', 'currency', { unique: false });
                }

                // Price changes store (for sparklines)
                if (!db.objectStoreNames.contains('priceChanges')) {
                    const changesStore = db.createObjectStore('priceChanges', { keyPath: 'id', autoIncrement: true });
                    changesStore.createIndex('currency', 'currency', { unique: false });
                    changesStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    }

    // Store price snapshot
    async storePriceSnapshot(currency, region, buyPrice, sellPrice, source = 'api') {
        if (!this.db) return;

        const now = new Date();
        const snapshot = {
            currency,
            region,
            buyPrice,
            sellPrice,
            midPrice: (buyPrice + sellPrice) / 2,
            spread: sellPrice - buyPrice,
            source,
            timestamp: now.getTime(),
            date: now.toISOString().split('T')[0],
            hour: now.getHours()
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['priceHistory'], 'readwrite');
            const store = transaction.objectStore('priceHistory');
            const request = store.add(snapshot);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Get price history for a currency/region
    async getPriceHistory(currency, region, days = 30) {
        if (!this.db) return [];

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const cutoffTimestamp = cutoffDate.getTime();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['priceHistory'], 'readonly');
            const store = transaction.objectStore('priceHistory');
            const index = store.index('currencyRegion');

            const range = IDBKeyRange.bound([currency, region], [currency, region]);
            const request = index.openCursor(range);

            const results = [];
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    if (cursor.value.timestamp >= cutoffTimestamp) {
                        results.push(cursor.value);
                    }
                    cursor.continue();
                } else {
                    resolve(results.sort((a, b) => a.timestamp - b.timestamp));
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    // Get daily average for a date range
    async getDailyAverages(currency, region, days = 30) {
        const history = await this.getPriceHistory(currency, region, days);

        // Group by date
        const dailyGroups = {};
        history.forEach(record => {
            if (!dailyGroups[record.date]) {
                dailyGroups[record.date] = [];
            }
            dailyGroups[record.date].push(record);
        });

        // Calculate daily averages
        return Object.entries(dailyGroups).map(([date, records]) => {
            const avgBuy = records.reduce((sum, r) => sum + r.buyPrice, 0) / records.length;
            const avgSell = records.reduce((sum, r) => sum + r.sellPrice, 0) / records.length;
            const avgMid = records.reduce((sum, r) => sum + r.midPrice, 0) / records.length;

            return {
                date,
                avgBuy: Math.round(avgBuy * 100) / 100,
                avgSell: Math.round(avgSell * 100) / 100,
                avgMid: Math.round(avgMid * 100) / 100,
                minBuy: Math.min(...records.map(r => r.buyPrice)),
                maxSell: Math.max(...records.map(r => r.sellPrice)),
                count: records.length
            };
        }).sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    // Get sparkline data (last 20 points)
    async getSparklineData(currency, region, points = 20) {
        const history = await this.getPriceHistory(currency, region, 7); // Last 7 days

        // Take last N points evenly spaced
        if (history.length <= points) return history.map(r => r.midPrice);

        const step = Math.floor(history.length / points);
        const sparklineData = [];
        for (let i = 0; i < points; i++) {
            const index = history.length - 1 - (i * step);
            if (index >= 0) {
                sparklineData.unshift(history[index].midPrice);
            }
        }
        return sparklineData;
    }

    // Calculate real change (not random!)
    async calculateRealChange(currency, region) {
        const history = await this.getPriceHistory(currency, region, 1); // Last 24 hours

        if (history.length < 2) {
            return { change: 0, changePct: 0, trend: 'stable' };
        }

        const latest = history[history.length - 1];
        const previous = history[0];

        const change = latest.midPrice - previous.midPrice;
        const changePct = previous.midPrice !== 0 ? (change / previous.midPrice) * 100 : 0;

        return {
            change: Math.round(change * 100) / 100,
            changePct: Math.round(changePct * 100) / 100,
            trend: change > 0.01 ? 'up' : change < -0.01 ? 'down' : 'stable',
            previousPrice: previous.midPrice,
            currentPrice: latest.midPrice
        };
    }

    // Clean old data (keep only last 90 days)
    async cleanupOldData() {
        if (!this.db) return;

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.maxHistoryDays);
        const cutoffTimestamp = cutoffDate.getTime();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['priceHistory'], 'readwrite');
            const store = transaction.objectStore('priceHistory');
            const request = store.openCursor();

            let deletedCount = 0;
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    if (cursor.value.timestamp < cutoffTimestamp) {
                        cursor.delete();
                        deletedCount++;
                    }
                    cursor.continue();
                } else {
                    console.log(`[History] Cleaned up ${deletedCount} old records`);
                    resolve(deletedCount);
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    // Start automatic data collection
    startDataCollection() {
        // Collect data every 5 minutes
        setInterval(() => this.collectCurrentPrices(), 300000);

        // Cleanup old data daily
        setInterval(() => this.cleanupOldData(), 86400000);

        // Initial collection
        this.collectCurrentPrices();
    }

    async collectCurrentPrices() {
        // Collect from CONFIG.LOCAL_RATES
        const regions = Object.keys(CONFIG.LOCAL_RATES || {});
        const currencies = ['USD', 'SAR', 'EUR', 'AED', 'GBP', 'KWD'];

        for (const region of regions) {
            for (const currency of currencies) {
                const rates = CONFIG.LOCAL_RATES[region]?.[currency];
                if (rates && rates.buy && rates.sell) {
                    await this.storePriceSnapshot(currency, region, rates.buy, rates.sell, 'local');
                }
            }

            // Collect gold prices
            const gold = CONFIG.LOCAL_RATES[region]?.gold;
            if (gold) {
                if (gold['21k']?.buy) {
                    await this.storePriceSnapshot('GOLD21', region, gold['21k'].buy, gold['21k'].sell || gold['21k'].buy, 'local');
                }
                if (gold['24k']?.buy) {
                    await this.storePriceSnapshot('GOLD24', region, gold['24k'].buy, gold['24k'].sell || gold['24k'].buy, 'local');
                }
            }
        }

        console.log('[History] Price snapshot collected at', new Date().toLocaleTimeString('ar-YE'));
    }

    // Generate chart data for Chart.js or Canvas
    async generateChartData(currency, region, period = '1M') {
        const days = period === '1D' ? 1 : period === '1W' ? 7 : period === '1M' ? 30 : 365;
        const averages = await this.getDailyAverages(currency, region, days);

        return {
            labels: averages.map(a => {
                const date = new Date(a.date);
                return period === '1D' ? date.toLocaleTimeString('ar-YE', { hour: '2-digit' }) :
                       period === '1W' ? date.toLocaleDateString('ar-YE', { weekday: 'short' }) :
                       date.toLocaleDateString('ar-YE', { month: 'short', day: 'numeric' });
            }),
            datasets: [
                {
                    label: 'متوسط الشراء',
                    data: averages.map(a => a.avgBuy),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'متوسط البيع',
                    data: averages.map(a => a.avgSell),
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'متوسط الوسط',
                    data: averages.map(a => a.avgMid),
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.4,
                    borderDash: [5, 5]
                }
            ]
        };
    }

    // Export data for analysis
    async exportData(currency, region, format = 'json') {
        const history = await this.getPriceHistory(currency, region, 30);

        if (format === 'csv') {
            let csv = 'Date,Time,Buy,Sell,Mid,Spread,Source\n';
            history.forEach(r => {
                const date = new Date(r.timestamp);
                csv += `${r.date},${date.toLocaleTimeString('ar-YE')},${r.buyPrice},${r.sellPrice},${r.midPrice},${r.spread},${r.source}\n`;
            });
            return csv;
        }

        return JSON.stringify(history, null, 2);
    }
}

// ============================================
// FIXED: Replace Math.random() in app.js
// ============================================

// Original (WRONG):
// const change = (Math.random() - 0.5) * 5;
// dom.goldChange.innerHTML = `...`;

// Fixed (CORRECT) - using PriceHistorySystem:
async function updateMetalsDisplayFixed() {
    const history = new PriceHistorySystem();

    const gold = state.goldPrice;
    const silver = state.silverPrice;
    const yerRate = state.rates.YER || CONFIG.YER_RATE;

    // Get real change from history instead of random
    const goldChange = await history.calculateRealChange('GOLD21', 'sanaa');
    const silverChange = await history.calculateRealChange('SILVER', 'sanaa');

    // Gold display
    if (dom.goldPriceUsd) dom.goldPriceUsd.textContent = formatNumber(gold, '$');
    if (dom.goldChange) {
        const change = goldChange.change || 0;
        const pct = goldChange.changePct || 0;
        const isUp = change >= 0;

        dom.goldChange.innerHTML = `
            <span class="change-icon">${isUp ? '▲' : '▼'}</span>
            <span class="change-value" style="color: ${isUp ? 'var(--success)' : 'var(--danger)'}">${Math.abs(change).toFixed(2)}</span>
            <span class="change-percent">(${isUp ? '+' : ''}${pct}%)</span>
        `;
    }

    // Silver display
    if (dom.silverPriceUsd) dom.silverPriceUsd.textContent = formatNumber(silver, '$');
    if (dom.silverChange) {
        const change = silverChange.change || 0;
        const pct = silverChange.changePct || 0;
        const isUp = change >= 0;

        dom.silverChange.innerHTML = `
            <span class="change-icon">${isUp ? '▲' : '▼'}</span>
            <span class="change-value" style="color: ${isUp ? 'var(--success)' : 'var(--danger)'}">${Math.abs(change).toFixed(2)}</span>
            <span class="change-percent">(${isUp ? '+' : ''}${pct}%)</span>
        `;
    }

    // ... rest of display logic
}

// Fixed sparklines using real data
async function drawSparklinesFixed(rates) {
    const history = new PriceHistorySystem();

    for (const rate of rates) {
        const canvas = document.getElementById(`spark-${rate.code}`);
        if (!canvas) continue;

        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;

        // Get real sparkline data
        const points = await history.getSparklineData(rate.code, 'global', 20);

        if (points.length < 2) continue;

        const min = Math.min(...points);
        const max = Math.max(...points);
        const range = max - min || 1;

        ctx.clearRect(0, 0, w, h);
        ctx.beginPath();

        // Determine color based on trend
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
    }
}

// ============================================
// FIXED: Real chart data generation
// ============================================

async function generateRealChartData(period, currency = 'USD', region = 'sanaa') {
    const history = new PriceHistorySystem();
    return await history.generateChartData(currency, region, period);
}

// ============================================
// Export for use in app.js
// ============================================

window.PriceHistorySystem = PriceHistorySystem;
window.updateMetalsDisplayFixed = updateMetalsDisplayFixed;
window.drawSparklinesFixed = drawSparklinesFixed;
window.generateRealChartData = generateRealChartData;
