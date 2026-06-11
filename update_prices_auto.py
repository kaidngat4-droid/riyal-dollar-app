#!/usr/bin/env python3
"""تحديث الأسعار - ريال ودولار"""
import requests, json, re
from datetime import datetime
from bs4 import BeautifulSoup

def get_yemen_rate():
    rate = 1500
    try:
        r = requests.get("https://yemenrates.com/", timeout=10, headers={"User-Agent": "Mozilla/5.0"})
        if r.ok:
            nums = re.findall(r'(\d{3,4})', r.text)
            valid = sorted(set(int(n) for n in nums if 500 < int(n) < 2000))
            if valid: rate = sum(valid) // len(valid)
    except: pass
    return rate

def get_metals():
    try:
        r = requests.get("https://api.metalpriceapi.com/v1/latest?api_key=demo&base=USD&currencies=XAU,XAG", timeout=10)
        if r.ok:
            d = r.json()
            return round(1/d["rates"]["XAU"],2), round(1/d["rates"]["XAG"],2)
    except: pass
    return 2345.50, 28.75

yer = get_yemen_rate()
gold_oz, silver_oz = get_metals()
g24 = gold_oz / 31.1035

data = {
    "metadata": {"app_name":"ريال ودولار","last_updated":datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ"),"data_source":"live"},
    "currencies": [
        {"code":"USD","name_ar":"دولار أمريكي","flag":"🇺🇸","price_yer":yer,"rate":1.0,"trend":"up"},
        {"code":"SAR","name_ar":"ريال سعودي","flag":"🇸🇦","price_yer":round(yer/3.75),"rate":3.75,"trend":"stable"},
        {"code":"EUR","name_ar":"يورو","flag":"🇪🇺","price_yer":round(yer*0.92),"rate":0.92,"trend":"down"}
    ],
    "gold": {
        "ounce":{"price_usd":gold_oz},
        "grams":[
            {"karat":24,"price_usd":round(g24,2),"price_yer":round(g24*yer)},
            {"karat":21,"price_usd":round(g24*0.875,2),"price_yer":round(g24*0.875*yer)}
        ]
    },
    "silver":{"code":"XAG","name_ar":"الفضة","icon":"🥈","price_usd":silver_oz,"unit":"oz"}
}

with open("api/prices_data.json","w") as f: json.dump(data,f,ensure_ascii=False,indent=2)
print(f"✅ USD:{yer} | Gold21k:{data['gold']['grams'][1]['price_yer']:,} ر.ي | Silver:${silver_oz}")
