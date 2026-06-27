// ============================================
// Vercel Serverless Function: Metals Price Proxy
// Endpoint: /api/metals
// Sources: gold-api.com (free, no key, CORS enabled)
// ============================================

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // Fetch from multiple free sources in parallel
    const [goldRes, silverRes, platinumRes, palladiumRes] = await Promise.allSettled([
      fetch('https://gold-api.com/price/XAU', { timeout: 5000 }),
      fetch('https://gold-api.com/price/XAG', { timeout: 5000 }),
      fetch('https://gold-api.com/price/XPT', { timeout: 5000 }),
      fetch('https://gold-api.com/price/XPD', { timeout: 5000 })
    ]);

    const parseMetal = (result, defaultPrice) => {
      if (result.status === 'fulfilled' && result.value.ok) {
        return result.value.json().catch(() => null);
      }
      return Promise.resolve(null);
    };

    const [goldData, silverData, platinumData, palladiumData] = await Promise.all([
      parseMetal(goldRes, 2344),
      parseMetal(silverRes, 28.8),
      parseMetal(platinumRes, 1031),
      parseMetal(palladiumRes, 961)
    ]);

    const now = new Date().toISOString();

    const response = {
      success: true,
      timestamp: now,
      source: 'gold-api.com',
      gold: {
        ounce: {
          price_usd: goldData?.price || 2344,
          change_24h: goldData?.change || 0,
          change_pct: goldData?.change_percent || 0,
          high_24h: goldData?.high || (goldData?.price || 2344),
          low_24h: goldData?.low || (goldData?.price || 2344)
        },
        gram: {
          price_usd: (goldData?.price || 2344) / 31.1035
        }
      },
      silver: {
        ounce: {
          price_usd: silverData?.price || 28.8,
          change_24h: silverData?.change || 0,
          change_pct: silverData?.change_percent || 0
        },
        gram: {
          price_usd: (silverData?.price || 28.8) / 31.1035
        }
      },
      platinum: {
        ounce: {
          price_usd: platinumData?.price || 1031,
          change_24h: platinumData?.change || 0,
          change_pct: platinumData?.change_percent || 0
        }
      },
      palladium: {
        ounce: {
          price_usd: palladiumData?.price || 961,
          change_24h: palladiumData?.change || 0,
          change_pct: palladiumData?.change_percent || 0
        }
      },
      // Calculated karat prices per gram in USD
      karats: {
        '24k': ((goldData?.price || 2344) / 31.1035),
        '22k': ((goldData?.price || 2344) / 31.1035) * 0.916,
        '21k': ((goldData?.price || 2344) / 31.1035) * 0.875,
        '18k': ((goldData?.price || 2344) / 31.1035) * 0.750
      }
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('Metals Proxy Error:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
