import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AnalysisService {
  constructor(private configService: ConfigService) {}

  /**
   * 分析餐廳營養資料
   * @param analysisData 包含照片和評論的分析資料
   * @returns 營養分析結果
   */
  async analyzeRestaurantNutrition(analysisData: {
    photos: string[];
    reviews: string[];
    restaurantInfo: {
      name: string;
      types: string[];
      rating: number;
      address: string;
    };
  }) {
    // TODO: 呼叫 AI 服務進行分析
    // 1. 電腦視覺分析照片中的餐點
    // 2. 文字分析評論中的餐點描述
    // 3. 營養成分推算
    
    // 暫時回傳模擬資料
    return {
      restaurantName: analysisData.restaurantInfo.name,
      analyzedDishes: [],
      nutritionSummary: {
        totalCalories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0
      },
      analysisStatus: 'pending'
    };
  }

  /**
   * 分析單一餐點的營養成分
   * @param dishName 餐點名稱
   * @param dishImage 餐點照片 (可選)
   * @returns 營養分析結果
   */
  async analyzeDishNutrition(dishName: string, dishImage?: string) {
    // TODO: 實作餐點營養分析
    return {
      dishName,
      nutrition: {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0
      }
    };
  }
} 