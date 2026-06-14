#!/usr/bin/env python3
"""
ريال ودولار - جلب أسعار الذهب والفضة
نسخة مبسطة تعمل على Termux
"""
import requests
import json
from datetime import datetime
from pathlib import Path

# الإعدادات
TROY_OUNCE_GRAMS = 31.1035
KARAT_RATIOS = {24: 1.0, 22: 0.9167, 21: 0.875, 18: 0.75}

def fetch_metal_prices():
    """جلب أسعار الذهب والفضة من API مجاني"""
    try:
        # API مجاني بدون مفتاح
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
    
    # أسعار احتياطية
    return {
        "gold_ounce": 2345.50,
        "silver_ounce": 28.75,
        "source": "fallback"
    }

def get_yer_rate():
    """جلب سعر الصرف من الملف المحلي"""
    try:
        with open("yemen_rates.json", "r") as f:
            data = json.load(f)
            regions = data.get("regions", {})
            rates = []
            for r in regions.values():
                if "USD" in r and "buy" in r["USD"]:
                    rates.append(r["USD"]["buy"])
            if rates:
                return round(sum(rates) / len(rates))
    except:
        pass
    return 1500

# جلب البيانات
metals = fetch_metal_prices()
yer_rate = get_yer_rate()

# حسابات
gold_gram_24k = metals["gold_ounce"] / TROY_OUNCE_GRAMS
silver_gram = metals["silver_ounce"] / TROY_OUNCE_GRAMS

# بناء النتيجة
result = {
    "timestamp": datetime.now().isoformat(),
    "source": metals["source"],
    "usd_to_yer": yer_rate,
    "gold": {
        "ounce_usd": metals["gold_ounce"],
        "gram_24k_usd": round(gold_gram_24k, 2),
        "gram_21k_usd": round(gold_gram_24k * 0.875, 2),
        "gram_21k_yer": round(gold_gram_24k * 0.875 * yer_rate, 0),
        "gram_18k_usd": round(gold_gram_24k * 0.75, 2),
        "gram_18k_yer": round(gold_gram_24k * 0.75 * yer_rate, 0)
    },
    "silver": {
        "ounce_usd": metals["silver_ounce"],
        "gram_usd": round(silver_gram, 2),
        "gram_yer": round(silver_gram * yer_rate, 0)
    }
}

# حفظ
Path("api").mkdir(exist_ok=True)
with open("api/gold-prices.json", "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

# عرض
print("=" * 50)
print("🪙 أسعار الذهب والفضة - ريال ودولار")
print("=" * 50)
print(f"💵 سعر الصرف: {yer_rate:,} ر.ي / دولار")
print(f"📡 المصدر: {metals['source']}")
print(f"🥇 ذهب 21k: {result['gold']['gram_21k_yer']:,} ر.ي")
print(f"🥈 فضة: {result['silver']['gram_yer']:,} ر.ي")
print("=" * 50)
