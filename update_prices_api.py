#!/usr/bin/env python3
"""تحديث الأسعار - Open Exchange Rates API"""
import requests, json
from datetime import datetime

# مفتاح API مجاني (سجل من https://openexchangerates.org/signup/free)
API_KEY = "YOUR_APP_ID_HERE"
API_URL = f"https://open.er-api.com/v6/latest/USD"

def fetch_rates():
    """جلب أسعار الصرف"""
    try:
        r = requests.get(API_URL, timeout=10)
        if r.ok:
            data = r.json()
            rates = data["rates"]
            return {
                "YER": rates.get("YER", 1500),
                "SAR": rates.get("SAR", 3.75),
                "EUR": rates.get("EUR", 0.92),
                "GBP": rates.get("GBP", 0.79),
                "AED": rates.get("AED", 3.67),
                "KWD": rates.get("KWD", 0.31),
                "timestamp": data["time_last_update_utc"]
            }
    except:
        pass
    return None

def fetch_metals():
    """جلب أسعار الذهب والفضة"""
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
rates = fetch_rates()
metals = fetch_metals()

if not rates:
    print("❌ فشل جلب الأسعار")
    exit(1)

yer = rates["YER"]
gram_24k = metals["gold"] / 31.1035

data = {
    "metadata": {
        "app_name": "ريال ودولار",
        "last_updated": datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "source": "openexchangerates.org"
    },
    "rates": {
        "USD_YER": yer,
        "USD_SAR": rates["SAR"],
        "USD_EUR": rates["EUR"],
        "USD_GBP": rates["GBP"],
        "USD_AED": rates["AED"],
        "USD_KWD": rates["KWD"]
    },
    "gold": {
        "ounce_usd": metals["gold"],
        "gram_24k_usd": round(gram_24k, 2),
        "gram_21k_usd": round(gram_24k * 0.875, 2),
        "gram_21k_yer": round(gram_24k * 0.875 * yer, 0)
    },
    "silver": {
        "ounce_usd": metals["silver"],
        "gram_usd": round(metals["silver"] / 31.1035, 2),
        "gram_yer": round(metals["silver"] / 31.1035 * yer, 0)
    }
}

with open("api/prices_data.json", "w") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"✅ USD/YER: {yer:,} ر.ي")
print(f"🥇 ذهب 21k: {data['gold']['gram_21k_yer']:,} ر.ي")
print(f"🥈 فضة/جرام: {data['silver']['gram_yer']:,} ر.ي")
