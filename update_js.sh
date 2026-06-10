#!/bin/bash
# سكريبت تعديل js/app.js

FILE="js/app.js"

# 1. أضف دالة loadLocalRates بعد سطر 'use strict'
sed -i "/^'use strict';$/r /tmp/local_rates.js" "$FILE"

# 2. أضف استدعاء الدالة داخل DOMContentLoaded
# ابحث عن السطر الذي يحتوي على DOMContentLoaded وأضف بعده
sed -i "/DOMContentLoaded.*function/a\    loadLocalRates();\n    setInterval(loadLocalRates, 300000);" "$FILE"

echo "✅ تم تعديل js/app.js بنجاح"
