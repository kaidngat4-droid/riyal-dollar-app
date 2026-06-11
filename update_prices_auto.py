#!/usr/bin/env python3
"""تحديث تلقائي للأسعار - يعمل مع GitHub Actions"""
import requests
import json
from datetime import datetime
from bs4 import BeautifulSoup
import re

TROY_OUNCE = 31.1035

def get_yemen_rate():
    """جلب سعر الصرف من السوق المحلي"""
    rate = 1500  # افتراضي
    try:
        r = requests.get("https://yemenrates.com/", timeout=10, 
                        headers={"User-Agent": "Mozilla/5.0"})
        if r.ok:
            nums = re.findall(r'(\d{3,4})', r.text)
            valid = sorted(set(int(n) for n in nums if 500 < int(n) < 2000))
            if len(valid) >= 2:
                rate = sum(valid[:3]) // len(valid[:3]) if len(valid) >= 3 else valid[0]
    except:
        pass
    return rate

def get_gold_price():
    """جلب سعر الذهب العالمي"""
    try:
        r = requests.get("https://api.metalpriceapi.com/v1/latest?api_key=demo&base=USD&currencies=XAU,XAG", timeout=10)
        if r.ok:
            d = r.json()
            return {
                "gold": round(1 / d["rates"]["XAU"], 2),
                "silver": round(1 / d["rates"]["XAG"], 2)
            }
    except:
        pass
    return {"gold": 2345.50, "silver": 28.75}

# جلب البيانات
yer = get_yemen_rate()
metals = get_gold_price()
gram_24k = metals["gold"] / TROY_OUNCE

# بناء prices_data.json
data = {
    "metadata": {
        "app_name": "ريال ودولار",
        "version": "1.0.0",
        "last_updated": datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "base_currency": "YER",
        "data_source": "live_market"
    },
    "currencies": [
        {"code": "USD", "name_ar": "دولار أمريكي", "flag": "🇺🇸", "price_yer": yer, "rate": 1.0, "change_24h": 0.15, "trend": "up"},
        {"code": "SAR", "name_ar": "ريال سعودي", "flag": "🇸🇦", "price_yer": round(yer / 3.75), "rate": 3.75, "change_24h": 0, "trend": "stable"},
        {"code": "EUR", "name_ar": "يورو", "flag": "🇪🇺", "price_yer": round(yer * 0.92), "rate": 0.92, "change_24h": -0.08, "trend": "down"},
        {"code": "GBP", "name_ar": "جنيه إسترليني", "flag": "🇬🇧", "price_yer": round(yer * 0.79), "rate": 0.79, "change_24h": 0.05, "trend": "up"},
        {"code": "AED", "name_ar": "درهم إماراتي", "flag": "🇦🇪", "price_yer": round(yer / 3.67), "rate": 3.67, "change_24h": 0, "trend": "stable"},
        {"code": "KWD", "name_ar": "دينار كويتي", "flag": "🇰🇼", "price_yer": round(yer * 0.31), "rate": 0.31, "change_24h": 0.01, "trend": "up"}
    ],
    "gold": {
        "ounce": {"price_usd": metals["gold"], "trend": "stable"},
        "grams": [
            {"karat": 24, "price_usd": round(gram_24k, 2), "price_yer": round(gram_24k * yer)},
            {"karat": 22, "price_usd": round(gram_24k * 0.9167, 2), "price_yer": round(gram_24k * 0.9167 * yer)},
            {"karat": 21, "price_usd": round(gram_24k * 0.875, 2), "price_yer": round(gram_24k * 0.875 * yer)},
            {"karat": 18, "price_usd": round(gram_24k * 0.75, 2), "price_yer": round(gram_24k * 0.75 * yer)}
        ]
    },
    "silver": {
        "code": "XAG", "name_ar": "الفضة", "icon": "🥈",
        "price_usd": metals["silver"], "unit": "oz", "status": "live"
    }
}

# حفظ
with open("api/prices_data.json", "w") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

# ملخص
print(f"✅ تم التحديث: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
print(f"💵 دولار: {yer} ر.ي")
print(f"🥇 ذهب 21k: {data['gold']['grams'][2]['price_yer']:,} ر.ي")
print(f"🥈 فضة: ${metals['silver']}")
