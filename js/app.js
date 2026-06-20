/* ============================================
   ريال ودولار - Currency, Gold & Silver App
   Main Application JavaScript - FIXED v2.0.0
   ============================================ */

'use strict';

/* ============================================
   CONFIGURATION
   ============================================ */
const CONFIG = {
  VERSION: '2.0.0',
  API_BASE: 'https://open.er-api.com/v6/latest',
  FALLBACK_API: 'https://api.exchangerate-api.com/v4/latest',
  GOLD_API: 'https://api.gold-api.com/price/XAU',
  SILVER_API: 'https://api.gold-api.com/price/XAG',
  UPDATE_INTERVAL: 60000,
  CACHE_DURATION: 300000,
  DEFAULT_FROM: 'USD',
  DEFAULT_TO: 'YER',
  YER_RATE: 238.77,
  LOCAL_RATES: {
    sanaa: { USD: { buy: 533, sell: 535 }, SAR: { buy: 140, sell: 141 }, EUR: { buy: 620, sell: 625 }, GBP: { buy: 730, sell: 738 }, AED: { buy: 142.5, sell: 145 }, KWD: { buy: 1720, sell: 1735 }, gold: { '21k': { buy: 63203, sell: 64708 }, '22k': { buy: 66000, sell: 67500 }, '24k': { buy: 72000, sell: 73500 } }, silver: { buy: 28.5, sell: 29 } },
    aden: { USD: { buy: 1550, sell: 1558 }, SAR: { buy: 409, sell: 410 }, EUR: { buy: 1790, sell: 1805 }, GBP: { buy: 2110, sell: 2130 }, AED: { buy: 420, sell: 423 }, KWD: { buy: 5050, sell: 5080 }, gold: { '21k': { buy: 183799, sell: 188440 }, '22k': { buy: 192000, sell: 197000 }, '24k': { buy: 209000, sell: 214000 } }, silver: { buy: 9.5, sell: 9.8 } },
    taiz: { USD: { buy: 530, sell: 535 }, SAR: { buy: 140, sell: 141 } },
    hodeidah: { USD: { buy: 530, sell: 535 }, SAR: { buy: 140, sell: 141 } },
    ibb: { USD: { buy: 530, sell: 535 }, SAR: { buy: 140, sell: 141 } },
    marib: { USD: { buy: 535, sell: 540 }, SAR: { buy: 142, sell: 143 } },
    hadramout: { USD: { buy: 1555, sell: 1565 }, SAR: { buy: 410, sell: 412 } }
  }
};

/* ============================================
   CURRENCY DATA
   ============================================ */
const CURRENCIES = {
  USD: { name: 'دولار أمريكي', flag: '🇺🇸', symbol: '$', category: 'major' },
  YER: { name: 'ريال يمني', flag: '🇾🇪', symbol: '﷼', category: 'arab' },
  EUR: { name: 'يورو', flag: '🇪🇺', symbol: '€', category: 'major' },
  GBP: { name: 'جنيه إسترليني', flag: '🇬🇧', symbol: '£', category: 'major' },
  SAR: { name: 'ريال سعودي', flag: '🇸🇦', symbol: '﷼', category: 'arab' },
  AED: { name: 'درهم إماراتي', flag: '🇦🇪', symbol: 'د.إ', category: 'arab' },
  KWD: { name: 'دينار كويتي', flag: '🇰🇼', symbol: 'د.ك', category: 'arab' },
  QAR: { name: 'ريال قطري', flag: '🇶🇦', symbol: '﷼', category: 'arab' },
  OMR: { name: 'ريال عماني', flag: '🇴🇲', symbol: '﷼', category: 'arab' },
  BHD: { name: 'دينار بحريني', flag: '🇧🇭', symbol: 'د.ب', category: 'arab' },
  JOD: { name: 'دينار أردني', flag: '🇯🇴', symbol: 'د.ا', category: 'arab' },
  EGP: { name: 'جنيه مصري', flag: '🇪🇬', symbol: '£', category: 'arab' },
  TRY: { name: 'ليرة تركية', flag: '🇹🇷', symbol: '₺', category: 'major' },
  CNY: { name: 'رنمينبي صيني', flag: '🇨🇳', symbol: '¥', category: 'major' },
  JPY: { name: 'ين ياباني', flag: '🇯🇵', symbol: '¥', category: 'major' },
  INR: { name: 'روبية هندية', flag: '🇮🇳', symbol: '₹', category: 'major' },
  CAD: { name: 'دولار كندي', flag: '🇨🇦', symbol: 'C$', category: 'major' },
  AUD: { name: 'دولار أسترالي', flag: '🇦🇺', symbol: 'A$', category: 'major' },
  CHF: { name: 'فرنك سويسري', flag: '🇨🇭', symbol: 'Fr', category: 'major' },
  SEK: { name: 'كرونة سويدية', flag: '🇸🇪', symbol: 'kr', category: 'major' },
  NOK: { name: 'كرونة نرويجية', flag: '🇳🇴', symbol: 'kr', category: 'major' },
  DKK: { name: 'كرونة دنماركية', flag: '🇩🇰', symbol: 'kr', category: 'major' },
  RUB: { name: 'روبل روسي', flag: '🇷🇺', symbol: '₽', category: 'major' },
  ZAR: { name: 'راند جنوب أفريقي', flag: '🇿🇦', symbol: 'R', category: 'major' },
  BRL: { name: 'ريال برازيلي', flag: '🇧🇷', symbol: 'R$', category: 'major' },
  MXN: { name: 'بيزو مكسيكي', flag: '🇲🇽', symbol: '$', category: 'major' },
  SGD: { name: 'دولار سنغافوري', flag: '🇸🇬', symbol: 'S$', category: 'major' },
  HKD: { name: 'دولار هونغ كونغ', flag: '🇭🇰', symbol: 'HK$', category: 'major' },
  KRW: { name: 'وون كوري جنوبي', flag: '🇰🇷', symbol: '₩', category: 'major' },
  PKR: { name: 'روبية باكستانية', flag: '🇵🇰', symbol: '₨', category: 'major' },
  LBP: { name: 'ليرة لبنانية', flag: '🇱🇧', symbol: 'ل.ل', category: 'arab' },
  IQD: { name: 'دينار عراقي', flag: '🇮🇶', symbol: 'د.ع', category: 'arab' },
  SDG: { name: 'جنيه سوداني', flag: '🇸🇩', symbol: '£', category: 'arab' },
  DZD: { name: 'دينار جزائري', flag: '🇩🇿', symbol: 'د.ج', category: 'arab' },
  TND: { name: 'دينار تونسي', flag: '🇹🇳', symbol: 'د.ت', category: 'arab' },
  MAD: { name: 'درهم مغربي', flag: '🇲🇦', symbol: 'د.م', category: 'arab' },
  LYD: { name: 'دينار ليبي', flag: '🇱🇾', symbol: 'د.ل', category: 'arab' },
  BTC: { name: 'بيتكوين', flag: '₿', symbol: '₿', category: 'crypto' },
  ETH: { name: 'إيثيريوم', flag: 'Ξ', symbol: 'Ξ', category: 'crypto' }
};

const RATES_TABLE_DATA = [
  { code: 'USD', rate: 1, change: 0.0014, changePct: 0.14 },
  { code: 'EUR', rate: 0.861314, change: -0.0008, changePct: -0.09 },
  { code: 'GBP', rate: 0.744885, change: 0.0005, changePct: 0.06 },
  { code: 'SAR', rate: 3.75, change: 0.0, changePct: 0.0 },
  { code: 'AED', rate: 3.6725, change: 0.0, changePct: 0.0 },
  { code: 'KWD', rate: 0.308318, change: 0.0001, changePct: 0.03 },
  { code: 'QAR', rate: 3.64, change: 0.0, changePct: 0.0 },
  { code: 'OMR', rate: 0.384497, change: 0.0, changePct: 0.0 },
  { code: 'BHD', rate: 0.376, change: 0.0, changePct: 0.0 },
  { code: 'JOD', rate: 0.709, change: 0.0, changePct: 0.0 },
  { code: 'EGP', rate: 50.202783, change: -0.2410, changePct: -0.48 },
  { code: 'TRY', rate: 46.33978, change: -0.6396, changePct: -1.38 },
  { code: 'CNY', rate: 6.769763, change: 0.0190, changePct: 0.28 },
  { code: 'JPY', rate: 160.357421, change: 0.8980, changePct: 0.56 },
  { code: 'INR', rate: 94.617681, change: 0.1325, changePct: 0.14 },
  { code: 'CAD', rate: 1.399083, change: -0.0102, changePct: -0.73 },
  { code: 'AUD', rate: 1.414641, change: 0.0028, changePct: 0.20 },
  { code: 'CHF', rate: 0.793474, change: -0.0017, changePct: -0.22 },
  { code: 'RUB', rate: 72.447516, change: 0.9491, changePct: 1.31 },
  { code: 'ZAR', rate: 16.185724, change: -0.1262, changePct: -0.78 },
  { code: 'BRL', rate: 5.067231, change: 0.0081, changePct: 0.16 },
  { code: 'MXN', rate: 17.205389, change: -0.0516, changePct: -0.30 },
  { code: 'SGD', rate: 1.281946, change: 0.0009, changePct: 0.07 },
  { code: 'HKD', rate: 7.83281, change: 0.0, changePct: 0.0 },
  { code: 'KRW', rate: 1508.825189, change: 5.5827, changePct: 0.37 },
  { code: 'PKR', rate: 278.335735, change: -0.5010, changePct: -0.18 },
  { code: 'LBP', rate: 89500, change: 0.0, changePct: 0.0 },
  { code: 'IQD', rate: 1311.63285, change: 0.0, changePct: 0.0 },
  { code: 'BTC', rate: 0.000015, change: 0.000001, changePct: 0.68 },
  { code: 'ETH', rate: 0.00028, change: 0.00001, changePct: 0.36 }
];

/* ============================================
   STATE
   ============================================ */
const state = {
  rates: {},
  goldPrice: 2344,
  silverPrice: 28.8,
  platinumPrice: 1031,
  palladiumPrice: 961,
  copperPrice: 4.3,
  aluminumPrice: 2.34,
  lastUpdate: null,
  isOnline: navigator.onLine,
  theme: localStorage.getItem('theme') || 'dark',
  fromCurrency: localStorage.getItem('fromCurrency') || CONFIG.DEFAULT_FROM,
  toCurrency: localStorage.getItem('toCurrency') || CONFIG.DEFAULT_TO,
  savedConversions: JSON.parse(localStorage.getItem('savedConversions') || '[]'),
  currentPage: 1,
  itemsPerPage: 10,
  currentFilter: 'all',
  chartPeriod: '1D',
  chartCurrency: 'USD',
  localRatesLoaded: false,
  localRatesError: null
};

/* ============================================
   DOM CACHE
   ============================================ */
const dom = {};

function cacheDOM() {
  dom.splash = document.getElementById('splash-screen');
  dom.loading = document.getElementById('loading-screen');
  dom.offlineBanner = document.getElementById('offline-banner');
  dom.updateBanner = document.getElementById('update-banner');
  dom.header = document.getElementById('header');
  dom.navDesktop = document.getElementById('nav-desktop');
  dom.mobileMenu = document.getElementById('mobile-menu');
  dom.menuToggle = document.getElementById('menu-toggle');
  dom.menuClose = document.getElementById('menu-close');
  dom.menuOverlay = document.getElementById('menu-overlay');
  dom.themeToggle = document.getElementById('theme-toggle');
  dom.refreshBtn = document.getElementById('refresh-btn');
  dom.backToTop = document.getElementById('back-to-top');
  dom.toastContainer = document.getElementById('toast-container');
  dom.installPrompt = document.getElementById('install-prompt');
  dom.installBtn = document.getElementById('install-btn');
  dom.installClose = document.getElementById('install-close');
  dom.amountGlobal = document.getElementById('amount-global');
  dom.amountLocal = document.getElementById('amount-local');
  dom.fromCurrency = document.getElementById('from-currency');
  dom.toCurrency = document.getElementById('to-currency');
  dom.fromFlag = document.getElementById('from-flag');
  dom.fromCode = document.getElementById('from-code');
  dom.fromName = document.getElementById('from-name');
  dom.toFlag = document.getElementById('to-flag');
  dom.toCode = document.getElementById('to-code');
  dom.toName = document.getElementById('to-name');
  dom.fromOptions = document.getElementById('from-options');
  dom.toOptions = document.getElementById('to-options');
  dom.swapBtn = document.getElementById('swap-currencies');
  dom.resultAmount = document.getElementById('result-amount');
  dom.resultRate = document.getElementById('result-rate');
  dom.resultTime = document.getElementById('result-time');
  dom.convertBtn = document.getElementById('convert-btn');
  dom.saveConversion = document.getElementById('save-conversion');
  dom.shareConversion = document.getElementById('share-conversion');
  dom.clearAmount = document.getElementById('clear-amount');
  dom.localCurrency = document.getElementById('local-currency');
  dom.localRegion = document.getElementById('local-region');
  dom.swapLocal = document.getElementById('swap-local');
  dom.buyPrice = document.getElementById('buy-price');
  dom.sellPrice = document.getElementById('sell-price');
  dom.totalYer = document.getElementById('total-yer');
  dom.buyTrend = document.getElementById('buy-trend');
  dom.sellTrend = document.getElementById('sell-trend');
  dom.goldGram21Yer = document.getElementById('gold-gram-21-yer');
  dom.goldGram22Yer = document.getElementById('gold-gram-22-yer');
  dom.goldGram24Yer = document.getElementById('gold-gram-24-yer');
  dom.goldGram18Yer = document.getElementById('gold-gram-18-yer');
  dom.localGoldRegion = document.getElementById('local-gold-region');
  dom.localSilverBuy = document.getElementById('local-silver-buy');
  dom.localSilverSell = document.getElementById('local-silver-sell');
  dom.tabBtns = document.querySelectorAll('.tab-btn');
  dom.panels = document.querySelectorAll('.converter-panel');
  dom.goldPriceUsd = document.getElementById('gold-price-usd');
  dom.goldChange = document.getElementById('gold-change');
  dom.goldGram24 = document.getElementById('gold-gram-24');
  dom.goldGram22 = document.getElementById('gold-gram-22');
  dom.goldGram21 = document.getElementById('gold-gram-21');
  dom.goldGram18 = document.getElementById('gold-gram-18');
  dom.silverPriceUsd = document.getElementById('silver-price-usd');
  dom.silverChange = document.getElementById('silver-change');
  dom.silverGram = document.getElementById('silver-gram');
  dom.silverKg = document.getElementById('silver-kg');
  dom.silverGramYer = document.getElementById('silver-gram-yer');
  dom.platinumPrice = document.getElementById('platinum-price');
  dom.palladiumPrice = document.getElementById('palladium-price');
  dom.copperPrice = document.getElementById('copper-price');
  dom.aluminumPrice = document.getElementById('aluminum-price');
  dom.metalType = document.getElementById('metal-type');
  dom.metalWeight = document.getElementById('metal-weight');
  dom.metalCurrency = document.getElementById('metal-currency');
  dom.metalCalcResult = document.getElementById('metal-calc-result');
  dom.ratesSearch = document.getElementById('rates-search');
  dom.ratesTbody = document.getElementById('rates-tbody');
  dom.filterBtns = document.querySelectorAll('.filter-btn');
  dom.prevPage = document.getElementById('prev-page');
  dom.nextPage = document.getElementById('next-page');
  dom.pageInfo = document.getElementById('page-info');
  dom.mainChartCanvas = document.getElementById('main-chart-canvas');
  dom.goldChartCanvas = document.getElementById('gold-chart-canvas');
  dom.periodBtns = document.querySelectorAll('.period-btn');
  dom.topMovers = document.getElementById('top-movers');
  dom.calcAmount = document.getElementById('calc-amount');
  dom.calcFee = document.getElementById('calc-fee');
  dom.calcFeeResult = document.getElementById('calc-fee-result');
  dom.calcBuyRate = document.getElementById('calc-buy-rate');
  dom.calcSellRate = document.getElementById('calc-sell-rate');
  dom.calcInvest = document.getElementById('calc-invest');
  dom.calcProfitResult = document.getElementById('calc-profit-result');
  dom.calcBatch = document.getElementById('calc-batch');
  dom.calcBatchCurrency = document.getElementById('calc-batch-currency');
  dom.calcBatchResult = document.getElementById('calc-batch-result');
  dom.savedList = document.getElementById('saved-list');
  dom.quickGrid = document.getElementById('quick-grid');
  dom.localRatesStatus = document.getElementById('local-rates-status');
}

/* ============================================
   INITIALIZATION
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  cacheDOM();
  initApp();
});

async function initApp() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('./service-worker.js');
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateBanner();
          }
        });
      });
    } catch (err) {
      // SW registration failed silently
    }
  }

  applyTheme(state.theme);
  setupEventListeners();
  generateParticles();
  setupCurrencyDropdowns();
  setupRatesTable();
  setupQuickConversions();
  setupCharts();
  setupTopMovers();
  renderSavedConversions();

  await fetchLocalRatesFromJSON();
  await fetchAllData();

  setTimeout(() => {
    if (dom.splash) dom.splash.classList.add('hidden');
  }, 1500);

  setInterval(fetchAllData, CONFIG.UPDATE_INTERVAL);
  setInterval(fetchLocalRatesFromJSON, 30000);

  setupRevealAnimations();
  setupInstallPrompt();
  setupNetworkListeners();
  registerPeriodicSync();
  registerBackgroundSync();
  setTimeout(requestNotificationPermission, 5000);
}

/* ============================================
   DATA FETCHING
   ============================================ */
async function fetchAllData() {
  try {
    showLoading(true);
    await Promise.all([
      fetchRates(),
      fetchMetals()
    ]);
    state.lastUpdate = new Date();
    updateLastUpdateTime();
    showLoading(false);
  } catch (err) {
    showLoading(false);
    showToast('تعذر تحديث البيانات العالمية. استخدام البيانات المخزنة.', 'warning');
  }
}

async function fetchRates() {
  try {
    const response = await fetch(`${CONFIG.API_BASE}/USD`);
    if (!response.ok) throw new Error('Rate fetch failed');
    const data = await response.json();

    if (data.rates) {
      state.rates = data.rates;
      if (!state.rates.YER) {
        state.rates.YER = CONFIG.YER_RATE;
      }
      saveChartDataPoint();
      updateConverter();
      updateRatesTable();
      updateQuickConversions();
    }
  } catch (err) {
    state.rates = {
      USD: 1, EUR: 0.861314, GBP: 0.744885, JPY: 160.357421, CNY: 6.769763,
      SAR: 3.75, AED: 3.6725, KWD: 0.308318, QAR: 3.64, OMR: 0.384497,
      BHD: 0.376, JOD: 0.709, EGP: 50.202783, TRY: 46.33978, INR: 94.617681,
      CAD: 1.399083, AUD: 1.414641, CHF: 0.793474, RUB: 72.447516, ZAR: 16.185724,
      BRL: 5.067231, MXN: 17.205389, SGD: 1.281946, HKD: 7.83281, KRW: 1508.825189,
      PKR: 278.335735, LBP: 89500, IQD: 1311.63285, YER: 238.767864
    };
    saveChartDataPoint();
    updateConverter();
    updateRatesTable();
    updateQuickConversions();
  }
}

function fetchMetals() {
  fetch('api/prices_data.json')
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => {
      if (data.gold?.ounce) {
        state.goldPrice = data.gold.ounce.price_usd || data.gold.ounce.price || 2344;
      }
      if (data.silver?.price_usd) {
        state.silverPrice = data.silver.price_usd || 28.8;
      }
      if (data.metals) {
        data.metals.forEach(metal => {
          if (metal.code === 'XPT') state.platinumPrice = metal.price_usd;
          if (metal.code === 'XPD') state.palladiumPrice = metal.price_usd;
          if (metal.code === 'HG') state.copperPrice = metal.price_usd;
          if (metal.code === 'AL') state.aluminumPrice = metal.price_usd;
        });
      }
      updateMetalsDisplay();
    })
    .catch(err => {
      updateMetalsDisplay();
    });
}

/* ============================================
   LOCAL RATES FROM JSON
   ============================================ */
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
      state.localRatesError = `HTTP ${response.status}`;
      updateLocalRatesStatus('error', 'فشل الاتصال بلوحة التحكم');
      return;
    }

    const data = await response.json();

    if (!data || !data.regions) {
      state.localRatesError = 'Invalid JSON structure';
      updateLocalRatesStatus('error', 'بيانات لوحة التحكم غير صالحة');
      return;
    }

    let updatedCount = 0;
    let newRegions = 0;

    for (const regionKey in data.regions) {
      const regionData = data.regions[regionKey];
      if (!regionData || !regionData.currencies) continue;

      if (!CONFIG.LOCAL_RATES[regionKey]) {
        CONFIG.LOCAL_RATES[regionKey] = {};
        newRegions++;
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
              saveLocalRateHistory(regionKey, currencyKey, buyVal, sellVal);
              updatedCount++;
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

    if (updatedCount > 0 || newRegions > 0) {
      state.localRatesLoaded = true;
      state.localRatesError = null;

      updateLocalConverter();
      updateLocalGoldDisplay();
      updateLocalSilverDisplay();

      if (dom.resultTime) {
        const time = new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' });
        dom.resultTime.textContent = `آخر تحديث: ${time} (من لوحة التحكم)`;
      }

      updateLocalRatesStatus('success', `تم تحديث ${updatedCount} سعر من لوحة التحكم`);
    } else {
      updateLocalRatesStatus('warning', 'لا توجد بيانات صالحة في لوحة التحكم');
    }

  } catch (err) {
    state.localRatesError = err.message;
    updateLocalRatesStatus('error', 'خطأ في الاتصال بلوحة التحكم');
  }
}

/* ============================================
   LOCAL RATES HISTORY (for trend calculation)
   ============================================ */
function saveLocalRateHistory(region, currency, buyRate, sellRate) {
  const storageKey = `local_rate_history_${region}_${currency}`;
  try {
    const stored = localStorage.getItem(storageKey);
    const history = stored ? JSON.parse(stored) : [];
    if (history.length > 0) {
      const last = history[history.length - 1];
      if (last.buy === buyRate && last.sell === sellRate) return;
    }
    history.push({ buy: buyRate, sell: sellRate, timestamp: Date.now() });
    if (history.length > 50) history.splice(0, history.length - 50);
    localStorage.setItem(storageKey, JSON.stringify(history));
  } catch (e) {
    // Storage full or unavailable
  }
}

function getLocalRateTrend(region, currency) {
  const storageKey = `local_rate_history_${region}_${currency}`;
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return { buyIcon: '◆', buyColor: 'var(--text-muted)', sellIcon: '◆', sellColor: 'var(--text-muted)' };
    const history = JSON.parse(stored);
    if (history.length < 2) return { buyIcon: '◆', buyColor: 'var(--text-muted)', sellIcon: '◆', sellColor: 'var(--text-muted)' };
    const last = history[history.length - 1];
    const prev = history[history.length - 2];
    const buyChange = last.buy - prev.buy;
    const sellChange = last.sell - prev.sell;
    return {
      buyIcon: buyChange > 0.01 ? '▲' : buyChange < -0.01 ? '▼' : '◆',
      buyColor: buyChange > 0.01 ? 'var(--success)' : buyChange < -0.01 ? 'var(--danger)' : 'var(--text-muted)',
      sellIcon: sellChange > 0.01 ? '▲' : sellChange < -0.01 ? '▼' : '◆',
      sellColor: sellChange > 0.01 ? 'var(--success)' : sellChange < -0.01 ? 'var(--danger)' : 'var(--text-muted)'
    };
  } catch (e) {
    return { buyIcon: '◆', buyColor: 'var(--text-muted)', sellIcon: '◆', sellColor: 'var(--text-muted)' };
  }
}

/* ============================================
   CHART DATA HISTORY
   ============================================ */
function saveChartDataPoint() {
  const historyKey = 'chart_history_YER';
  const currentRate = state.rates?.YER || CONFIG.YER_RATE;
  try {
    const stored = localStorage.getItem(historyKey);
    const history = stored ? JSON.parse(stored) : [];
    if (history.length > 0) {
      const last = history[history.length - 1];
      if (last.rate === currentRate) return;
    }
    history.push({ rate: currentRate, timestamp: Date.now() });
    if (history.length > 90) history.splice(0, history.length - 90);
    localStorage.setItem(historyKey, JSON.stringify(history));
  } catch (e) {
    // Storage full or unavailable
  }
}

/* ============================================
   CONVERTER
   ============================================ */
function setupCurrencyDropdowns() {
  if (dom.fromOptions) {
    dom.fromOptions.textContent = '';
    Object.entries(CURRENCIES).forEach(([code, data]) => {
      dom.fromOptions.appendChild(createCurrencyOption(code, data));
    });
  }
  if (dom.toOptions) {
    dom.toOptions.textContent = '';
    Object.entries(CURRENCIES).forEach(([code, data]) => {
      dom.toOptions.appendChild(createCurrencyOption(code, data));
    });
  }

  selectCurrency('from', state.fromCurrency);
  selectCurrency('to', state.toCurrency);

  [dom.fromCurrency, dom.toCurrency].forEach((dropdown, index) => {
    if (!dropdown) return;
    const type = index === 0 ? 'from' : 'to';
    dropdown.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.contains('open');
      closeAllDropdowns();
      if (!isOpen) {
        dropdown.classList.add('open');
        dropdown.setAttribute('aria-expanded', 'true');
      }
    });
    dropdown.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        dropdown.click();
      }
    });
  });

  document.addEventListener('click', (e) => {
    const option = e.target.closest('.currency-option');
    if (option) {
      const dropdown = option.closest('.currency-dropdown');
      const type = dropdown.id === 'from-currency' ? 'from' : 'to';
      selectCurrency(type, option.dataset.code);
      closeAllDropdowns();
    } else if (!e.target.closest('.currency-dropdown')) {
      closeAllDropdowns();
    }
  });
}

function createCurrencyOption(code, data) {
  const option = document.createElement('div');
  option.className = 'currency-option';
  option.dataset.code = code;
  option.setAttribute('role', 'option');
  const flag = document.createElement('span');
  flag.className = 'currency-flag';
  flag.textContent = data.flag;
  const info = document.createElement('div');
  info.className = 'currency-info';
  const codeSpan = document.createElement('span');
  codeSpan.className = 'currency-code';
  codeSpan.textContent = code;
  const nameSpan = document.createElement('span');
  nameSpan.className = 'currency-name';
  nameSpan.textContent = data.name;
  info.appendChild(codeSpan);
  info.appendChild(nameSpan);
  option.appendChild(flag);
  option.appendChild(info);
  return option;
}

function closeAllDropdowns() {
  document.querySelectorAll('.currency-dropdown.open').forEach(d => {
    d.classList.remove('open');
    d.setAttribute('aria-expanded', 'false');
  });
}

function selectCurrency(type, code) {
  const data = CURRENCIES[code];
  if (!data) return;
  if (type === 'from') {
    state.fromCurrency = code;
    if (dom.fromFlag) dom.fromFlag.textContent = data.flag;
    if (dom.fromCode) dom.fromCode.textContent = code;
    if (dom.fromName) dom.fromName.textContent = data.name;
    localStorage.setItem('fromCurrency', code);
  } else {
    state.toCurrency = code;
    if (dom.toFlag) dom.toFlag.textContent = data.flag;
    if (dom.toCode) dom.toCode.textContent = code;
    if (dom.toName) dom.toName.textContent = data.name;
    localStorage.setItem('toCurrency', code);
  }
  const options = type === 'from' ? dom.fromOptions : dom.toOptions;
  if (options) {
    options.querySelectorAll('.currency-option').forEach(opt => {
      opt.classList.toggle('selected', opt.dataset.code === code);
    });
  }
  updateConverter();
}

function updateConverter() {
  const amount = parseFloat(dom.amountGlobal?.value) || 0;
  const fromRate = state.rates[state.fromCurrency] || 1;
  const toRate = state.rates[state.toCurrency] || 1;
  let result;
  if (state.fromCurrency === 'USD') {
    result = amount * toRate;
  } else if (state.toCurrency === 'USD') {
    result = amount / fromRate;
  } else {
    result = (amount / fromRate) * toRate;
  }
  const toData = CURRENCIES[state.toCurrency];
  if (dom.resultAmount) {
    dom.resultAmount.textContent = formatNumber(result, toData?.symbol || '');
  }
  if (dom.resultRate) {
    const rate = fromRate && toRate ? (toRate / fromRate).toFixed(4) : '--';
    dom.resultRate.textContent = `1 ${state.fromCurrency} = ${rate} ${state.toCurrency}`;
  }
  updateLocalConverter();
}

function updateLocalConverter() {
  const amount = parseFloat(dom.amountLocal?.value) || 0;
  const currency = dom.localCurrency?.value || 'USD';
  const region = dom.localRegion?.value || 'sanaa';
  const rates = CONFIG.LOCAL_RATES[region]?.[currency];

  if (!rates) {
    if (dom.buyPrice) dom.buyPrice.textContent = '--';
    if (dom.sellPrice) dom.sellPrice.textContent = '--';
    if (dom.totalYer) dom.totalYer.textContent = '--';
    if (dom.buyTrend) { dom.buyTrend.textContent = '◆'; dom.buyTrend.style.color = 'var(--text-muted)'; }
    if (dom.sellTrend) { dom.sellTrend.textContent = '◆'; dom.sellTrend.style.color = 'var(--text-muted)'; }
    return;
  }

  const buyTotal = amount * rates.buy;
  const sellTotal = amount * rates.sell;

  if (dom.buyPrice) dom.buyPrice.textContent = formatNumber(buyTotal, '﷼');
  if (dom.sellPrice) dom.sellPrice.textContent = formatNumber(sellTotal, '﷼');
  if (dom.totalYer) dom.totalYer.textContent = formatNumber(buyTotal, '﷼');

  const trendData = getLocalRateTrend(region, currency);
  if (dom.buyTrend) {
    dom.buyTrend.textContent = trendData.buyIcon;
    dom.buyTrend.style.color = trendData.buyColor;
  }
  if (dom.sellTrend) {
    dom.sellTrend.textContent = trendData.sellIcon;
    dom.sellTrend.style.color = trendData.sellColor;
  }
}

/* ============================================
   METALS DISPLAY
   ============================================ */
function updateMetalsDisplay() {
  const gold = state.goldPrice;
  const silver = state.silverPrice;
  const yerRate = state.rates.YER || CONFIG.YER_RATE;

  if (dom.goldPriceUsd) dom.goldPriceUsd.textContent = formatNumber(gold, '$');
  if (dom.goldChange) {
    dom.goldChange.textContent = '';
    const iconSpan = document.createElement('span');
    iconSpan.className = 'change-icon';
    iconSpan.textContent = '◆';
    dom.goldChange.appendChild(iconSpan);
    const valueSpan = document.createElement('span');
    valueSpan.className = 'change-value';
    valueSpan.style.color = 'var(--text-muted)';
    valueSpan.textContent = ' 0.00';
    dom.goldChange.appendChild(valueSpan);
    const pctSpan = document.createElement('span');
    pctSpan.className = 'change-percent';
    pctSpan.textContent = ' (0.00%)';
    dom.goldChange.appendChild(pctSpan);
  }

  const gram24 = gold / 31.1035;
  if (dom.goldGram24) dom.goldGram24.textContent = formatNumber(gram24, '$');
  if (dom.goldGram22) dom.goldGram22.textContent = formatNumber(gram24 * 0.916, '$');
  if (dom.goldGram21) dom.goldGram21.textContent = formatNumber(gram24 * 0.875, '$');
  if (dom.goldGram18) dom.goldGram18.textContent = formatNumber(gram24 * 0.750, '$');
  if (dom.goldGram21Yer) dom.goldGram21Yer.textContent = formatNumber(gram24 * 0.875 * yerRate, '﷼');

  if (dom.silverPriceUsd) dom.silverPriceUsd.textContent = formatNumber(silver, '$');
  if (dom.silverChange) {
    dom.silverChange.textContent = '';
    const iconSpan = document.createElement('span');
    iconSpan.className = 'change-icon';
    iconSpan.textContent = '◆';
    dom.silverChange.appendChild(iconSpan);
    const valueSpan = document.createElement('span');
    valueSpan.className = 'change-value';
    valueSpan.style.color = 'var(--text-muted)';
    valueSpan.textContent = ' 0.00';
    dom.silverChange.appendChild(valueSpan);
    const pctSpan = document.createElement('span');
    pctSpan.className = 'change-percent';
    pctSpan.textContent = ' (0.00%)';
    dom.silverChange.appendChild(pctSpan);
  }

  const silverGram = silver / 31.1035;
  if (dom.silverGram) dom.silverGram.textContent = formatNumber(silverGram, '$');
  if (dom.silverKg) dom.silverKg.textContent = formatNumber(silverGram * 1000, '$');
  if (dom.silverGramYer) dom.silverGramYer.textContent = formatNumber(silverGram * yerRate, '﷼');

  if (dom.platinumPrice) dom.platinumPrice.textContent = formatNumber(state.platinumPrice, '$');
  if (dom.palladiumPrice) dom.palladiumPrice.textContent = formatNumber(state.palladiumPrice, '$');
  if (dom.copperPrice) dom.copperPrice.textContent = formatNumber(state.copperPrice, '$');
  if (dom.aluminumPrice) dom.aluminumPrice.textContent = formatNumber(state.aluminumPrice, '$');

  updateMetalCalculator();
}

/* ============================================
   LOCAL GOLD & SILVER DISPLAY
   ============================================ */
function updateLocalGoldDisplay() {
  const region = dom.localRegion?.value || dom.localGoldRegion?.value || 'sanaa';
  const regionData = CONFIG.LOCAL_RATES[region];
  if (!regionData || !regionData.gold) return;

  const gold = regionData.gold;
  const elements = {
    '21k': dom.goldGram21Yer,
    '22k': dom.goldGram22Yer,
    '24k': dom.goldGram24Yer,
    '18k': dom.goldGram18Yer
  };

  for (const [karat, el] of Object.entries(elements)) {
    if (el && gold[karat]) {
      const buyPrice = Number(gold[karat].buy);
      el.textContent = buyPrice.toLocaleString('ar-YE') + ' ر.ي';
    } else if (el) {
      el.textContent = '--';
    }
  }
}

function updateLocalSilverDisplay() {
  const region = dom.localRegion?.value || 'sanaa';
  const regionData = CONFIG.LOCAL_RATES[region];
  if (!regionData || !regionData.silver) return;

  const silver = regionData.silver;
  if (dom.localSilverBuy && silver.buy) {
    dom.localSilverBuy.textContent = Number(silver.buy).toLocaleString('ar-YE') + ' $';
  }
  if (dom.localSilverSell && silver.sell) {
    dom.localSilverSell.textContent = Number(silver.sell).toLocaleString('ar-YE') + ' $';
  }
}

function updateMetalCalculator() {
  const type = dom.metalType?.value || 'gold-21';
  const weight = parseFloat(dom.metalWeight?.value) || 0;
  const currency = dom.metalCurrency?.value || 'USD';

  const goldGram = state.goldPrice / 31.1035;
  const silverGram = state.silverPrice / 31.1035;

  let pricePerGram;
  switch(type) {
    case 'gold-24': pricePerGram = goldGram; break;
    case 'gold-22': pricePerGram = goldGram * 0.916; break;
    case 'gold-21': pricePerGram = goldGram * 0.875; break;
    case 'gold-18': pricePerGram = goldGram * 0.750; break;
    case 'silver': pricePerGram = silverGram; break;
    default: pricePerGram = 0;
  }

  let total = pricePerGram * weight;
  if (currency === 'YER') total *= (state.rates.YER || CONFIG.YER_RATE);
  else if (currency === 'SAR') total *= (state.rates.SAR || 3.75);
  else if (currency === 'EUR') { total /= (state.rates.USD || 1); total *= (state.rates.EUR || 0.92); }

  const symbols = { USD: '$', YER: '﷼', SAR: '﷼', EUR: '€' };
  if (dom.metalCalcResult) {
    dom.metalCalcResult.textContent = formatNumber(total, symbols[currency] || '$');
  }
}

/* ============================================
   RATES TABLE
   ============================================ */
function setupRatesTable() {
  updateRatesTable();

  if (dom.ratesSearch) {
    dom.ratesSearch.addEventListener('input', debounce(() => {
      state.currentPage = 1;
      updateRatesTable();
    }, 300));
  }

  dom.filterBtns?.forEach(btn => {
    btn.addEventListener('click', () => {
      dom.filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currentFilter = btn.dataset.filter;
      state.currentPage = 1;
      updateRatesTable();
    });
  });

  if (dom.prevPage) {
    dom.prevPage.addEventListener('click', () => {
      if (state.currentPage > 1) { state.currentPage--; updateRatesTable(); }
    });
  }
  if (dom.nextPage) {
    dom.nextPage.addEventListener('click', () => {
      const totalPages = Math.ceil(getFilteredRates().length / state.itemsPerPage);
      if (state.currentPage < totalPages) { state.currentPage++; updateRatesTable(); }
    });
  }
}

function getFilteredRates() {
  let rates = [...RATES_TABLE_DATA];
  if (state.currentFilter !== 'all') {
    rates = rates.filter(r => CURRENCIES[r.code]?.category === state.currentFilter);
  }
  const search = dom.ratesSearch?.value?.toLowerCase() || '';
  if (search) {
    rates = rates.filter(r => {
      const curr = CURRENCIES[r.code];
      return r.code.toLowerCase().includes(search) || curr?.name?.toLowerCase().includes(search);
    });
  }
  return rates;
}

function updateRatesTable() {
  const rates = getFilteredRates();
  const totalPages = Math.ceil(rates.length / state.itemsPerPage) || 1;
  const start = (state.currentPage - 1) * state.itemsPerPage;
  const pageRates = rates.slice(start, start + state.itemsPerPage);

  const tbody = dom.ratesTbody;
  if (!tbody) return;

  tbody.textContent = '';

  if (pageRates.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 6;
    td.style.cssText = 'text-align:center;padding:2rem;color:var(--text-muted)';
    td.textContent = 'لا توجد نتائج';
    tr.appendChild(td);
    tbody.appendChild(tr);
  } else {
    pageRates.forEach(rate => {
      const curr = CURRENCIES[rate.code];
      const changeClass = rate.change > 0 ? 'change-up' : rate.change < 0 ? 'change-down' : 'change-neutral';
      const changeIcon = rate.change > 0 ? '▲' : rate.change < 0 ? '▼' : '—';
      const yerRate = state.rates.YER ? (rate.rate * state.rates.YER).toFixed(2) : '--';

      const tr = document.createElement('tr');

      const tdCurrency = document.createElement('td');
      const currencyCell = document.createElement('div');
      currencyCell.className = 'currency-cell';
      const flag = document.createElement('span');
      flag.className = 'currency-cell-flag';
      flag.textContent = curr?.flag || '🏳️';
      const info = document.createElement('div');
      info.className = 'currency-cell-info';
      const code = document.createElement('span');
      code.className = 'currency-cell-code';
      code.textContent = rate.code;
      const name = document.createElement('span');
      name.className = 'currency-cell-name';
      name.textContent = curr?.name || rate.code;
      info.appendChild(code);
      info.appendChild(name);
      currencyCell.appendChild(flag);
      currencyCell.appendChild(info);
      tdCurrency.appendChild(currencyCell);

      const tdRate = document.createElement('td');
      const spanRate = document.createElement('span');
      spanRate.className = 'rate-value';
      spanRate.textContent = rate.rate.toFixed(4);
      tdRate.appendChild(spanRate);

      const tdYer = document.createElement('td');
      const spanYer = document.createElement('span');
      spanYer.className = 'rate-value';
      spanYer.textContent = yerRate;
      tdYer.appendChild(spanYer);
      const spanYerLabel = document.createElement('span');
      spanYerLabel.style.cssText = 'color:var(--text-muted);font-size:0.75rem';
      spanYerLabel.textContent = ' YER';
      tdYer.appendChild(spanYerLabel);

      const tdChange = document.createElement('td');
      tdChange.className = changeClass;
      const spanChange = document.createElement('span');
      spanChange.className = 'change-value';
      spanChange.textContent = `${changeIcon} ${Math.abs(rate.change).toFixed(2)}`;
      tdChange.appendChild(spanChange);

      const tdPct = document.createElement('td');
      tdPct.className = changeClass;
      const spanPct = document.createElement('span');
      spanPct.className = 'change-value';
      spanPct.textContent = `${changeIcon} ${Math.abs(rate.changePct).toFixed(2)}%`;
      tdPct.appendChild(spanPct);

      const tdSpark = document.createElement('td');
      const canvas = document.createElement('canvas');
      canvas.className = 'sparkline';
      canvas.id = `spark-${rate.code}`;
      canvas.width = 80;
      canvas.height = 30;
      tdSpark.appendChild(canvas);

      tr.appendChild(tdCurrency);
      tr.appendChild(tdRate);
      tr.appendChild(tdYer);
      tr.appendChild(tdChange);
      tr.appendChild(tdPct);
      tr.appendChild(tdSpark);

      tbody.appendChild(tr);
    });

    pageRates.forEach(rate => saveSparkData(rate.code, rate.rate));
    setTimeout(() => drawSparklines(pageRates), 100);
  }

  if (dom.pageInfo) dom.pageInfo.textContent = `صفحة ${state.currentPage} من ${totalPages}`;
  if (dom.prevPage) dom.prevPage.disabled = state.currentPage <= 1;
  if (dom.nextPage) dom.nextPage.disabled = state.currentPage >= totalPages;
}

/* ============================================
   SPARKLINES
   ============================================ */
function drawSparklines(rates) {
  const historicalData = getHistoricalSparkData();
  rates.forEach(rate => {
    const canvas = document.getElementById(`spark-${rate.code}`);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const points = getRateHistory(historicalData, rate.code, rate.rate);

    if (points.length < 2) {
      drawFlatSparkline(ctx, w, h, rate.change);
      return;
    }

    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;

    ctx.clearRect(0, 0, w, h);
    ctx.beginPath();
    ctx.strokeStyle = rate.change >= 0 ? '#10b981' : '#ef4444';
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

function getHistoricalSparkData() {
  try {
    const stored = localStorage.getItem('spark_history');
    if (stored) {
      const data = JSON.parse(stored);
      const now = Date.now();
      const validData = {};
      Object.keys(data).forEach(code => {
        validData[code] = data[code].filter(entry => (now - entry.timestamp) < 24 * 60 * 60 * 1000);
      });
      return validData;
    }
  } catch (e) {
    // Corrupted data
  }
  return {};
}

function getRateHistory(historicalData, code, currentRate) {
  if (historicalData[code] && historicalData[code].length > 0) {
    return historicalData[code].map(entry => entry.rate);
  }
  return [currentRate, currentRate];
}

function drawFlatSparkline(ctx, w, h, change) {
  const y = h / 2;
  ctx.clearRect(0, 0, w, h);
  ctx.beginPath();
  ctx.strokeStyle = change >= 0 ? '#10b981' : '#ef4444';
  ctx.lineWidth = 2;
  ctx.setLineDash([3, 3]);
  ctx.moveTo(0, y);
  ctx.lineTo(w, y);
  ctx.stroke();
  ctx.setLineDash([]);
}

function saveSparkData(code, rate) {
  try {
    const stored = localStorage.getItem('spark_history');
    const data = stored ? JSON.parse(stored) : {};
    if (!data[code]) data[code] = [];
    data[code].push({ rate: rate, timestamp: Date.now() });
    if (data[code].length > 30) data[code] = data[code].slice(-30);
    localStorage.setItem('spark_history', JSON.stringify(data));
  } catch (e) {
    // Storage full or unavailable
  }
}

/* ============================================
   QUICK CONVERSIONS
   ============================================ */
function setupQuickConversions() {
  const pairs = [
    ['USD', 'YER'], ['USD', 'SAR'], ['EUR', 'USD'],
    ['GBP', 'USD'], ['USD', 'AED'], ['USD', 'TRY']
  ];

  if (!dom.quickGrid) return;
  dom.quickGrid.textContent = '';

  pairs.forEach(([from, to]) => {
    const fromData = CURRENCIES[from];
    const toData = CURRENCIES[to];

    const item = document.createElement('div');
    item.className = 'quick-item';
    item.dataset.from = from;
    item.dataset.to = to;

    const pairDiv = document.createElement('div');
    pairDiv.className = 'quick-pair';
    pairDiv.textContent = `${fromData.flag} ${from} → ${toData.flag} ${to}`;

    const rateDiv = document.createElement('div');
    rateDiv.className = 'quick-rate';
    rateDiv.id = `quick-${from}-${to}`;
    rateDiv.textContent = '--';

    item.appendChild(pairDiv);
    item.appendChild(rateDiv);

    item.addEventListener('click', () => {
      state.fromCurrency = from;
      state.toCurrency = to;
      selectCurrency('from', state.fromCurrency);
      selectCurrency('to', state.toCurrency);
      document.getElementById('converter')?.scrollIntoView({ behavior: 'smooth' });
      showToast(`تم تحديد ${CURRENCIES[from].name} → ${CURRENCIES[to].name}`, 'info');
    });

    dom.quickGrid.appendChild(item);
  });

  updateQuickConversions();
}

function updateQuickConversions() {
  document.querySelectorAll('.quick-item').forEach(item => {
    const from = item.dataset.from;
    const to = item.dataset.to;
    const fromRate = state.rates[from] || 1;
    const toRate = state.rates[to] || 1;
    const rate = fromRate && toRate ? (toRate / fromRate).toFixed(4) : '--';
    const el = document.getElementById(`quick-${from}-${to}`);
    if (el) el.textContent = `1 ${from} = ${rate} ${to}`;
  });
}

/* ============================================
   CHARTS
   ============================================ */
function setupCharts() {
  drawMainChart();
  drawGoldChart();

  dom.periodBtns?.forEach(btn => {
    btn.addEventListener('click', () => {
      dom.periodBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.chartPeriod = btn.dataset.period;
      drawMainChart();
    });
  });
}

function drawMainChart() {
  const canvas = dom.mainChartCanvas;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width * window.devicePixelRatio;
  canvas.height = rect.height * window.devicePixelRatio;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

  const w = rect.width;
  const h = rect.height;
  const padding = 40;

  const points = generateChartData(state.chartPeriod, 50);
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  ctx.clearRect(0, 0, w, h);

  ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || 'rgba(148,163,184,0.12)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padding + (i / 4) * (h - 2 * padding);
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(w - padding, y);
    ctx.stroke();
  }

  const gradient = ctx.createLinearGradient(0, padding, 0, h - padding);
  gradient.addColorStop(0, 'rgba(245, 158, 11, 0.3)');
  gradient.addColorStop(1, 'rgba(245, 158, 11, 0)');

  ctx.beginPath();
  points.forEach((p, i) => {
    const x = padding + (i / (points.length - 1)) * (w - 2 * padding);
    const y = h - padding - ((p - min) / range) * (h - 2 * padding);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();

  ctx.lineTo(w - padding, h - padding);
  ctx.lineTo(padding, h - padding);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  points.forEach((p, i) => {
    if (i % 10 === 0 || i === points.length - 1) {
      const x = padding + (i / (points.length - 1)) * (w - 2 * padding);
      const y = h - padding - ((p - min) / range) * (h - 2 * padding);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  });
}

function drawGoldChart() {
  const canvas = dom.goldChartCanvas;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width * window.devicePixelRatio;
  canvas.height = rect.height * window.devicePixelRatio;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

  const w = rect.width;
  const h = rect.height;

  const currencies = ['USD', 'EUR', 'GBP', 'SAR', 'AED', 'YER'];
  const goldPrice = state.goldPrice || 2344;
  const barWidth = (w - 60) / currencies.length - 10;
  const maxValue = goldPrice * 1.2;

  ctx.clearRect(0, 0, w, h);

  currencies.forEach((curr, i) => {
    const rate = state.rates[curr] || 1;
    const value = curr === 'USD' ? goldPrice : goldPrice * rate;
    const barHeight = (value / maxValue) * (h - 50);
    const x = 30 + i * (barWidth + 10);
    const y = h - 30 - barHeight;

    const gradient = ctx.createLinearGradient(0, y, 0, h - 30);
    gradient.addColorStop(0, '#fbbf24');
    gradient.addColorStop(1, 'rgba(251, 191, 36, 0.2)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barHeight, 4);
    ctx.fill();

    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() || '#94a3b8';
    ctx.font = '12px Cairo';
    ctx.textAlign = 'center';
    ctx.fillText(curr, x + barWidth / 2, h - 10);
  });
}

function generateChartData(period, count) {
  const historyKey = 'chart_history_YER';
  try {
    const stored = localStorage.getItem(historyKey);
    if (stored) {
      const history = JSON.parse(stored);
      if (history.length >= 2) {
        const periodMap = { '1D': 24, '1W': 7, '1M': 30, '3M': 90 };
        const maxPoints = periodMap[period] || count;
        const recent = history.slice(-maxPoints);
        if (recent.length >= 2) return recent.map(entry => entry.rate);
      }
    }
  } catch (e) {
    // Corrupted data
  }
  const currentRate = state.rates?.YER || CONFIG.YER_RATE;
  return Array(count).fill(currentRate);
}

/* ============================================
   TOP MOVERS
   ============================================ */
function setupTopMovers() {
  const movers = [
    { pair: 'USD/YER', change: 2.5, value: 585.00 },
    { pair: 'EUR/USD', change: -0.8, value: 1.0840 },
    { pair: 'GBP/USD', change: 1.2, value: 1.2670 },
    { pair: 'USD/TRY', change: -1.5, value: 46.34 },
    { pair: 'USD/SAR', change: 0.0, value: 3.7500 },
    { pair: 'BTC/USD', change: 3.2, value: 67500.00 },
    { pair: 'ETH/USD', change: 2.8, value: 3520.00 },
    { pair: 'USD/AED', change: 0.0, value: 3.6700 }
  ];

  if (!dom.topMovers) return;
  dom.topMovers.textContent = '';

  movers.forEach((m, i) => {
    const item = document.createElement('div');
    item.className = 'mover-item';

    const rank = document.createElement('div');
    rank.className = `mover-rank ${i < 3 ? 'top' : ''}`;
    rank.textContent = `${i + 1}`;

    const info = document.createElement('div');
    info.className = 'mover-info';
    const pairName = document.createElement('div');
    pairName.className = 'mover-pair';
    pairName.textContent = m.pair;
    const changeEl = document.createElement('div');
    changeEl.className = 'mover-change';
    changeEl.textContent = `${m.change >= 0 ? '+' : ''}${m.change}%`;
    info.appendChild(pairName);
    info.appendChild(changeEl);

    const value = document.createElement('div');
    value.className = `mover-value ${m.change >= 0 ? 'up' : 'down'}`;
    value.textContent = `${m.change >= 0 ? '▲' : '▼'} ${m.value.toFixed(2)}`;

    item.appendChild(rank);
    item.appendChild(info);
    item.appendChild(value);
    dom.topMovers.appendChild(item);
  });
}

/* ============================================
   CALCULATORS
   ============================================ */
function setupCalculators() {
  [dom.calcAmount, dom.calcFee].forEach(el => {
    el?.addEventListener('input', () => {
      const amount = parseFloat(dom.calcAmount?.value) || 0;
      const fee = parseFloat(dom.calcFee?.value) || 0;
      const feeAmount = amount * (fee / 100);
      const total = amount - feeAmount;
      if (dom.calcFeeResult) {
        dom.calcFeeResult.textContent = '';
        const div1 = document.createElement('div');
        div1.textContent = `العمولة: ${feeAmount.toFixed(2)}`;
        const div2 = document.createElement('div');
        div2.style.cssText = 'font-size:1rem;color:var(--text-secondary)';
        div2.textContent = `الصافي: ${total.toFixed(2)}`;
        dom.calcFeeResult.appendChild(div1);
        dom.calcFeeResult.appendChild(div2);
      }
    });
  });

  [dom.calcBuyRate, dom.calcSellRate, dom.calcInvest].forEach(el => {
    el?.addEventListener('input', () => {
      const buy = parseFloat(dom.calcBuyRate?.value) || 0;
      const sell = parseFloat(dom.calcSellRate?.value) || 0;
      const invest = parseFloat(dom.calcInvest?.value) || 0;
      const profit = (sell - buy) * invest;
      const pct = buy ? ((sell - buy) / buy * 100).toFixed(2) : 0;
      const color = profit >= 0 ? 'var(--success)' : 'var(--danger)';
      if (dom.calcProfitResult) {
        dom.calcProfitResult.textContent = '';
        const div1 = document.createElement('div');
        div1.style.color = color;
        div1.textContent = `${profit >= 0 ? '+' : ''}${profit.toFixed(2)}`;
        const div2 = document.createElement('div');
        div2.style.cssText = 'font-size:1rem;color:var(--text-secondary)';
        div2.textContent = `${pct}%`;
        dom.calcProfitResult.appendChild(div1);
        dom.calcProfitResult.appendChild(div2);
      }
    });
  });

  [dom.calcBatch, dom.calcBatchCurrency].forEach(el => {
    el?.addEventListener('input', () => {
      const lines = dom.calcBatch?.value?.split('\n') || [];
      const currency = dom.calcBatchCurrency?.value || 'USD';
      const rate = state.rates[currency] || 1;
      const yerRate = state.rates.YER || CONFIG.YER_RATE;
      let total = 0;
      lines.forEach(line => {
        const val = parseFloat(line.trim());
        if (!isNaN(val)) total += val;
      });
      const totalYer = (total / rate) * yerRate;
      if (dom.calcBatchResult) {
        dom.calcBatchResult.textContent = `${total.toFixed(2)} ${currency} = ${formatNumber(totalYer, '﷼')}`;
      }
    });
  });
}

/* ============================================
   SAVED CONVERSIONS
   ============================================ */
function saveCurrentConversion() {
  const amount = parseFloat(dom.amountGlobal?.value) || 0;
  const from = state.fromCurrency;
  const to = state.toCurrency;
  const fromRate = state.rates[from] || 1;
  const toRate = state.rates[to] || 1;
  let result;
  if (from === 'USD') result = amount * toRate;
  else if (to === 'USD') result = amount / fromRate;
  else result = (amount / fromRate) * toRate;

  const conversion = {
    id: Date.now(),
    from, to, amount, result,
    date: new Date().toLocaleString('ar-YE')
  };

  state.savedConversions.unshift(conversion);
  if (state.savedConversions.length > 20) state.savedConversions.pop();
  localStorage.setItem('savedConversions', JSON.stringify(state.savedConversions));
  renderSavedConversions();
  showToast('تم حفظ التحويل', 'success');
}

function deleteConversion(id) {
  state.savedConversions = state.savedConversions.filter(c => c.id !== id);
  localStorage.setItem('savedConversions', JSON.stringify(state.savedConversions));
  renderSavedConversions();
}

function renderSavedConversions() {
  if (!dom.savedList) return;
  dom.savedList.textContent = '';

  if (state.savedConversions.length === 0) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'saved-empty';
    const iconDiv = document.createElement('div');
    iconDiv.className = 'saved-empty-icon';
    iconDiv.textContent = '📋';
    const p = document.createElement('p');
    p.textContent = 'لا توجد تحويلات محفوظة بعد';
    emptyDiv.appendChild(iconDiv);
    emptyDiv.appendChild(p);
    dom.savedList.appendChild(emptyDiv);
    return;
  }

  state.savedConversions.forEach(c => {
    const fromData = CURRENCIES[c.from];
    const toData = CURRENCIES[c.to];

    const item = document.createElement('div');
    item.className = 'saved-item';

    const info = document.createElement('div');
    info.className = 'saved-info';

    const pairDiv = document.createElement('div');
    pairDiv.className = 'saved-pair';
    pairDiv.textContent = `${fromData?.flag || '🏳️'} ${c.from} → ${toData?.flag || '🏳️'} ${c.to}`;

    const amountDiv = document.createElement('div');
    amountDiv.className = 'saved-amount';
    amountDiv.textContent = `${c.amount} ${c.from} = ${formatNumber(c.result, toData?.symbol || '')} ${c.to}`;

    const dateDiv = document.createElement('div');
    dateDiv.style.cssText = 'font-size:0.75rem;color:var(--text-muted)';
    dateDiv.textContent = c.date;

    info.appendChild(pairDiv);
    info.appendChild(amountDiv);
    info.appendChild(dateDiv);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'saved-delete';
    deleteBtn.setAttribute('aria-label', 'حذف');
    deleteBtn.textContent = '🗑️';
    deleteBtn.dataset.id = c.id;
    deleteBtn.addEventListener('click', () => {
      deleteConversion(parseInt(deleteBtn.dataset.id));
    });

    item.appendChild(info);
    item.appendChild(deleteBtn);
    dom.savedList.appendChild(item);
  });
}

/* ============================================
   SHARING
   ============================================ */
async function shareConversion() {
  const amount = parseFloat(dom.amountGlobal?.value) || 0;
  const from = state.fromCurrency;
  const to = state.toCurrency;
  const fromData = CURRENCIES[from];
  const toData = CURRENCIES[to];
  const fromRate = state.rates[from] || 1;
  const toRate = state.rates[to] || 1;
  let result;
  if (from === 'USD') result = amount * toRate;
  else if (to === 'USD') result = amount / fromRate;
  else result = (amount / fromRate) * toRate;

  const text = `تحويل عملات via ريال ودولار\n${amount} ${fromData.name} = ${formatNumber(result, toData.symbol)} ${toData.name}\nتاريخ: ${new Date().toLocaleString('ar-YE')}`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: 'ريال ودولار - تحويل عملات',
        text: text,
        url: window.location.href
      });
    } catch (err) {
      // Share cancelled
    }
  } else {
    await navigator.clipboard.writeText(text);
    showToast('تم نسخ النتيجة إلى الحافظة', 'success');
  }
}

/* ============================================
   EVENT LISTENERS
   ============================================ */
function setupEventListeners() {
  window.addEventListener('scroll', throttle(() => {
    if (dom.header) dom.header.classList.toggle('scrolled', window.scrollY > 50);
    if (dom.backToTop) dom.backToTop.classList.toggle('show', window.scrollY > 500);
  }, 100));

  dom.themeToggle?.addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(state.theme);
    localStorage.setItem('theme', state.theme);
    showToast(state.theme === 'dark' ? 'الوضع الداكن' : 'الوضع الفاتح', 'info');
  });

  dom.refreshBtn?.addEventListener('click', () => {
    const icon = dom.refreshBtn.querySelector('.refresh-icon');
    icon?.classList.add('spinning');
    fetchAllData().then(() => {
      setTimeout(() => icon?.classList.remove('spinning'), 800);
      showToast('تم تحديث البيانات', 'success');
    });
  });

  dom.menuToggle?.addEventListener('click', () => {
    const isOpen = dom.mobileMenu?.classList.contains('active');
    dom.mobileMenu?.classList.toggle('active', !isOpen);
    dom.menuToggle?.classList.toggle('active', !isOpen);
    dom.menuToggle?.setAttribute('aria-expanded', !isOpen);
    dom.mobileMenu?.setAttribute('aria-hidden', isOpen);
  });

  dom.menuClose?.addEventListener('click', closeMobileMenu);
  dom.menuOverlay?.addEventListener('click', closeMobileMenu);

  document.querySelectorAll('.nav-link, .mobile-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href?.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
          closeMobileMenu();
          document.querySelectorAll('.nav-link, .mobile-link').forEach(l => l.classList.remove('active'));
          document.querySelectorAll(`[href="${href}"]`).forEach(l => l.classList.add('active'));
        }
      }
    });
  });

  dom.amountGlobal?.addEventListener('input', updateConverter);
  dom.amountLocal?.addEventListener('input', updateLocalConverter);
  dom.localCurrency?.addEventListener('change', updateLocalConverter);
  dom.localRegion?.addEventListener('change', () => {
    updateLocalConverter();
    updateLocalGoldDisplay();
    updateLocalSilverDisplay();
  });

  dom.swapBtn?.addEventListener('click', () => {
    const temp = state.fromCurrency;
    state.fromCurrency = state.toCurrency;
    state.toCurrency = temp;
    selectCurrency('from', state.fromCurrency);
    selectCurrency('to', state.toCurrency);
    dom.swapBtn.style.transform = 'rotate(180deg) scale(1.2)';
    setTimeout(() => dom.swapBtn.style.transform = '', 300);
  });

  dom.swapLocal?.addEventListener('click', () => updateLocalConverter());

  dom.clearAmount?.addEventListener('click', () => {
    if (dom.amountGlobal) dom.amountGlobal.value = '';
    updateConverter();
  });

  dom.tabBtns?.forEach(btn => {
    btn.addEventListener('click', () => {
      dom.tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      dom.panels?.forEach(p => {
        p.classList.toggle('active', p.id === `panel-${tab}`);
      });
    });
  });

  dom.convertBtn?.addEventListener('click', () => {
    updateConverter();
    showToast('تم التحويل', 'success');
  });

  dom.saveConversion?.addEventListener('click', saveCurrentConversion);
  dom.shareConversion?.addEventListener('click', shareConversion);

  [dom.metalType, dom.metalWeight, dom.metalCurrency].forEach(el => {
    el?.addEventListener('input', updateMetalCalculator);
    el?.addEventListener('change', updateMetalCalculator);
  });

  dom.backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  setupCalculators();

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileMenu();
      closeAllDropdowns();
    }
  });

  window.addEventListener('resize', debounce(() => {
    drawMainChart();
    drawGoldChart();
  }, 200));
}

function closeMobileMenu() {
  dom.mobileMenu?.classList.remove('active');
  dom.menuToggle?.classList.remove('active');
  dom.menuToggle?.setAttribute('aria-expanded', 'false');
  dom.mobileMenu?.setAttribute('aria-hidden', 'true');
}

/* ============================================
   THEME
   ============================================ */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

/* ============================================
   NETWORK
   ============================================ */
function setupNetworkListeners() {
  window.addEventListener('online', () => {
    state.isOnline = true;
    dom.offlineBanner?.classList.remove('show');
    showToast('تم استعادة الاتصال', 'success');
    fetchAllData();
  });
  window.addEventListener('offline', () => {
    state.isOnline = false;
    dom.offlineBanner?.classList.add('show');
    showToast('أنت غير متصل بالإنترنت', 'warning');
  });
  if (!navigator.onLine) dom.offlineBanner?.classList.add('show');
}

/* ============================================
   INSTALL PROMPT (PWA)
   ============================================ */
let deferredPrompt = null;

function setupInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    setTimeout(() => {
      if (!localStorage.getItem('install-dismissed')) {
        dom.installPrompt?.classList.add('show');
      }
    }, 30000);
  });

  dom.installBtn?.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') showToast('تم تثبيت التطبيق', 'success');
    deferredPrompt = null;
    dom.installPrompt?.classList.remove('show');
  });

  dom.installClose?.addEventListener('click', () => {
    dom.installPrompt?.classList.remove('show');
    localStorage.setItem('install-dismissed', 'true');
  });

  if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
    if (!localStorage.getItem('ios-install-shown')) {
      setTimeout(() => {
        showToast('اضغط على "مشاركة" ثم "إضافة إلى الشاشة الرئيسية"', 'info', 8000);
        localStorage.setItem('ios-install-shown', 'true');
      }, 10000);
    }
  }
}

/* ============================================
   ANIMATIONS
   ============================================ */
function generateParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    const seed = i * 137;
    particle.style.left = `${(seed % 100)}%`;
    particle.style.top = `${((seed * 7) % 100)}%`;
    particle.style.animationDelay = `${(seed % 18)}s`;
    particle.style.animationDuration = `${12 + (seed % 12)}s`;
    particle.style.width = `${2 + (seed % 4)}px`;
    particle.style.height = particle.style.width;
    container.appendChild(particle);
  }
}

function setupRevealAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('active');
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ============================================
   UPDATE BANNER
   ============================================ */
function showUpdateBanner() {
  dom.updateBanner?.classList.add('show');
  document.getElementById('update-app-btn')?.addEventListener('click', () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.waiting?.postMessage('SKIP_WAITING');
        window.location.reload();
      });
    }
  });
}

/* ============================================
   LOADING
   ============================================ */
function showLoading(show) {
  if (dom.loading) dom.loading.classList.toggle('hidden', !show);
}

function updateLastUpdateTime() {
  if (dom.resultTime && state.lastUpdate) {
    const time = state.lastUpdate.toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' });
    dom.resultTime.textContent = `آخر تحديث: ${time}`;
  }
}

/* ============================================
   TOAST - XSS SAFE
   ============================================ */
function showToast(message, type = 'info', duration = 4000) {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
  const iconSpan = document.createElement('span');
  iconSpan.textContent = icons[type] || 'ℹ';
  const msgSpan = document.createElement('span');
  msgSpan.textContent = message;
  toast.appendChild(iconSpan);
  toast.appendChild(document.createTextNode(' '));
  toast.appendChild(msgSpan);
  dom.toastContainer?.appendChild(toast);
  setTimeout(() => toast.remove(), duration + 350);
}

/* ============================================
   UTILITIES
   ============================================ */
function formatNumber(num, symbol = '') {
  if (isNaN(num)) return '--';
  const abs = Math.abs(num);
  let formatted;
  if (abs >= 1000000) formatted = (num / 1000000).toFixed(2) + 'M';
  else if (abs >= 1000) formatted = num.toLocaleString('en-US', { maximumFractionDigits: 2 });
  else if (abs >= 1) formatted = num.toFixed(2);
  else formatted = num.toFixed(4);
  return symbol ? `${symbol}${formatted}` : formatted;
}

function escapeHtml(text) {
  if (typeof text !== 'string') return text;
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}

function throttle(fn, ms) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= ms) { last = now; fn.apply(this, args); }
  };
}

/* ============================================
   LOCAL RATES STATUS
   ============================================ */
function updateLocalRatesStatus(type, message) {
  if (!dom.localRatesStatus) return;
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const colors = { success: 'var(--success)', error: 'var(--danger)', warning: 'var(--warning)', info: 'var(--info)' };
  dom.localRatesStatus.textContent = '';
  const span = document.createElement('span');
  span.style.color = colors[type];
  span.textContent = `${icons[type]} ${message}`;
  dom.localRatesStatus.appendChild(span);
  dom.localRatesStatus.style.display = 'block';
}

/* ============================================
   EXPOSE GLOBALS
   ============================================ */
window.deleteConversion = deleteConversion;

/* ============================================
   PWA ADVANCED FEATURES
   ============================================ */
async function registerPeriodicSync() {
  if ('serviceWorker' in navigator && 'periodicSync' in navigator.serviceWorker) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.periodicSync.register('update-rates', { minInterval: 60 * 60 * 1000 });
    } catch (err) {
      // Silent fail
    }
  }
}

async function registerBackgroundSync() {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-rates');
    } catch (err) {
      // Silent fail
    }
  }
}

async function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    const result = await Notification.requestPermission();
    if (result === 'granted') {
      // Notifications granted
    }
  }
}

function handleLaunchParams() {
  const params = new URLSearchParams(window.location.search);
  const shortcut = params.get('shortcut');
  if (shortcut) navigateToSection(shortcut);
}

function navigateToSection(section) {
  const map = {
    'converter': '#converter',
    'gold': '#gold-silver',
    'rates': '#rates',
    'trends': '#trends',
    'calculator': '#calculator'
  };
  const target = map[section];
  if (target) document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
}

/* ============================================
   NOTE EDITOR - XSS SAFE
   ============================================ */
function openNoteEditor() {
  const modal = document.createElement('div');
  modal.className = 'note-modal';
  modal.id = 'noteModal-' + Date.now();

  const overlay = document.createElement('div');
  overlay.className = 'note-overlay';
  overlay.addEventListener('click', () => modal.remove());

  const content = document.createElement('div');
  content.className = 'note-content';

  const heading = document.createElement('h3');
  heading.textContent = '📝 ملاحظة جديدة';

  const textarea = document.createElement('textarea');
  textarea.placeholder = 'اكتب ملاحظتك هنا...';

  const actions = document.createElement('div');
  actions.className = 'note-actions';

  const saveBtn = document.createElement('button');
  saveBtn.className = 'btn-primary';
  saveBtn.textContent = 'حفظ';

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn-secondary';
  cancelBtn.textContent = 'إلغاء';

  saveBtn.addEventListener('click', () => {
    const notes = JSON.parse(localStorage.getItem('riyal-notes') || '[]');
    notes.push({ text: textarea.value, date: new Date().toISOString() });
    localStorage.setItem('riyal-notes', JSON.stringify(notes));
    modal.remove();
    showToast('✅ تم حفظ الملاحظة', 'success');
  });

  cancelBtn.addEventListener('click', () => modal.remove());

  actions.appendChild(saveBtn);
  actions.appendChild(cancelBtn);
  content.appendChild(heading);
  content.appendChild(textarea);
  content.appendChild(actions);
  modal.appendChild(overlay);
  modal.appendChild(content);
  document.body.appendChild(modal);
}

/* ============================================
   FILE HANDLING & LAUNCH
   ============================================ */
if ('launchQueue' in window) {
  launchQueue.setConsumer(async (launchParams) => {
    for (const file of launchParams.files) {
      showToast('📁 تم فتح: ' + file.name, 'info');
    }
  });
}

window.addEventListener('load', handleLaunchParams);
