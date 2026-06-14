/* ============================================
   ريال ودولار - Currency, Gold & Silver App
   Main Application JavaScript
   ============================================ */

'use strict';

/* ============================================
   CONFIGURATION
   ============================================ */
const CONFIG = {
  VERSION: '1.0.0',
  API_BASE: 'https://open.er-api.com/v6/latest',
  FALLBACK_API: 'https://api.exchangerate-api.com/v4/latest',
  GOLD_API: 'https://api.gold-api.com/price/XAU',
  SILVER_API: 'https://api.gold-api.com/price/XAG',
  UPDATE_INTERVAL: 60000, // 60 seconds
  CACHE_DURATION: 300000, // 5 minutes
  DEFAULT_FROM: 'USD',
  DEFAULT_TO: 'YER',
  YER_RATE: 500, // Approximate YER rate (will be updated from API)
  LOCAL_RATES: {
    sanaa: { USD: { buy: 533, sell: 535 }, SAR: { buy: 140, sell: 141 } },
    aden: { USD: { buy: 1550, sell: 1558 }, SAR: { buy: 409, sell: 410 } },
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
  { code: 'USD', rate: 1.0, change: 0.15, changePct: 0.02 },
  { code: 'EUR', rate: 0.92, change: -0.08, changePct: -0.09 },
  { code: 'GBP', rate: 0.79, change: 0.05, changePct: 0.06 },
  { code: 'SAR', rate: 3.75, change: 0.0, changePct: 0.0 },
  { code: 'AED', rate: 3.67, change: 0.0, changePct: 0.0 },
  { code: 'KWD', rate: 0.31, change: 0.01, changePct: 0.03 },
  { code: 'QAR', rate: 3.64, change: 0.0, changePct: 0.0 },
  { code: 'OMR', rate: 0.38, change: 0.0, changePct: 0.0 },
  { code: 'BHD', rate: 0.38, change: 0.0, changePct: 0.0 },
  { code: 'JOD', rate: 0.71, change: 0.0, changePct: 0.0 },
  { code: 'EGP', rate: 30.85, change: -0.15, changePct: -0.48 },
  { code: 'TRY', rate: 32.15, change: -0.45, changePct: -1.38 },
  { code: 'CNY', rate: 7.24, change: 0.02, changePct: 0.28 },
  { code: 'JPY', rate: 151.45, change: 0.85, changePct: 0.56 },
  { code: 'INR', rate: 83.45, change: 0.12, changePct: 0.14 },
  { code: 'CAD', rate: 1.36, change: -0.01, changePct: -0.73 },
  { code: 'AUD', rate: 1.52, change: 0.03, changePct: 0.20 },
  { code: 'CHF', rate: 0.91, change: -0.02, changePct: -0.22 },
  { code: 'RUB', rate: 92.50, change: 1.20, changePct: 1.31 },
  { code: 'ZAR', rate: 18.95, change: -0.15, changePct: -0.78 },
  { code: 'BRL', rate: 5.15, change: 0.08, changePct: 0.16 },
  { code: 'MXN', rate: 16.75, change: -0.05, changePct: -0.30 },
  { code: 'SGD', rate: 1.35, change: 0.01, changePct: 0.07 },
  { code: 'HKD', rate: 7.83, change: 0.0, changePct: 0.0 },
  { code: 'KRW', rate: 1350.0, change: 5.0, changePct: 0.37 },
  { code: 'PKR', rate: 278.5, change: -0.5, changePct: -0.18 },
  { code: 'LBP', rate: 89500.0, change: 0.0, changePct: 0.0 },
  { code: 'IQD', rate: 1310.0, change: 0.0, changePct: 0.0 },
  { code: 'BTC', rate: 0.000015, change: 0.000001, changePct: 0.68 },
  { code: 'ETH', rate: 0.00028, change: 0.00001, changePct: 0.36 }
];

/* ============================================
   STATE
   ============================================ */
const state = {
  rates: {},
  goldPrice: 0,
  silverPrice: 0,
  platinumPrice: 0,
  palladiumPrice: 0,
  copperPrice: 0,
  aluminumPrice: 0,
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
  chartCurrency: 'USD'
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
  
  // Converter
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
  
  // Local
  dom.localCurrency = document.getElementById('local-currency');
  dom.localRegion = document.getElementById('local-region');
  dom.swapLocal = document.getElementById('swap-local');
  dom.buyPrice = document.getElementById('buy-price');
  dom.sellPrice = document.getElementById('sell-price');
  dom.totalYer = document.getElementById('total-yer');
  dom.buyTrend = document.getElementById('buy-trend');
  dom.sellTrend = document.getElementById('sell-trend');
  
  // Tabs
  dom.tabBtns = document.querySelectorAll('.tab-btn');
  dom.panels = document.querySelectorAll('.converter-panel');
  
  // Gold/Silver
  dom.goldPriceUsd = document.getElementById('gold-price-usd');
  dom.goldChange = document.getElementById('gold-change');
  dom.goldGram24 = document.getElementById('gold-gram-24');
  dom.goldGram22 = document.getElementById('gold-gram-22');
  dom.goldGram21 = document.getElementById('gold-gram-21');
  dom.goldGram18 = document.getElementById('gold-gram-18');
  dom.goldGram21Yer = document.getElementById('gold-gram-21-yer');
  dom.silverPriceUsd = document.getElementById('silver-price-usd');
  dom.silverChange = document.getElementById('silver-change');
  dom.silverGram = document.getElementById('silver-gram');
  dom.silverKg = document.getElementById('silver-kg');
  dom.silverGramYer = document.getElementById('silver-gram-yer');
  dom.platinumPrice = document.getElementById('platinum-price');
  dom.palladiumPrice = document.getElementById('palladium-price');
  dom.copperPrice = document.getElementById('copper-price');
  dom.aluminumPrice = document.getElementById('aluminum-price');
  
  // Metals Calculator
  dom.metalType = document.getElementById('metal-type');
  dom.metalWeight = document.getElementById('metal-weight');
  dom.metalCurrency = document.getElementById('metal-currency');
  dom.metalCalcResult = document.getElementById('metal-calc-result');
  
  // Rates
  dom.ratesSearch = document.getElementById('rates-search');
  dom.ratesTbody = document.getElementById('rates-tbody');
  dom.filterBtns = document.querySelectorAll('.filter-btn');
  dom.prevPage = document.getElementById('prev-page');
  dom.nextPage = document.getElementById('next-page');
  dom.pageInfo = document.getElementById('page-info');
  
  // Charts
  dom.mainChartCanvas = document.getElementById('main-chart-canvas');
  dom.goldChartCanvas = document.getElementById('gold-chart-canvas');
  dom.periodBtns = document.querySelectorAll('.period-btn');
  dom.topMovers = document.getElementById('top-movers');
  
  // Calculator
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
  
  // Saved
  dom.savedList = document.getElementById('saved-list');
  
  // Quick
  dom.quickGrid = document.getElementById('quick-grid');
}

/* ============================================
   INITIALIZATION
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  cacheDOM();
  initApp();
});

async function initApp() {
  // Register Service Worker
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('[App] SW registered:', registration.scope);
      
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateBanner();
          }
        });
      });
    } catch (err) {
      console.warn('[App] SW registration failed:', err);
    }
  }
  
  // Theme
  applyTheme(state.theme);
  
  // Setup Event Listeners
  setupEventListeners();
  
  // Generate particles
  generateParticles();
  
  // Setup currency dropdowns
  setupCurrencyDropdowns();
  
  // Setup rates table
  setupRatesTable();
  
  // Setup quick conversions
  setupQuickConversions();
  
  // Setup charts
  setupCharts();
  
  // Setup top movers
  setupTopMovers();
  
  // Load saved conversions
  renderSavedConversions();
  
  // Fetch data
  await fetchAllData();
  
  // Hide splash
  setTimeout(() => {
    if (dom.splash) dom.splash.classList.add('hidden');
  }, 1500);
  
  // Setup periodic updates
  setInterval(fetchAllData, CONFIG.UPDATE_INTERVAL);
  
  // Setup reveal animations
  setupRevealAnimations();
  
  // Install prompt
  setupInstallPrompt();
  
  // Online/Offline
  setupNetworkListeners();
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
    console.error('[App] Fetch error:', err);
    showLoading(false);
    showToast('تعذر تحديث البيانات. استخدام البيانات المخزنة.', 'warning');
  }
}

async function fetchRates() {
  try {
    const response = await fetch(`${CONFIG.API_BASE}/USD`);
    if (!response.ok) throw new Error('Rate fetch failed');
    const data = await response.json();
    
    if (data.rates) {
      state.rates = data.rates;
      // Add YER if not present
      if (!state.rates.YER) {
        state.rates.YER = CONFIG.YER_RATE;
      }
      updateConverter();
      updateRatesTable();
      updateQuickConversions();
    }
  } catch (err) {
    console.warn('[App] Using fallback rates');
    // Use fallback rates
    state.rates = {
      USD: 1, EUR: 0.92, GBP: 0.79, JPY: 151.45, CNY: 7.24,
      SAR: 3.75, AED: 3.67, KWD: 0.31, QAR: 3.64, OMR: 0.38,
      BHD: 0.38, JOD: 0.71, EGP: 30.85, TRY: 32.15, INR: 83.45,
      CAD: 1.36, AUD: 1.52, CHF: 0.91, RUB: 92.50, ZAR: 18.95,
      BRL: 5.15, MXN: 16.75, SGD: 1.35, HKD: 7.83, KRW: 1350,
      PKR: 278.5, LBP: 89500, IQD: 1310, YER: 500
    };
    updateConverter();
    updateRatesTable();
    updateQuickConversions();
  }
}

async function fetchMetals() {
  try {
    // Simulated metal prices (in production, use real API)
    state.goldPrice = 2345.50 + (Math.random() - 0.5) * 10;
    state.silverPrice = 28.75 + (Math.random() - 0.5) * 0.5;
    state.platinumPrice = 1025.00 + (Math.random() - 0.5) * 5;
    state.palladiumPrice = 950.00 + (Math.random() - 0.5) * 5;
    state.copperPrice = 4.25 + (Math.random() - 0.5) * 0.1;
    state.aluminumPrice = 2.35 + (Math.random() - 0.5) * 0.05;
    
    updateMetalsDisplay();
  } catch (err) {
    console.warn('[App] Metal fetch error:', err);
  }
}

/* ============================================
   CONVERTER
   ============================================ */
function setupCurrencyDropdowns() {
  const optionsHTML = Object.entries(CURRENCIES).map(([code, data]) => `
    <div class="currency-option" data-code="${code}" role="option">
      <span class="currency-flag">${data.flag}</span>
      <div class="currency-info">
        <span class="currency-code">${code}</span>
        <span class="currency-name">${data.name}</span>
      </div>
    </div>
  `).join('');
  
  if (dom.fromOptions) dom.fromOptions.innerHTML = optionsHTML;
  if (dom.toOptions) dom.toOptions.innerHTML = optionsHTML;
  
  // Select initial
  selectCurrency('from', state.fromCurrency);
  selectCurrency('to', state.toCurrency);
  
  // Dropdown toggle
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
  
  // Option selection
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
  
  // Update selected option styling
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
  if (!rates) return;
  
  const buyTotal = amount * rates.buy;
  const sellTotal = amount * rates.sell;
  
  if (dom.buyPrice) dom.buyPrice.textContent = formatNumber(buyTotal, '');
  if (dom.sellPrice) dom.sellPrice.textContent = formatNumber(sellTotal, '');
  if (dom.totalYer) dom.totalYer.textContent = formatNumber(buyTotal, '');
  
  // Trends (simulated)
  if (dom.buyTrend) dom.buyTrend.textContent = Math.random() > 0.5 ? '▲' : '▼';
  if (dom.sellTrend) dom.sellTrend.textContent = Math.random() > 0.5 ? '▲' : '▼';
  if (dom.buyTrend) dom.buyTrend.style.color = dom.buyTrend.textContent === '▲' ? 'var(--success)' : 'var(--danger)';
  if (dom.sellTrend) dom.sellTrend.style.color = dom.sellTrend.textContent === '▲' ? 'var(--success)' : 'var(--danger)';
}

function updateMetalsDisplay() {
  const gold = state.goldPrice;
  const silver = state.silverPrice;
  const yerRate = state.rates.YER || CONFIG.YER_RATE;
  
  // Gold
  if (dom.goldPriceUsd) dom.goldPriceUsd.textContent = formatNumber(gold, '$');
  if (dom.goldChange) {
    const change = (Math.random() - 0.5) * 5;
    const pct = (change / gold * 100).toFixed(2);
    dom.goldChange.innerHTML = `
      <span class="change-icon">${change >= 0 ? '▲' : '▼'}</span>
      <span class="change-value" style="color: ${change >= 0 ? 'var(--success)' : 'var(--danger)'}">${Math.abs(change).toFixed(2)}</span>
      <span class="change-percent">(${change >= 0 ? '+' : ''}${pct}%)</span>
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
    const change = (Math.random() - 0.5) * 0.5;
    const pct = (change / silver * 100).toFixed(2);
    dom.silverChange.innerHTML = `
      <span class="change-icon">${change >= 0 ? '▲' : '▼'}</span>
      <span class="change-value" style="color: ${change >= 0 ? 'var(--success)' : 'var(--danger)'}">${Math.abs(change).toFixed(2)}</span>
      <span class="change-percent">(${change >= 0 ? '+' : ''}${pct}%)</span>
    `;
  }
  
  const silverGram = silver / 31.1035;
  if (dom.silverGram) dom.silverGram.textContent = formatNumber(silverGram, '$');
  if (dom.silverKg) dom.silverKg.textContent = formatNumber(silverGram * 1000, '$');
  if (dom.silverGramYer) dom.silverGramYer.textContent = formatNumber(silverGram * yerRate, '﷼');
  
  // Other metals
  if (dom.platinumPrice) dom.platinumPrice.textContent = formatNumber(state.platinumPrice, '$');
  if (dom.palladiumPrice) dom.palladiumPrice.textContent = formatNumber(state.palladiumPrice, '$');
  if (dom.copperPrice) dom.copperPrice.textContent = formatNumber(state.copperPrice, '$');
  if (dom.aluminumPrice) dom.aluminumPrice.textContent = formatNumber(state.aluminumPrice, '$');
  
  updateMetalCalculator();
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
  
  if (currency === 'YER') {
    total *= (state.rates.YER || CONFIG.YER_RATE);
  } else if (currency === 'SAR') {
    total *= (state.rates.SAR || 3.75);
  } else if (currency === 'EUR') {
    total /= (state.rates.USD || 1);
    total *= (state.rates.EUR || 0.92);
  }
  
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
      if (state.currentPage > 1) {
        state.currentPage--;
        updateRatesTable();
      }
    });
  }
  
  if (dom.nextPage) {
    dom.nextPage.addEventListener('click', () => {
      const totalPages = Math.ceil(getFilteredRates().length / state.itemsPerPage);
      if (state.currentPage < totalPages) {
        state.currentPage++;
        updateRatesTable();
      }
    });
  }
}

function getFilteredRates() {
  let rates = [...RATES_TABLE_DATA];
  
  // Filter by category
  if (state.currentFilter !== 'all') {
    rates = rates.filter(r => {
      const curr = CURRENCIES[r.code];
      return curr?.category === state.currentFilter;
    });
  }
  
  // Search
  const search = dom.ratesSearch?.value?.toLowerCase() || '';
  if (search) {
    rates = rates.filter(r => {
      const curr = CURRENCIES[r.code];
      return r.code.toLowerCase().includes(search) ||
             curr?.name?.toLowerCase().includes(search);
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
  
  if (pageRates.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--text-muted)">لا توجد نتائج</td></tr>`;
  } else {
    tbody.innerHTML = pageRates.map((rate, i) => {
      const curr = CURRENCIES[rate.code];
      const changeClass = rate.change > 0 ? 'change-up' : rate.change < 0 ? 'change-down' : 'change-neutral';
      const changeIcon = rate.change > 0 ? '▲' : rate.change < 0 ? '▼' : '—';
      const yerRate = state.rates.YER ? (rate.rate * state.rates.YER).toFixed(2) : '--';
      
      return `
        <tr>
          <td>
            <div class="currency-cell">
              <span class="currency-cell-flag">${curr?.flag || '🏳️'}</span>
              <div class="currency-cell-info">
                <span class="currency-cell-code">${rate.code}</span>
                <span class="currency-cell-name">${curr?.name || rate.code}</span>
              </div>
            </div>
          </td>
          <td><span class="rate-value">${rate.rate.toFixed(4)}</span></td>
          <td><span class="rate-value">${yerRate}</span> <span style="color:var(--text-muted);font-size:0.75rem">YER</span></td>
          <td class="${changeClass}"><span class="change-value">${changeIcon} ${Math.abs(rate.change).toFixed(2)}</span></td>
          <td class="${changeClass}"><span class="change-value">${changeIcon} ${Math.abs(rate.changePct).toFixed(2)}%</span></td>
          <td><canvas class="sparkline" id="spark-${rate.code}" width="80" height="30"></canvas></td>
        </tr>
      `;
    }).join('');
    
    // Draw sparklines
    setTimeout(() => drawSparklines(pageRates), 100);
  }
  
  if (dom.pageInfo) dom.pageInfo.textContent = `صفحة ${state.currentPage} من ${totalPages}`;
  if (dom.prevPage) dom.prevPage.disabled = state.currentPage <= 1;
  if (dom.nextPage) dom.nextPage.disabled = state.currentPage >= totalPages;
}

function drawSparklines(rates) {
  rates.forEach(rate => {
    const canvas = document.getElementById(`spark-${rate.code}`);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    
    // Generate random trend data
    const points = [];
    let val = rate.rate;
    for (let i = 0; i < 20; i++) {
      val += (Math.random() - 0.5) * rate.rate * 0.02;
      points.push(val);
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

/* ============================================
   QUICK CONVERSIONS
   ============================================ */
function setupQuickConversions() {
  const pairs = [
    ['USD', 'YER'], ['USD', 'SAR'], ['EUR', 'USD'],
    ['GBP', 'USD'], ['USD', 'AED'], ['USD', 'TRY']
  ];
  
  if (!dom.quickGrid) return;
  
  dom.quickGrid.innerHTML = pairs.map(([from, to]) => {
    const fromData = CURRENCIES[from];
    const toData = CURRENCIES[to];
    return `
      <div class="quick-item" data-from="${from}" data-to="${to}">
        <div class="quick-pair">${fromData.flag} ${from} → ${toData.flag} ${to}</div>
        <div class="quick-rate" id="quick-${from}-${to}">--</div>
      </div>
    `;
  }).join('');
  
  dom.quickGrid.querySelectorAll('.quick-item').forEach(item => {
    item.addEventListener('click', () => {
      state.fromCurrency = item.dataset.from;
      state.toCurrency = item.dataset.to;
      selectCurrency('from', state.fromCurrency);
      selectCurrency('to', state.toCurrency);
      document.getElementById('converter')?.scrollIntoView({ behavior: 'smooth' });
      showToast(`تم تحديد ${CURRENCIES[state.fromCurrency].name} → ${CURRENCIES[state.toCurrency].name}`, 'info');
    });
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
  
  // Generate data based on period
  const points = generateChartData(state.chartPeriod, 50);
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  
  ctx.clearRect(0, 0, w, h);
  
  // Grid
  ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || 'rgba(148,163,184,0.12)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padding + (i / 4) * (h - 2 * padding);
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(w - padding, y);
    ctx.stroke();
  }
  
  // Line
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
  
  // Fill
  ctx.lineTo(w - padding, h - padding);
  ctx.lineTo(padding, h - padding);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();
  
  // Points
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
  const goldPrice = state.goldPrice || 2345;
  const barWidth = (w - 60) / currencies.length - 10;
  const maxValue = goldPrice * 1.2;
  
  ctx.clearRect(0, 0, w, h);
  
  currencies.forEach((curr, i) => {
    const rate = state.rates[curr] || 1;
    const value = curr === 'USD' ? goldPrice : goldPrice * rate;
    const barHeight = (value / maxValue) * (h - 50);
    const x = 30 + i * (barWidth + 10);
    const y = h - 30 - barHeight;
    
    // Bar
    const gradient = ctx.createLinearGradient(0, y, 0, h - 30);
    gradient.addColorStop(0, '#fbbf24');
    gradient.addColorStop(1, 'rgba(251, 191, 36, 0.2)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barHeight, 4);
    ctx.fill();
    
    // Label
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() || '#94a3b8';
    ctx.font = '12px Cairo';
    ctx.textAlign = 'center';
    ctx.fillText(curr, x + barWidth / 2, h - 10);
  });
}

function generateChartData(period, count) {
  const base = 500;
  const volatility = period === '1D' ? 5 : period === '1W' ? 15 : period === '1M' ? 30 : 50;
  const points = [];
  let val = base;
  for (let i = 0; i < count; i++) {
    val += (Math.random() - 0.5) * volatility;
    points.push(Math.max(val, base * 0.8));
  }
  return points;
}

/* ============================================
   TOP MOVERS
   ============================================ */
function setupTopMovers() {
  const movers = [
    { pair: 'USD/YER', change: 2.5, value: 585.00 },
    { pair: 'EUR/USD', change: -0.8, value: 1.0840 },
    { pair: 'GBP/USD', change: 1.2, value: 1.2670 },
    { pair: 'USD/TRY', change: -1.5, value: 32.15 },
    { pair: 'USD/SAR', change: 0.0, value: 3.7500 },
    { pair: 'BTC/USD', change: 3.2, value: 67500.00 },
    { pair: 'ETH/USD', change: 2.8, value: 3520.00 },
    { pair: 'USD/AED', change: 0.0, value: 3.6700 }
  ];
  
  if (!dom.topMovers) return;
  
  dom.topMovers.innerHTML = movers.map((m, i) => `
    <div class="mover-item">
      <div class="mover-rank ${i < 3 ? 'top' : ''}">${i + 1}</div>
      <div class="mover-info">
        <div class="mover-pair">${m.pair}</div>
        <div class="mover-change">${m.change >= 0 ? '+' : ''}${m.change}%</div>
      </div>
      <div class="mover-value ${m.change >= 0 ? 'up' : 'down'}">${m.change >= 0 ? '▲' : '▼'} ${m.value.toFixed(2)}</div>
    </div>
  `).join('');
}

/* ============================================
   CALCULATORS
   ============================================ */
function setupCalculators() {
  // Fee calculator
  [dom.calcAmount, dom.calcFee].forEach(el => {
    el?.addEventListener('input', () => {
      const amount = parseFloat(dom.calcAmount?.value) || 0;
      const fee = parseFloat(dom.calcFee?.value) || 0;
      const feeAmount = amount * (fee / 100);
      const total = amount - feeAmount;
      if (dom.calcFeeResult) {
        dom.calcFeeResult.innerHTML = `
          <div>العمولة: ${feeAmount.toFixed(2)}</div>
          <div style="font-size:1rem;color:var(--text-secondary)">الصافي: ${total.toFixed(2)}</div>
        `;
      }
    });
  });
  
  // Profit calculator
  [dom.calcBuyRate, dom.calcSellRate, dom.calcInvest].forEach(el => {
    el?.addEventListener('input', () => {
      const buy = parseFloat(dom.calcBuyRate?.value) || 0;
      const sell = parseFloat(dom.calcSellRate?.value) || 0;
      const invest = parseFloat(dom.calcInvest?.value) || 0;
      const profit = (sell - buy) * invest;
      const pct = buy ? ((sell - buy) / buy * 100).toFixed(2) : 0;
      const color = profit >= 0 ? 'var(--success)' : 'var(--danger)';
      if (dom.calcProfitResult) {
        dom.calcProfitResult.innerHTML = `
          <div style="color:${color}">${profit >= 0 ? '+' : ''}${profit.toFixed(2)}</div>
          <div style="font-size:1rem;color:var(--text-secondary)">${pct}%</div>
        `;
      }
    });
  });
  
  // Batch calculator
  [dom.calcBatch, dom.calcBatchCurrency].forEach(el => {
    el?.addEventListener('input', () => {
      const lines = dom.calcBatch?.value?.split('\\n') || [];
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
    from,
    to,
    amount,
    result,
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
  showToast('تم حذف التحويل', 'info');
}

function renderSavedConversions() {
  if (!dom.savedList) return;
  
  if (state.savedConversions.length === 0) {
    dom.savedList.innerHTML = `
      <div class="saved-empty">
        <div class="saved-empty-icon">📋</div>
        <p>لا توجد تحويلات محفوظة بعد</p>
      </div>
    `;
    return;
  }
  
  dom.savedList.innerHTML = state.savedConversions.map(c => {
    const fromData = CURRENCIES[c.from];
    const toData = CURRENCIES[c.to];
    return `
      <div class="saved-item">
        <div class="saved-info">
          <div class="saved-pair">${fromData?.flag || '🏳️'} ${c.from} → ${toData?.flag || '🏳️'} ${c.to}</div>
          <div class="saved-amount">${c.amount} ${c.from} = ${formatNumber(c.result, toData?.symbol || '')} ${c.to}</div>
          <div style="font-size:0.75rem;color:var(--text-muted)">${c.date}</div>
        </div>
        <button class="saved-delete" onclick="deleteConversion(${c.id})" aria-label="حذف">🗑️</button>
      </div>
    `;
  }).join('');
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
  
  const text = `تحويل عملات via ريال ودولار\\n${amount} ${fromData.name} = ${formatNumber(result, toData.symbol)} ${toData.name}\\nتاريخ: ${new Date().toLocaleString('ar-YE')}`;
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'ريال ودولار - تحويل عملات',
        text: text,
        url: window.location.href
      });
    } catch (err) {
      console.log('Share cancelled');
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
  // Header scroll
  window.addEventListener('scroll', throttle(() => {
    if (dom.header) {
      dom.header.classList.toggle('scrolled', window.scrollY > 50);
    }
    if (dom.backToTop) {
      dom.backToTop.classList.toggle('show', window.scrollY > 500);
    }
  }, 100));
  
  // Theme toggle
  dom.themeToggle?.addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(state.theme);
    localStorage.setItem('theme', state.theme);
    showToast(state.theme === 'dark' ? 'الوضع الداكن' : 'الوضع الفاتح', 'info');
  });
  
  // Refresh
  dom.refreshBtn?.addEventListener('click', () => {
    const icon = dom.refreshBtn.querySelector('.refresh-icon');
    icon?.classList.add('spinning');
    fetchAllData().then(() => {
      setTimeout(() => icon?.classList.remove('spinning'), 800);
      showToast('تم تحديث البيانات', 'success');
    });
  });
  
  // Mobile menu
  dom.menuToggle?.addEventListener('click', () => {
    const isOpen = dom.mobileMenu?.classList.contains('active');
    dom.mobileMenu?.classList.toggle('active', !isOpen);
    dom.menuToggle?.classList.toggle('active', !isOpen);
    dom.menuToggle?.setAttribute('aria-expanded', !isOpen);
    dom.mobileMenu?.setAttribute('aria-hidden', isOpen);
  });
  
  dom.menuClose?.addEventListener('click', closeMobileMenu);
  dom.menuOverlay?.addEventListener('click', closeMobileMenu);
  
  // Navigation
  document.querySelectorAll('.nav-link, .mobile-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href?.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
          closeMobileMenu();
          
          // Update active nav
          document.querySelectorAll('.nav-link, .mobile-link').forEach(l => l.classList.remove('active'));
          document.querySelectorAll(`[href="${href}"]`).forEach(l => l.classList.add('active'));
        }
      }
    });
  });
  
  // Converter inputs
  dom.amountGlobal?.addEventListener('input', updateConverter);
  dom.amountLocal?.addEventListener('input', updateLocalConverter);
  dom.localCurrency?.addEventListener('change', updateLocalConverter);
  dom.localRegion?.addEventListener('change', updateLocalConverter);
  
  // Swap
  dom.swapBtn?.addEventListener('click', () => {
    const temp = state.fromCurrency;
    state.fromCurrency = state.toCurrency;
    state.toCurrency = temp;
    selectCurrency('from', state.fromCurrency);
    selectCurrency('to', state.toCurrency);
    
    // Animate
    dom.swapBtn.style.transform = 'rotate(180deg) scale(1.2)';
    setTimeout(() => dom.swapBtn.style.transform = '', 300);
  });
  
  dom.swapLocal?.addEventListener('click', () => {
    // Just refresh for local
    updateLocalConverter();
  });
  
  // Clear amount
  dom.clearAmount?.addEventListener('click', () => {
    if (dom.amountGlobal) dom.amountGlobal.value = '';
    updateConverter();
  });
  
  // Tabs
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
  
  // Convert button
  dom.convertBtn?.addEventListener('click', () => {
    updateConverter();
    showToast('تم التحويل', 'success');
  });
  
  // Save
  dom.saveConversion?.addEventListener('click', saveCurrentConversion);
  
  // Share
  dom.shareConversion?.addEventListener('click', shareConversion);
  
  // Metals calculator
  [dom.metalType, dom.metalWeight, dom.metalCurrency].forEach(el => {
    el?.addEventListener('input', updateMetalCalculator);
    el?.addEventListener('change', updateMetalCalculator);
  });
  
  // Back to top
  dom.backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  
  // Calculators
  setupCalculators();
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileMenu();
      closeAllDropdowns();
    }
  });
  
  // Resize charts
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
  
  if (!navigator.onLine) {
    dom.offlineBanner?.classList.add('show');
  }
}

/* ============================================
   INSTALL PROMPT (PWA)
   ============================================ */
let deferredPrompt = null;

function setupInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show after 30 seconds or on scroll
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
    if (outcome === 'accepted') {
      showToast('تم تثبيت التطبيق', 'success');
    }
    deferredPrompt = null;
    dom.installPrompt?.classList.remove('show');
  });
  
  dom.installClose?.addEventListener('click', () => {
    dom.installPrompt?.classList.remove('show');
    localStorage.setItem('install-dismissed', 'true');
  });
  
  // iOS hint
  if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
    if (!localStorage.getItem('ios-install-shown')) {
      setTimeout(() => {
        showToast('اضغط على \"مشاركة\" ثم \"إضافة إلى الشاشة الرئيسية\"', 'info', 8000);
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
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.animationDelay = `${Math.random() * 18}s`;
    particle.style.animationDuration = `${12 + Math.random() * 12}s`;
    particle.style.width = `${2 + Math.random() * 4}px`;
    particle.style.height = particle.style.width;
    container.appendChild(particle);
  }
}

function setupRevealAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
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
  if (dom.loading) {
    dom.loading.classList.toggle('hidden', !show);
  }
}

function updateLastUpdateTime() {
  if (dom.resultTime && state.lastUpdate) {
    const time = state.lastUpdate.toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' });
    dom.resultTime.textContent = `آخر تحديث: ${time}`;
  }
}

/* ============================================
   TOAST
   ============================================ */
function showToast(message, type = 'info', duration = 4000) {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
  toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span> <span>${message}</span>`;
  
  dom.toastContainer?.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, duration + 350);
}

/* ============================================
   UTILITIES
   ============================================ */
function formatNumber(num, symbol = '') {
  if (isNaN(num)) return '--';
  const abs = Math.abs(num);
  let formatted;
  if (abs >= 1000000) {
    formatted = (num / 1000000).toFixed(2) + 'M';
  } else if (abs >= 1000) {
    formatted = num.toLocaleString('en-US', { maximumFractionDigits: 2 });
  } else if (abs >= 1) {
    formatted = num.toFixed(2);
  } else {
    formatted = num.toFixed(4);
  }
  return symbol ? `${symbol}${formatted}` : formatted;
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
    if (now - last >= ms) {
      last = now;
      fn.apply(this, args);
    }
  };
}

/* ============================================
   EXPOSE GLOBALS
   ============================================ */
window.deleteConversion = deleteConversion;


// ============ تسجيل Periodic Sync ============
async function registerPeriodicSync() {
    if ('serviceWorker' in navigator && 'periodicSync' in navigator.serviceWorker) {
        try {
            const registration = await navigator.serviceWorker.ready;
            await registration.periodicSync.register('update-rates', {
                minInterval: 60 * 60 * 1000 // كل ساعة
            });
            console.log('✅ Periodic Sync registered');
        } catch (err) {
            console.log('⚠️ Periodic Sync not supported:', err);
        }
    }
}

// ============ تسجيل Background Sync ============
async function registerBackgroundSync() {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
        try {
            const registration = await navigator.serviceWorker.ready;
            await registration.sync.register('sync-rates');
            console.log('✅ Background Sync registered');
        } catch (err) {
            console.log('⚠️ Background Sync not supported');
        }
    }
}

// ============ طلب إذن الإشعارات ============
async function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        const result = await Notification.requestPermission();
        if (result === 'granted') {
            console.log('✅ Push notifications granted');
        }
    }
}

// استدعاء عند التحميل
document.addEventListener('DOMContentLoaded', () => {
    registerPeriodicSync();
    registerBackgroundSync();
    setTimeout(requestNotificationPermission, 5000); // بعد 5 ثواني
});

// ============================================================
// PWA ADVANCED FEATURES
// ============================================================

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
  if (target) {
    document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
  }
}

function openNoteEditor() {
  const modal = document.createElement('div');
  modal.className = 'note-modal';
  modal.innerHTML = '<div class="note-overlay" onclick="this.parentElement.remove()"></div><div class="note-content"><h3>📝 ملاحظة جديدة</h3><textarea placeholder="اكتب ملاحظتك هنا..."></textarea><div class="note-actions"><button class="btn-primary" onclick="saveNote(this)">حفظ</button><button class="btn-secondary" onclick="this.closest(\'.note-modal\').remove()">إلغاء</button></div></div>';
  document.body.appendChild(modal);
}

function saveNote(btn) {
  const textarea = btn.closest('.note-content').querySelector('textarea');
  const notes = JSON.parse(localStorage.getItem('riyal-notes') || '[]');
  notes.push({ text: textarea.value, date: new Date().toISOString() });
  localStorage.setItem('riyal-notes', JSON.stringify(notes));
  btn.closest('.note-modal').remove();
  showToast('✅ تم حفظ الملاحظة');
}

// File Handling
if ('launchQueue' in window) {
  launchQueue.setConsumer(async (launchParams) => {
    for (const file of launchParams.files) {
      showToast('📁 تم فتح: ' + file.name);
    }
  });
}

window.addEventListener('load', handleLaunchParams);

// تحميل الأسعار المحلية من JSON
async function loadLocalPrices() {
    try {
        const r = await fetch('./api/prices_data.json');
        if (r.ok) {
            const d = await r.json();
            if (d.regions) {
                CONFIG.LOCAL_RATES = {
                    sanaa: {
                        USD: { buy: d.regions.sanaa.currencies.USD.buy, sell: d.regions.sanaa.currencies.USD.sell },
                        SAR: { buy: d.regions.sanaa.currencies.SAR.buy, sell: d.regions.sanaa.currencies.SAR.sell }
                    },
                    aden: {
                        USD: { buy: d.regions.aden.currencies.USD.buy, sell: d.regions.aden.currencies.USD.sell },
                        SAR: { buy: d.regions.aden.currencies.SAR.buy, sell: d.regions.aden.currencies.SAR.sell }
                    }
                };
                console.log('✅ تم تحميل الأسعار المحلية');
            }
        }
    } catch(e) {}
}

document.addEventListener('DOMContentLoaded', loadLocalPrices);

// ============ تحديث الأسعار من prices_data.json ============
async function updatePricesFromJSON() {
    try {
        const r = await fetch('./api/prices_data.json?t=' + Date.now());
        if (!r.ok) return;
        const d = await r.json();
        
        if (d.regions) {
            // تحديث كل المناطق
            for (const [key, region] of Object.entries(d.regions)) {
                if (CONFIG.LOCAL_RATES[key] && region.currencies) {
                    CONFIG.LOCAL_RATES[key] = {
                        USD: {
                            buy: region.currencies.USD.buy,
                            sell: region.currencies.USD.sell
                        },
                        SAR: {
                            buy: region.currencies.SAR.buy,
                            sell: region.currencies.SAR.sell
                        }
                    };
                }
            }
            
            // تحديث العناصر في الصفحة
            if (typeof updateLocalConverter === 'function') {
                updateLocalConverter();
            }
            if (typeof performGlobalConversion === 'function') {
                performGlobalConversion();
            }
            
            console.log('✅ الأسعار محدثة من prices_data.json');
            console.log('📍 صنعاء USD:', CONFIG.LOCAL_RATES.sanaa.USD.buy);
            console.log('📍 عدن USD:', CONFIG.LOCAL_RATES.aden.USD.buy);
        }
    } catch(e) {
        console.log('⚠️ استخدام الأسعار الافتراضية');
    }
}

// استدعاء عند التحميل
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(updatePricesFromJSON, 500);
});

// تحديث كل 5 دقائق
setInterval(updatePricesFromJSON, 300000);

// ============ تصحيح حاسبة الذهب ============
function fixGoldCalculator() {
    const TROY_OUNCE = 31.1035; // 1 أونصة = 31.1035 جرام
    
    // احصل على سعر الذهب العالمي وسعر الصرف
    const goldOuncePrice = state.metals?.gold || 2345;
    const yerRate = CONFIG.LOCAL_RATES.sanaa.USD.buy || 533;
    
    // احفظ الدوال الأصلية
    const origCalc = window.updateMetalCalculator;
    
    // استبدل دالة الحساب
    window.updateMetalCalculator = function() {
        const type = document.getElementById('metal-type')?.value || 'gold-21';
        const weight = parseFloat(document.getElementById('metal-weight')?.value) || 0;
        const currency = document.getElementById('metal-currency')?.value || 'YER';
        
        // سعر الجرام 24k بالدولار
        const gram24USD = goldOuncePrice / TROY_OUNCE;
        
        let pricePerGram;
        switch(type) {
            case 'gold-24': pricePerGram = gram24USD; break;
            case 'gold-22': pricePerGram = gram24USD * 0.9167; break;
            case 'gold-21': pricePerGram = gram24USD * 0.875; break;
            case 'gold-18': pricePerGram = gram24USD * 0.750; break;
            case 'silver': pricePerGram = state.metals?.silver / TROY_OUNCE || 0.9; break;
            default: pricePerGram = gram24USD * 0.875;
        }
        
        let total = pricePerGram * weight;
        
        // تحويل العملة
        if (currency === 'YER') total *= yerRate;
        else if (currency === 'SAR') total *= (CONFIG.LOCAL_RATES.sanaa.SAR?.buy || 140);
        
        const resultEl = document.getElementById('metal-calc-result');
        if (resultEl) {
            resultEl.textContent = Math.round(total).toLocaleString() + ' ' + currency;
        }
    };
    
    // شغل الحاسبة
    if (typeof window.updateMetalCalculator === 'function') {
        window.updateMetalCalculator();
    }
}

// شغل التصحيح بعد التحميل
setTimeout(fixGoldCalculator, 1000);
