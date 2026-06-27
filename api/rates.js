// ============================================
// Vercel Serverless Function: Currency Rates Proxy
// Endpoint: /api/rates?base=USD
// Sources: exchangerate-api.com (free, no key, CORS enabled)
//          open.er-api.com (free, no key, CORS enabled)
// ============================================

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=600');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { base = 'USD' } = req.query;

  if (!base || typeof base !== 'string' || base.length !== 3) {
    return res.status(400).json({
      success: false,
      error: 'Invalid base currency. Use 3-letter code (e.g. USD, EUR).'
    });
  }

  const sources = [
    {
      name: 'exchangerate-api',
      url: `https://api.exchangerate-api.com/v4/latest/${base.toUpperCase()}`,
      transform: (data) => ({
        base: data.base,
        date: data.date,
        rates: data.rates,
        source: 'exchangerate-api'
      })
    },
    {
      name: 'open-er',
      url: `https://open.er-api.com/v6/latest/${base.toUpperCase()}`,
      transform: (data) => ({
        base: data.base_code || data.base,
        date: new Date().toISOString().split('T')[0],
        rates: data.rates,
        source: 'open-er-api'
      })
    }
  ];

  for (const source of sources) {
    try {
      const response = await fetch(source.url, { 
        timeout: 5000,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        const rawData = await response.json();
        const data = source.transform(rawData);

        // Ensure YER rate exists
        if (!data.rates.YER) {
          data.rates.YER = 238.77;
        }

        return res.status(200).json({
          success: true,
          ...data,
          timestamp: new Date().toISOString()
        });
      }
    } catch (e) {
      console.warn(`Source ${source.name} failed:`, e.message);
      continue;
    }
  }

  // Ultimate fallback
  return res.status(503).json({
    success: false,
    error: 'All currency rate sources are unavailable',
    fallback: {
      base: base.toUpperCase(),
      rates: {
        USD: 1, EUR: 0.86, GBP: 0.75, JPY: 160, CNY: 6.77,
        SAR: 3.75, AED: 3.67, KWD: 0.31, QAR: 3.64, OMR: 0.38,
        BHD: 0.38, JOD: 0.71, YER: 238.77
      }
    }
  });
}
