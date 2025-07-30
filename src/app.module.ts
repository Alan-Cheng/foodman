import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MapsModule } from './maps/maps.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
    isGlobal: true, // 讓所有 module 都能用
    }),
    MapsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
