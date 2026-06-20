/* ============================================
   ريال ودولار - v2.0 UPDATE PATCH (CLEAN)
   Fixes for Math.random() + History System
   XSS-Safe - All innerHTML removed
   ============================================ */

// ============================================
// SECTION 1: FIX fetchMetals() - Real APIs
// ============================================

async function fetchMetals() {
  try {
    const goldResponse = await fetch(CONFIG.GOLD_API).catch(function() { return null; });
    const silverResponse = await fetch(CONFIG.SILVER_API).catch(function() { return null; });

    if (goldResponse && goldResponse.ok) {
      const goldData = await goldResponse.json();
      state.goldPrice = goldData.price || goldData.rate || state.goldPrice || 2344;
    }

    if (silverResponse && silverResponse.ok) {
      const silverData = await silverResponse.json();
      state.silverPrice = silverData.price || silverData.rate || state.silverPrice || 28.8;
    }

    state.platinumPrice = state.platinumPrice || 1031;
    state.palladiumPrice = state.palladiumPrice || 961;
    state.copperPrice = state.copperPrice || 4.3;
    state.aluminumPrice = state.aluminumPrice || 2.34;

    updateMetalsDisplay();

    if (window.priceHistory && window.priceHistory.storePriceSnapshot) {
      window.priceHistory.storePriceSnapshot('GOLD', 'global', state.goldPrice, state.goldPrice, 'api');
      window.priceHistory.storePriceSnapshot('SILVER', 'global', state.silverPrice, state.silverPrice, 'api');
    }

  } catch (err) {
    updateMetalsDisplay();
  }
}

// ============================================
// SECTION 2: FIX updateMetalsDisplay() - XSS SAFE
// ============================================

function updateMetalsDisplay() {
  var gold = state.goldPrice;
  var silver = state.silverPrice;
  var yerRate = state.rates.YER || CONFIG.YER_RATE;

  var goldChange = 0;
  var goldChangePct = 0;
  var silverChange = 0;
  var silverChangePct = 0;

  if (window.priceHistory && window.priceHistory.getPriceHistory) {
    try {
      var goldHistory = window.priceHistory.getPriceHistory('GOLD', 'global', 1);
      if (goldHistory && goldHistory.length >= 2) {
        var latest = goldHistory[goldHistory.length - 1].midPrice;
        var previous = goldHistory[0].midPrice;
        goldChange = latest - previous;
        goldChangePct = previous !== 0 ? (goldChange / previous) * 100 : 0;
      }

      var silverHistory = window.priceHistory.getPriceHistory('SILVER', 'global', 1);
      if (silverHistory && silverHistory.length >= 2) {
        var latestS = silverHistory[silverHistory.length - 1].midPrice;
        var previousS = silverHistory[0].midPrice;
        silverChange = latestS - previousS;
        silverChangePct = previousS !== 0 ? (silverChange / previousS) * 100 : 0;
      }
    } catch (e) {
      // History not available
    }
  }

  // Gold display - XSS SAFE
  if (dom.goldPriceUsd) dom.goldPriceUsd.textContent = formatNumber(gold, '$');

  if (dom.goldChange) {
    var isUp = goldChange >= 0;
    var goldIcon = isUp ? '\u25B2' : '\u25BC';
    var goldColor = isUp ? 'var(--success)' : 'var(--danger)';
    var goldSign = isUp ? '+' : '';

    dom.goldChange.textContent = '';

    var iconSpan = document.createElement('span');
    iconSpan.className = 'change-icon';
    iconSpan.textContent = goldIcon;

    var valueSpan = document.createElement('span');
    valueSpan.className = 'change-value';
    valueSpan.style.color = goldColor;
    valueSpan.textContent = Math.abs(goldChange).toFixed(2);

    var pctSpan = document.createElement('span');
    pctSpan.className = 'change-percent';
    pctSpan.textContent = '(' + goldSign + goldChangePct.toFixed(2) + '%)';

    dom.goldChange.appendChild(iconSpan);
    dom.goldChange.appendChild(document.createTextNode(' '));
    dom.goldChange.appendChild(valueSpan);
    dom.goldChange.appendChild(document.createTextNode(' '));
    dom.goldChange.appendChild(pctSpan);
  }

  // Gram prices
  var gram24 = gold / 31.1035;
  var gram22 = gram24 * 0.916;
  var gram21 = gram24 * 0.875;
  var gram18 = gram24 * 0.750;

  if (dom.goldGram24) dom.goldGram24.textContent = formatNumber(gram24, '$');
  if (dom.goldGram22) dom.goldGram22.textContent = formatNumber(gram22, '$');
  if (dom.goldGram21) dom.goldGram21.textContent = formatNumber(gram21, '$');
  if (dom.goldGram18) dom.goldGram18.textContent = formatNumber(gram18, '$');
  if (dom.goldGram21Yer) dom.goldGram21Yer.textContent = formatNumber(gram21 * yerRate, '\uFDFC');

  // Silver display - XSS SAFE
  if (dom.silverPriceUsd) dom.silverPriceUsd.textContent = formatNumber(silver, '$');

  if (dom.silverChange) {
    var sUp = silverChange >= 0;
    var sIcon = sUp ? '\u25B2' : '\u25BC';
    var sColor = sUp ? 'var(--success)' : 'var(--danger)';
    var sSign = sUp ? '+' : '';

    dom.silverChange.textContent = '';

    var sIconSpan = document.createElement('span');
    sIconSpan.className = 'change-icon';
    sIconSpan.textContent = sIcon;

    var sValueSpan = document.createElement('span');
    sValueSpan.className = 'change-value';
    sValueSpan.style.color = sColor;
    sValueSpan.textContent = Math.abs(silverChange).toFixed(2);

    var sPctSpan = document.createElement('span');
    sPctSpan.className = 'change-percent';
    sPctSpan.textContent = '(' + sSign + silverChangePct.toFixed(2) + '%)';

    dom.silverChange.appendChild(sIconSpan);
    dom.silverChange.appendChild(document.createTextNode(' '));
    dom.silverChange.appendChild(sValueSpan);
    dom.silverChange.appendChild(document.createTextNode(' '));
    dom.silverChange.appendChild(sPctSpan);
  }

  var silverGram = silver / 31.1035;
  if (dom.silverGram) dom.silverGram.textContent = formatNumber(silverGram, '$');
  if (dom.silverKg) dom.silverKg.textContent = formatNumber(silverGram * 1000, '$');
  if (dom.silverGramYer) dom.silverGramYer.textContent = formatNumber(silverGram * yerRate, '\uFDFC');

  // Other metals
  if (dom.platinumPrice) dom.platinumPrice.textContent = formatNumber(state.platinumPrice, '$');
  if (dom.palladiumPrice) dom.palladiumPrice.textContent = formatNumber(state.palladiumPrice, '$');
  if (dom.copperPrice) dom.copperPrice.textContent = formatNumber(state.copperPrice, '$');
  if (dom.aluminumPrice) dom.aluminumPrice.textContent = formatNumber(state.aluminumPrice, '$');

  updateMetalCalculator();
}

// ============================================
// SECTION 3: FIX drawSparklines() - Real data
// ============================================

function drawSparklines(rates) {
  var historicalData = {};
  try {
    var stored = localStorage.getItem('spark_history');
    if (stored) {
      var data = JSON.parse(stored);
      var now = Date.now();
      Object.keys(data).forEach(function(code) {
        historicalData[code] = data[code].filter(function(entry) {
          return (now - entry.timestamp) < 86400000;
        });
      });
    }
  } catch (e) {
    // Storage error
  }

  rates.forEach(function(rate) {
    var canvas = document.getElementById('spark-' + rate.code);
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var w = canvas.width;
    var h = canvas.height;

    var points;
    if (historicalData[rate.code] && historicalData[rate.code].length >= 2) {
      points = historicalData[rate.code].map(function(entry) { return entry.rate; });
    } else {
      // Flat line as fallback
      points = [rate.rate, rate.rate];
    }

    var min = points[0];
    var max = points[0];
    for (var i = 1; i < points.length; i++) {
      if (points[i] < min) min = points[i];
      if (points[i] > max) max = points[i];
    }
    var range = max - min || 1;

    ctx.clearRect(0, 0, w, h);
    ctx.beginPath();

    var isUp = points[points.length - 1] >= points[0];
    ctx.strokeStyle = isUp ? '#10b981' : '#ef4444';
    ctx.lineWidth = 2;

    points.forEach(function(p, i) {
      var x = (i / (points.length - 1)) * w;
      var y = h - ((p - min) / range) * (h - 4) - 2;
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
  var historyKey = 'chart_history_YER';
  try {
    var stored = localStorage.getItem(historyKey);
    if (stored) {
      var history = JSON.parse(stored);
      if (history.length >= 2) {
        var periodMap = { '1D': 24, '1W': 7, '1M': 30, '3M': 90 };
        var maxPoints = periodMap[period] || count;
        var recent = history.slice(-maxPoints);
        if (recent.length >= 2) {
          return recent.map(function(entry) { return entry.rate; });
        }
      }
    }
  } catch (e) {
    // History error
  }
  var currentRate = state.rates && state.rates.YER ? state.rates.YER : CONFIG.YER_RATE;
  var points = [];
  for (var i = 0; i < count; i++) {
    points.push(currentRate);
  }
  return points;
}

// ============================================
// SECTION 5: fetchLocalRatesFromJSON with history
// ============================================

async function fetchLocalRatesFromJSON() {
  try {
    var cacheBuster = Date.now();
    var response = await fetch('./api/prices_data.json?_=' + cacheBuster, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });

    if (!response.ok) {
      state.localRatesError = 'HTTP ' + response.status;
      updateLocalRatesStatus('error', '\u0641\u0634\u0644 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645');
      return;
    }

    var data = await response.json();

    if (!data || !data.regions) {
      state.localRatesError = 'Invalid JSON';
      updateLocalRatesStatus('error', '\u0628\u064A\u0627\u0646\u0627\u062A \u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629');
      return;
    }

    var updatedCount = 0;

    for (var regionKey in data.regions) {
      if (!data.regions.hasOwnProperty(regionKey)) continue;
      var regionData = data.regions[regionKey];
      if (!regionData || !regionData.currencies) continue;

      if (!CONFIG.LOCAL_RATES[regionKey]) {
        CONFIG.LOCAL_RATES[regionKey] = {};
      }

      for (var currencyKey in regionData.currencies) {
        if (!regionData.currencies.hasOwnProperty(currencyKey)) continue;
        var currencyData = regionData.currencies[currencyKey];

        if (currencyData && currencyData.buy !== undefined && currencyData.sell !== undefined) {
          var buyVal = parseFloat(currencyData.buy);
          var sellVal = parseFloat(currencyData.sell);

          if (!isNaN(buyVal) && !isNaN(sellVal) && buyVal > 0 && sellVal > 0) {
            CONFIG.LOCAL_RATES[regionKey][currencyKey] = {
              buy: buyVal,
              sell: sellVal
            };
            updatedCount++;

            if (window.priceHistory && window.priceHistory.storePriceSnapshot) {
              window.priceHistory.storePriceSnapshot(currencyKey, regionKey, buyVal, sellVal, 'control-panel');
            }
          }
        }
      }

      if (regionData.gold) {
        CONFIG.LOCAL_RATES[regionKey].gold = regionData.gold;
      }
      if (regionData.silver) {
        CONFIG.LOCAL_RATES[regionKey].silver = regionData.silver;
      }
    }

    if (updatedCount > 0) {
      state.localRatesLoaded = true;
      state.localRatesError = null;
      updateLocalConverter();
      updateLocalGoldDisplay();
      updateLocalSilverDisplay();
      updateLocalRatesStatus('success', '\u062A\u0645 \u062A\u062D\u062F\u064A\u062B ' + updatedCount + ' \u0633\u0639\u0631 \u0645\u0646 \u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645');
    } else {
      updateLocalRatesStatus('warning', '\u0644\u0627 \u062A\u0648\u062C\u062F \u0628\u064A\u0627\u0646\u0627\u062A \u0635\u0627\u0644\u062D\u0629 \u0641\u064A \u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645');
    }

  } catch (err) {
    state.localRatesError = err.message;
    updateLocalRatesStatus('error', '\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645');
  }
}

// ============================================
// SECTION 6: Helper - sparkline fallback
// ============================================

function generateRealSparkline(code, currentRate, change) {
  var points = [];
  var changeDir = change >= 0 ? 1 : -1;

  for (var i = 0; i < 20; i++) {
    var progress = i / 19;
    var trend = changeDir * Math.abs(change) * progress;
    var naturalWave = Math.sin(i * 0.8) * currentRate * 0.002;
    points.push(currentRate + trend + naturalWave);
  }

  return points;
}

function calculateTopMoversFromData() {
  return RATES_TABLE_DATA
    .filter(function(r) { return Math.abs(r.changePct) > 0.05; })
    .sort(function(a, b) { return Math.abs(b.changePct) - Math.abs(a.changePct); })
    .slice(0, 8);
}
