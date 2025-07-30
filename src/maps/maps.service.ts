import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class MapsService {
  constructor(private configService: ConfigService) {}

  async getNearbyRestaurants(
    lat: number,
    lng: number,
    options?: {
      radius?: number;
      type?: string;
      keyword?: string;
    },
  ) {
    const apiKey = this.configService.get<string>('GOOGLE_API_KEY');

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
      key: apiKey,
    };

    const res = await axios.get(url, { params });
    return res.data.results.map((place: any) => ({
      name: place.name,
      address: place.vicinity,
      rating: place.rating,
    }));
  }
}