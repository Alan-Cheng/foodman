import json
import requests
import os
from datetime import datetime
import base64
from dotenv import load_dotenv
import urllib3

# 載入根目錄的 .env 檔案
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# 停用 SSL 警告 (僅用於開發環境)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class RestaurantDataGenerator:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://maps.googleapis.com/maps/api/place"
        
    def search_nearby_restaurants(self, lat, lng, radius=1000, keyword="健身餐"):
        """搜尋附近餐廳"""
        url = f"{self.base_url}/nearbysearch/json"
        params = {
            'location': f"{lat},{lng}",
            'radius': radius,
            'type': 'restaurant',
            'keyword': keyword,
            'key': self.api_key
        }
        
        response = requests.get(url, params=params, verify=False)
        return response.json()
    
    def get_restaurant_details(self, place_id):
        """取得餐廳詳細資訊"""
        url = f"{self.base_url}/details/json"
        params = {
            'place_id': place_id,
            'fields': 'name,formatted_address,rating,reviews,photos,opening_hours,price_level,user_ratings_total,types',
            'key': self.api_key
        }
        
        response = requests.get(url, params=params, verify=False)
        return response.json()
    
    def download_photo(self, photo_reference, max_width=400, photo_dir="data/photos", restaurant_name="unknown"):
        """下載照片並儲存為檔案"""
        url = f"{self.base_url}/photo"
        params = {
            'photo_reference': photo_reference,
            'maxwidth': max_width,
            'key': self.api_key
        }
        
        response = requests.get(url, params=params, verify=False)
        if response.status_code == 200:
            # 建立照片目錄
            os.makedirs(photo_dir, exist_ok=True)
            
            # 清理餐廳名稱，移除特殊字元
            import re
            clean_name = re.sub(r'[^\w\s-]', '', restaurant_name).strip()
            clean_name = re.sub(r'[-\s]+', '_', clean_name)
            
            # 使用 hash 生成較短的檔案名稱
            import hashlib
            filename_hash = hashlib.md5(photo_reference.encode()).hexdigest()[:8]
            filename = f"{clean_name}_{filename_hash}_{max_width}.jpg"
            filepath = os.path.join(photo_dir, filename)
            
            # 儲存照片
            with open(filepath, 'wb') as f:
                f.write(response.content)
            
            return {
                'file_path': filepath,
                'photo_reference': photo_reference,
                'width': max_width
            }
        return None
    
    def generate_sample_data(self, lat=25.0330, lng=121.5654, num_restaurants=5):
        """生成測試資料"""
        print("搜尋附近餐廳...")
        nearby_result = self.search_nearby_restaurants(lat, lng)
        
        if nearby_result.get('status') != 'OK':
            print(f"搜尋失敗: {nearby_result.get('status')}")
            return
        
        restaurants = []
        place_ids = [place['place_id'] for place in nearby_result['results'][:num_restaurants]]
        
        for i, place_id in enumerate(place_ids):
            print(f"處理餐廳 {i+1}/{len(place_ids)}...")
            
            details_result = self.get_restaurant_details(place_id)
            if details_result.get('status') != 'OK':
                continue
                
            details = details_result['result']
            
            # 處理照片
            photos_data = []
            if 'photos' in details:
                for photo in details['photos'][:3]:  # 最多3張照片
                    photo_data = self.download_photo(photo['photo_reference'], restaurant_name=details.get('name', 'unknown'))
                    if photo_data:
                        photos_data.append({
                            'file_path': photo_data['file_path'],
                            'photo_reference': photo_data['photo_reference'],
                            'width': photo.get('width'),
                            'height': photo.get('height')
                        })
            
            # 處理評論照片
            review_photos = []
            if 'reviews' in details:
                for review in details['reviews'][:5]:  # 最多5個評論
                    if 'photos' in review:
                        for photo in review['photos'][:2]:  # 每個評論最多2張照片
                            photo_data = self.download_photo(photo['photo_reference'], restaurant_name=details.get('name', 'unknown'))
                            if photo_data:
                                review_photos.append({
                                    'file_path': photo_data['file_path'],
                                    'photo_reference': photo_data['photo_reference'],
                                    'review_text': review.get('text', ''),
                                    'rating': review.get('rating', 0)
                                })
            
            restaurant_data = {
                'place_id': place_id,
                'name': details.get('name', ''),
                'address': details.get('formatted_address', ''),
                'rating': details.get('rating', 0),
                'user_ratings_total': details.get('user_ratings_total', 0),
                'price_level': details.get('price_level', 0),
                'types': details.get('types', []),
                'photos': photos_data,
                'review_photos': review_photos,
                'reviews': [
                    {
                        'text': review.get('text', ''),
                        'rating': review.get('rating', 0),
                        'time': review.get('time', 0)
                    }
                    for review in details.get('reviews', [])[:10]  # 最多10個評論
                ],
                'opening_hours': details.get('opening_hours', {}),
                'collected_at': datetime.now().isoformat()
            }
            
            restaurants.append(restaurant_data)
        
        return restaurants
    
    def save_to_json(self, data, filename="restaurant_test_data.json"):
        """儲存資料到JSON檔案"""
        os.makedirs('data', exist_ok=True)
        filepath = f"data/{filename}"
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"資料已儲存到: {filepath}")
        return filepath

def main():
    # 從 .env 檔案讀取 API Key
    api_key = os.getenv('GOOGLE_API_KEY')
    
    if not api_key:
        print("請在 .env 檔案中設定 GOOGLE_API_KEY")
        print("範例: GOOGLE_API_KEY=your_api_key_here")
        return
    
    generator = RestaurantDataGenerator(api_key)
    
    # 台北101附近的餐廳 (可以調整座標)
    restaurants = generator.generate_sample_data(
        lat=25.0330, 
        lng=121.5654, 
        num_restaurants=3
    )
    
    if restaurants:
        filepath = generator.save_to_json(restaurants)
        print(f"成功收集 {len(restaurants)} 間餐廳的資料")
        print(f"資料檔案: {filepath}")
    else:
        print("沒有收集到任何餐廳資料")

if __name__ == "__main__":
    main() 