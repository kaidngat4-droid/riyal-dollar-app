async function initDualCalculator() {
    try {
        const r = await fetch('./api/prices_data.json');
        if (!r.ok) return;
        const d = await r.json();
        
        window._goldData = {
            world: { ounce: d.gold?.ounce?.price_usd || 2344 },
            sanaa: d.regions?.sanaa?.gold,
            aden: d.regions?.aden?.gold,
            sanaaUSD: d.regions?.sanaa?.currencies?.USD?.buy || 1500,
            adenUSD: d.regions?.aden?.currencies?.USD?.buy || 533
        };
        
        window.updateMetalCalculator = function() {
            const type = document.getElementById('metal-type')?.value || 'gold-21';
            const weight = parseFloat(document.getElementById('metal-weight')?.value) || 0;
            const currency = document.getElementById('metal-currency')?.value || 'YER';
            const activeTab = document.querySelector('.tab-btn.active')?.dataset?.tab || 'global';
            const region = document.getElementById('local-region')?.value || 'sanaa';
            const usdRate = region === 'aden' ? window._goldData.adenUSD : window._goldData.sanaaUSD;
            
            let pricePerGram;
            
            if (type === 'silver') {
                pricePerGram = (d.silver?.price_usd || 28.8) / 31.1035;
                if (activeTab === 'local') pricePerGram *= usdRate;
            } else if (activeTab === 'local') {
                const goldPrices = region === 'aden' ? window._goldData.aden : window._goldData.sanaa;
                const karat = type.replace('gold-', '') + 'k';
                pricePerGram = goldPrices?.[karat]?.buy || 63000;
            } else {
                const gram24USD = window._goldData.world.ounce / 31.1035;
                switch(type) {
                    case 'gold-24': pricePerGram = gram24USD; break;
                    case 'gold-22': pricePerGram = gram24USD * 0.9167; break;
                    case 'gold-21': pricePerGram = gram24USD * 0.875; break;
                    case 'gold-18': pricePerGram = gram24USD * 0.750; break;
                    default: pricePerGram = gram24USD * 0.875;
                }
                if (currency === 'YER') pricePerGram *= usdRate;
            }
            
            const total = Math.round(pricePerGram * weight);
            const resultEl = document.getElementById('metal-calc-result');
            if (resultEl) {
                const sym = currency === 'YER' ? 'ر.ي' : '$';
                resultEl.textContent = total.toLocaleString() + ' ' + sym;
            }
        };
        
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => setTimeout(() => window.updateMetalCalculator(), 200));
        });
        document.getElementById('local-region')?.addEventListener('change', () => window.updateMetalCalculator());
        
        window.updateMetalCalculator();
        console.log('✅ جاهز');
    } catch(e) {}
}
setTimeout(initDualCalculator, 1000);
