#!/usr/bin/env python3
"""
ريال ودولار - API Server
يجمع أسعار الصرف من المواقع المحلية + أسعار الذهب العالمية
يعمل على http://localhost:5000
"""
import requests
from bs4 import BeautifulSoup
import json
import re
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
import os

# ============================================
# الجزء 1: جلب أسعار الصرف اليمنية
# ============================================
def scrape_yemen_rates():
    """جلب أسعار الصرف من المواقع المحلية"""
    rates = {
        "sanaa": {"name": "صنعاء", "USD": {"buy": 1500, "sell": 1510}},
        "aden": {"name": "عدن", "USD": {"buy": 1490, "sell": 1500}},
        "timestamp": datetime.now().isoformat()
    }
    
    urls = [
        "https://yemenrates.com/",
        "https://www.ye1.org/",
    ]
    
    for url in urls:
        try:
            response = requests.get(url, timeout=10, headers={
                "User-Agent": "Mozilla/5.0 (Android 13; Mobile) AppleWebKit/537.36"
            })
            if response.ok:
                soup = BeautifulSoup(response.text, 'html.parser')
                text = soup.get_text()
                
                # البحث عن أرقام بين 500 و 2000 (نطاق أسعار الريال)
                numbers = re.findall(r'(\d{3,4})', text)
                valid = [int(n) for n in numbers if 500 < int(n) < 2000]
                
                if len(valid) >= 2:
                    valid = sorted(set(valid))
                    rates["sanaa"]["USD"]["buy"] = valid[0]
                    rates["sanaa"]["USD"]["sell"] = valid[-1]
                    rates["source"] = url
                    break
        except:
            continue
    
    return rates


# ============================================
# الجزء 2: جلب أسعار الذهب العالمية
# ============================================
def fetch_gold_prices():
    """جلب أسعار الذهب من API مجاني"""
    TROY_OUNCE = 31.1035
    
    try:
        url = "https://api.metalpriceapi.com/v1/latest?api_key=demo&base=USD&currencies=XAU,XAG"
        r = requests.get(url, timeout=10)
        if r.ok:
            data = r.json()
            return {
                "gold_ounce": round(1 / data["rates"]["XAU"], 2),
                "silver_ounce": round(1 / data["rates"]["XAG"], 2),
                "source": "metalpriceapi"
            }
    except:
        pass
    
    return {
        "gold_ounce": 2345.50,
        "silver_ounce": 28.75,
        "source": "estimated"
    }


# ============================================
# الجزء 3: حساب الأسعار النهائية
# ============================================
def calculate_all_prices():
    """حساب جميع الأسعار"""
    # جلب البيانات
    yemen = scrape_yemen_rates()
    metals = fetch_gold_prices()
    
    # سعر الصرف (متوسط)
    sanaa_buy = yemen["sanaa"]["USD"]["buy"]
    aden_buy = yemen["aden"]["USD"]["buy"]
    yer_rate = round((sanaa_buy + aden_buy) / 2)
    
    # حسابات الذهب
    gram_24k = metals["gold_ounce"] / 31.1035
    gram_silver = metals["silver_ounce"] / 31.1035
    
    return {
        "timestamp": datetime.now().isoformat(),
        "source_yemen": yemen.get("source", "local"),
        "source_metals": metals["source"],
        "exchange_rate": {
            "usd_to_yer": yer_rate,
            "sanaa_buy": sanaa_buy,
            "sanaa_sell": yemen["sanaa"]["USD"]["sell"],
            "aden_buy": aden_buy,
            "aden_sell": yemen["aden"]["USD"]["sell"]
        },
        "gold": {
            "ounce_usd": metals["gold_ounce"],
            "gram_24k_usd": round(gram_24k, 2),
            "gram_22k_usd": round(gram_24k * 0.9167, 2),
            "gram_21k_usd": round(gram_24k * 0.875, 2),
            "gram_18k_usd": round(gram_24k * 0.75, 2),
            "gram_21k_yer": round(gram_24k * 0.875 * yer_rate, 0),
            "gram_18k_yer": round(gram_24k * 0.75 * yer_rate, 0)
        },
        "silver": {
            "ounce_usd": metals["silver_ounce"],
            "gram_usd": round(gram_silver, 2),
            "gram_yer": round(gram_silver * yer_rate, 0)
        }
    }


# ============================================
# الجزء 4: خادم HTTP بسيط
# ============================================
class APIHandler(BaseHTTPRequestHandler):
    def _set_headers(self, status=200, content_type="application/json"):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "max-age=60")
        self.end_headers()
    
    def do_GET(self):
        if self.path == "/" or self.path == "/api/prices":
            self._set_headers()
            prices = calculate_all_prices()
            self.wfile.write(json.dumps(prices, ensure_ascii=False, indent=2).encode())
        
        elif self.path == "/api/gold":
            self._set_headers()
            prices = calculate_all_prices()
            self.wfile.write(json.dumps(prices["gold"], ensure_ascii=False, indent=2).encode())
        
        elif self.path == "/api/silver":
            self._set_headers()
            prices = calculate_all_prices()
            self.wfile.write(json.dumps(prices["silver"], ensure_ascii=False, indent=2).encode())
        
        elif self.path == "/api/exchange-rate":
            self._set_headers()
            prices = calculate_all_prices()
            self.wfile.write(json.dumps(prices["exchange_rate"], ensure_ascii=False, indent=2).encode())
        
        elif self.path == "/api/health":
            self._set_headers()
            self.wfile.write(json.dumps({"status": "ok"}).encode())
        
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Not found"}).encode())
    
    def log_message(self, format, *args):
        print(f"📡 {args[0]}")


# ============================================
# التشغيل
# ============================================
def main():
    port = int(os.environ.get("PORT", 5000))
    server = HTTPServer(("0.0.0.0", port), APIHandler)
    
    print("=" * 50)
    print("🪙 ريال ودولار - API Server")
    print("=" * 50)
    print(f"🌐 http://localhost:{port}")
    print(f"📖 http://localhost:{port}/api/prices")
    print(f"🥇 http://localhost:{port}/api/gold")
    print(f"🥈 http://localhost:{port}/api/silver")
    print(f"💱 http://localhost:{port}/api/exchange-rate")
    print("=" * 50)
    
    # حفظ نسخة محلية
    prices = calculate_all_prices()
    with open("api/latest-prices.json", "w", encoding="utf-8") as f:
        json.dump(prices, f, ensure_ascii=False, indent=2)
    print("💾 تم حفظ api/latest-prices.json")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 تم إيقاف الخادم")

if __name__ == "__main__":
    main()
