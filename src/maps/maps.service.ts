import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class MapsService {
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GOOGLE_API_KEY');
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY is not configured');
    }
    this.apiKey = apiKey;
  }

  /**
   * 取得附近餐廳列表
   * @param lat 緯度
   * @param lng 經度
   * @param options 搜尋選項
   * @param options.radius 搜尋半徑 (公尺，預設 1000)
   * @param options.type 場所類型 (預設 'restaurant')
   * @param options.keyword 關鍵字搜尋 (預設 '健身餐')
   * @returns 餐廳列表，包含基本資訊和 placeId
   */
  async getNearbyRestaurants(
    lat: number,
    lng: number,
    options?: {
      radius?: number;
      type?: string;
      keyword?: string;
    },
  ) {
    const {
      radius = 1000,
      type = 'restaurant',
      keyword = '健身餐',
    } = options || {};

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`;
    const params = {
      location: `${lat},${lng}`,
      radius,
      type,
      keyword,
      key: this.apiKey,
    };

    const res = await axios.get(url, { params });
    return res.data.results.map((place: any) => ({
      name: place.name,
      address: place.vicinity,
      rating: place.rating,
      placeId: place.place_id,
    }));
  }

  /**
   * 取得餐廳詳細資訊，包含評論
   * @param placeId Google Places API 的 place_id
   * @returns 餐廳詳細資訊，包含評論、照片、營業時間等
   */
  async getRestaurantDetails(placeId: string) {
    const url = `https://maps.googleapis.com/maps/api/place/details/json`;
    const params = {
      place_id: placeId,
      fields: 'name,formatted_address,rating,reviews,photos,opening_hours,price_level,user_ratings_total,types',
      key: this.apiKey,
    };

    const res = await axios.get(url, { params });
    return res.data.result;
  }

  /**
   * 準備餐廳營養分析資料
   * @param placeId Google Places API 的 place_id
   * @returns 準備好的分析資料，供營養分析服務使用
   */
  async prepareNutritionAnalysisData(placeId: string) {
    const details = await this.getRestaurantDetails(placeId);
    
    return {
      photos: [
        ...(details.photos?.map(photo => photo.photo_reference) || []),
        ...(details.reviews?.flatMap(review => review.photos?.map(p => p.photo_reference) || []) || [])
      ],
      reviews: details.reviews?.map(review => review.text) || [],
      restaurantInfo: {
        name: details.name,
        types: details.types,
        rating: details.rating,
        address: details.formatted_address
      }
    };
  }
}