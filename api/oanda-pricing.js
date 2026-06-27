// ============================================
// Vercel Serverless Function: OANDA Pricing Proxy v2
// Endpoint: POST /api/oanda-pricing
// ============================================

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  const OANDA_TOKEN = process.env.OANDA_ACCESS_TOKEN;
  const OANDA_ENV = process.env.OANDA_ENV || 'practice';

  if (!OANDA_TOKEN) {
    return res.status(500).json({ 
      success: false,
      error: 'OANDA_ACCESS_TOKEN not configured',
      setup: 'Add OANDA_ACCESS_TOKEN in Vercel Environment Variables'
    });
  }

  try {
    let { instruments } = req.body;

    if (!instruments) {
      return res.status(400).json({ success: false, error: 'instruments is required' });
    }

    // Handle both plain commas and URL-encoded %2C
    instruments = decodeURIComponent(instruments);

    // Validate format
    const instrumentList = instruments.split(',').map(s => s.trim()).filter(Boolean);
    if (instrumentList.length === 0) {
      return res.status(400).json({ success: false, error: 'Invalid instruments format. Use: EUR_USD,USD_JPY' });
    }

    const baseUrl = OANDA_ENV === 'live' 
      ? 'https://api-fxtrade.oanda.com/v3' 
      : 'https://api-fxpractice.oanda.com/v3';

    const accountId = process.env.OANDA_ACCOUNT_ID;
    if (!accountId) {
      return res.status(500).json({ success: false, error: 'OANDA_ACCOUNT_ID not configured' });
    }

    const url = `${baseUrl}/accounts/${accountId}/pricing?instruments=${encodeURIComponent(instruments)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OANDA_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept-Datetime-Format': 'RFC3339'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ 
        success: false,
        error: 'OANDA API error',
        status: response.status,
        details: errorText
      });
    }

    const data = await response.json();

    // Transform to clean unified format
    const prices = (data.prices || []).map(price => {
      const bid = parseFloat(price.bids?.[0]?.price || 0);
      const ask = parseFloat(price.asks?.[0]?.price || 0);
      const parts = price.instrument.split('_');
      return {
        instrument: price.instrument,
        base: parts[0],
        quote: parts[1],
        bid,
        ask,
        mid: bid && ask ? parseFloat(((bid + ask) / 2).toFixed(5)) : 0,
        spread: bid && ask ? parseFloat((ask - bid).toFixed(5)) : 0,
        time: price.time,
        status: price.status,
        tradeable: price.tradeable
      };
    });

    return res.status(200).json({
      success: true,
      source: 'oanda',
      environment: OANDA_ENV,
      account: accountId.slice(0, 8) + '...',
      prices,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('OANDA Proxy Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
