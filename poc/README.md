# 餐廳資料生成器

用於生成測試 AI 分析功能的餐廳資料。

## 使用方法

1. **安裝依賴**
```bash
pip install -r requirements.txt
```

2. **執行腳本**
```bash
python restaurant_data_generator.py
```

腳本會自動讀取根目錄的 `.env` 檔案中的 `GOOGLE_API_KEY`。

## 輸出格式

資料會儲存在以下位置：
- **JSON 資料**: `poc/data/restaurant_test_data.json`
- **照片檔案**: `poc/data/photos/`

JSON 包含：
- **基本資訊**: 餐廳名稱、地址、評分
- **照片路徑**: 指向本地照片檔案
- **評論照片**: 使用者上傳的照片路徑
- **評論**: 文字評論和評分
- **營業時間**: 開店時間
- **價格等級**: 1-4 星

## 自訂設定

可以調整以下參數：
- `lat`, `lng`: 搜尋座標 (預設: 台北101)
- `num_restaurants`: 餐廳數量 (預設: 3)
- `keyword`: 搜尋關鍵字 (預設: "健身餐")

## 注意事項

- 照片儲存為實體檔案，節省空間且易於處理
- 建議只收集少量餐廳進行測試
- 請遵守 Google Places API 的使用條款 