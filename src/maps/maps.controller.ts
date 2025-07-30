import { Controller, Get, Query } from '@nestjs/common';
import { MapsService } from './maps.service';

@Controller('maps')
export class MapsController {
    constructor(private readonly mapsService: MapsService) { }
    
    @Get('restaurants/nearby')
    async getNearbyRestaurants(
        @Query('lat') lat: string,
        @Query('lng') lng: string,
        @Query('radius') radius?: string,
        @Query('type') type?: string,
        @Query('keyword') keyword?: string,
    ) {
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);

        return this.mapsService.getNearbyRestaurants(latitude, longitude, {
            radius: radius ? parseInt(radius) : undefined,
            type,
            keyword,
        });
    }
}
